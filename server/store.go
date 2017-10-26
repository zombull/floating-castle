package server

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"sort"
	"strconv"
	"strings"
	"unicode"

	"github.com/labstack/echo"

	"github.com/zombull/floating-castle/bug"
	"github.com/zombull/floating-castle/database"
	"github.com/zombull/floating-castle/moonboard"
)

type KeyValueStore struct {
	root string
	dir  string
	data map[string][]byte
	sums map[string][]byte
	// client *redis.Client
}

func newStore(root string) *KeyValueStore {
	s := KeyValueStore{
		dir:  root,
		data: make(map[string][]byte),
		sums: make(map[string][]byte),
	}

	dataDir := path.Join(s.dir, "data")

	infos, err := ioutil.ReadDir(dataDir)
	bug.OnError(err)

	for _, fi := range infos {
		if fi.Mode().IsRegular() {
			name := path.Join(dataDir, fi.Name())

			if strings.HasSuffix(fi.Name(), ".json") {
				s.data[strings.Replace(strings.TrimSuffix(fi.Name(), ".json"), ".", ":", -1)], err = ioutil.ReadFile(name)
				bug.OnError(err)
			} else if strings.HasSuffix(fi.Name(), ".md5") {
				s.sums[strings.Replace(strings.TrimSuffix(fi.Name(), ".md5"), ".", ":", -1)], err = ioutil.ReadFile(name)
				bug.OnError(err)
			}
		}
	}

	// s.client = redis.NewClient(&redis.Options{
	// 	Addr:     "127.0.0.1:6379",
	// 	Password: "", // no password set
	// 	DB:       0,  // use default DB
	// })

	// _, err := s.client.Ping().Result()
	// bug.OnError(err)

	return &s
}

const internalServerError = "I'm freakin' out, man!  Please try again at a later time."

func (s *KeyValueStore) get(c echo.Context, key, notFound string) error {
	val, ok := s.data[key]
	if !ok && len(notFound) > 0 {
		return echo.NewHTTPError(http.StatusNotFound, notFound)
	} else if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, internalServerError)
	}
	return c.JSONBlob(http.StatusOK, val)

	// val, err := s.client.Get(key).Result()
	// if err == redis.Nil && len(notFound) > 0 {
	// 	return echo.NewHTTPError(http.StatusNotFound, notFound)
	// } else if err != nil {
	// 	return echo.NewHTTPError(http.StatusInternalServerError, internalServerError)
	// }
	// return c.JSONBlob(http.StatusOK, []byte(val))
}

func (s *KeyValueStore) getInternal(key string) func(c echo.Context) error {
	return func(c echo.Context) error {
		return s.get(c, key, "")
	}
}

func (s *KeyValueStore) getTicks(host string) func(c echo.Context) error {
	return func(c echo.Context) error {
		return s.get(c, "ticks:"+host, fmt.Sprintf("Did not find any ticks for '%s'", host))
	}
}

func (s *KeyValueStore) getCrag(c echo.Context) error {
	crag := c.Param("crag")
	return s.get(c, "crag:"+crag, fmt.Sprintf("The crag '%s' was not found.", crag))
}

func (s *KeyValueStore) getArea(c echo.Context) error {
	crag := c.Param("crag")
	area := c.Param("area")
	return s.get(c, "area:"+crag+":a:"+area, fmt.Sprintf("The area '%s' was not found in %s.", area, crag))
}

func (s *KeyValueStore) getRoute(c echo.Context) error {
	crag := c.Param("crag")
	route := c.Param("route")
	return s.get(c, "route:"+crag+":"+route, fmt.Sprintf("The route '%s' was not found in %s.", route, crag))
}

func (s *KeyValueStore) getProblem(c echo.Context) error {
	set := c.Param("set")
	problem := c.Param("problem")
	return s.get(c, "problem:"+set+":"+problem, fmt.Sprintf("The problem '%s' was not found in Moonboard set %s.", problem, set))
}

func checksum(b []byte) []byte {
	return []byte(fmt.Sprintf("%x", md5.Sum(b)))
}

func sanitize(s string) string {
	return strings.ToLower(strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, s))
}

type holds struct {
	Start        []string `json:"s"`
	Intermediate []string `json:"i"`
	Finish       []string `json:"f"`
}

type moonEntry struct {
	Url           string `json:"u"`
	Name          string `json:"n"`
	LowerCaseName string `json:"l"`
	Id            int    `json:"i"` // index into moonData, not database ID or moonboard ID
	Date          string `json:"d,omitempty"`
	Nickname      string `json:"k,omitempty"`
	Holds         *holds `json:"h,omitempty"`
	Problems      []int  `json:"p,omitempty"`
	Setter        int    `json:"e,omitempty"`
	Grade         string `json:"g,omitempty"`
	Stars         uint   `json:"s,omitempty"`
	Ascents       uint   `json:"a,omitempty"`
	Benchmark     bool   `json:"b,omitempty"`
	Comment       string `json:"c,omitempty"`
}

type moonData struct {
	Index    []moonEntry    `json:"i"`
	Problems map[string]int `json:"p"`
	Setters  map[string]int `json:"s"`
	Images   []string       `json:"img"`
}

type moonTick struct {
	Problem  int    `json:"p"`
	Date     string `json:"d"`
	Grade    string `json:"g"`
	Stars    uint   `json:"s"`
	Attempts uint   `json:"a"`
	Sessions uint   `json:"e,omitempty"`
}

func getProblemUrl(s string) string {
	ss := strings.Split(strings.Trim(s, "/"), "/")
	s = ss[len(ss)-1]
	bug.On(len(s) == 0, fmt.Sprintf("%d %v", len(ss), ss))
	bug.On(s != strings.ToLower(s), "Moonboard has a case sensitive URL?")
	return s
}

func getSetterUrl(s string) string {
	return "s/" + url.PathEscape(sanitize(s))
}

func (s *KeyValueStore) update(d *database.Database) {
	ticks := make(map[int]moonTick, 0)

	setters := d.GetSetters(moonboard.Id(d))
	bug.On(len(setters) == 0, fmt.Sprintf("No moonboard setters found: %d", moonboard.Id(d)))

	routes := d.GetAllRoutes(moonboard.Id(d))
	bug.On(len(routes) == 0, fmt.Sprintf("No moonboard routes found: %d", moonboard.Id(d)))

	nr := len(routes)
	md := moonData{
		Index:    make([]moonEntry, nr, len(setters)+nr),
		Problems: make(map[string]int),
		Setters:  make(map[string]int),
		Images:   make([]string, 150),
	}

	for _, r := range setters {
		e := moonEntry{
			Url:           getSetterUrl(r.Name),
			Name:          r.Name,
			Nickname:      r.Nickname,
			LowerCaseName: strings.ToLower(r.Name),
			Problems:      make([]int, 0),
		}
		if _, ok := md.Setters[e.Url]; !ok {
			e.Id = len(md.Index)
			md.Setters[e.Url] = e.Id
			md.Index = append(md.Index, e)
		}
	}

	sort.Slice(routes, func(i, j int) bool {
		p1 := routes[i]
		p2 := routes[j]

		// Note that the return is inverted from what might be expected
		// by a "Less" function, as we effectively want a reverse sort,
		// e.g. higher stars and ascents at the front of the list.  And
		// don't forget that Pitches is actualy Ascents, we're sorting
		// routes from the database, not the Moonboard specific problems.
		if p1.Pitches < 50 && p2.Pitches > 200 || p1.Pitches < 50 && p2.Pitches > 100 && p2.Stars > 1 {
			return false
		} else if p1.Pitches > 200 && p2.Pitches < 50 || p1.Pitches > 100 && p2.Pitches < 50 && p1.Stars > 1 {
			return true
		} else if p1.Stars == p2.Stars {
			return p1.Pitches > p2.Pitches
		}
		return p1.Stars > p2.Stars
	})

	for i, r := range routes {
		sn := d.GetSetter(r.SetterId).Name
		setter, ok := md.Setters[getSetterUrl(d.GetSetter(r.SetterId).Name)]
		bug.On(!ok, fmt.Sprintf("Moonboard problem has undefined setter: %s", sn))

		e := moonEntry{
			Url:           getProblemUrl(r.Url),
			Name:          r.Name,
			LowerCaseName: strings.ToLower(r.Name),
			Date:          r.Date.Format("January 02, 2006"),
			Setter:        setter,
			Grade:         r.Grade,
			Stars:         r.Stars,
			Id:            i,
			Ascents:       r.Pitches,
			Benchmark:     r.Benchmark,
			Comment:       r.Comment,
			// MoonId:            r.Length,
		}

		e.Holds = &holds{
			Start:        make([]string, 0),
			Intermediate: make([]string, 0),
			Finish:       make([]string, 0),
		}

		h2 := d.GetHolds(r.Id)
		for _, v := range h2.Holds {
			h := string(v[1:])
			if string(v[0]) == "s" {
				e.Holds.Start = append(e.Holds.Start, h)
			} else if string(v[0]) == "f" {
				e.Holds.Finish = append(e.Holds.Finish, h)
			} else {
				e.Holds.Intermediate = append(e.Holds.Intermediate, h)
			}
		}
		bug.On(len(e.Holds.Start) == 0, "No start hold found")
		bug.On(len(e.Holds.Finish) == 0, "No finish hold found")

		// Sort the holds so that the checksum is stable.
		sort.Strings(e.Holds.Start)
		sort.Strings(e.Holds.Intermediate)
		sort.Strings(e.Holds.Finish)

		if _, ok = md.Problems[e.Url]; ok {
			e.Url = fmt.Sprintf("%d-%s", e.Id, e.Url)
			fmt.Printf("Duplicate Moonboard problem, new URL: %s\n", e.Url)
			_, ok = md.Problems[e.Url]
		}
		bug.On(ok, fmt.Sprintf("Duplicate Moonboard problem URL: %s", e.Url))
		md.Problems[e.Url] = i

		md.Index[i] = e
		md.Index[setter].Problems = append(md.Index[setter].Problems, i)

		t := d.GetTicks(r.Id)
		if len(t) > 0 {
			mt := moonTick{
				Problem:  i,
				Date:     t[0].Date.Format("January 02, 2006"),
				Grade:    t[0].Grade,
				Stars:    t[0].Stars,
				Attempts: t[0].Attempts,
			}
			if t[0].Sessions > 0 {
				mt.Sessions = t[0].Sessions
			}
			ticks[i] = mt
		}
	}

	imgDir := path.Join(s.dir, "moonboard", "img")
	for i := 0; i < 150; i++ {
		if i > 40 && i < 50 {
			continue
		}
		n := "board"
		if i > 0 {
			n = strconv.Itoa(i)
		}
		img, err := ioutil.ReadFile(path.Join(imgDir, n+".png"))
		bug.OnError(err)

		md.Images[i] = base64.StdEncoding.EncodeToString(img)
	}
	dataDir := path.Join(s.dir, "data")

	b, err := json.Marshal(md)
	bug.OnError(err)
	s.data["moonboard"] = b
	s.sums["moonboard"] = checksum(b)
	err = ioutil.WriteFile(path.Join(dataDir, "moonboard.json"), b, 0644)
	bug.OnError(err)
	err = ioutil.WriteFile(path.Join(dataDir, "moonboard.md5"), checksum(b), 0644)
	bug.OnError(err)

	b, err = json.Marshal(ticks)
	bug.OnError(err)
	s.data["ticks:moonboard"] = b
	s.sums["ticks:moonboard"] = checksum(b)
	err = ioutil.WriteFile(path.Join(dataDir, "ticks.moonboard.json"), b, 0644)
	bug.OnError(err)
	err = ioutil.WriteFile(path.Join(dataDir, "ticks.moonboard.md5"), checksum(b), 0644)
	bug.OnError(err)
}

type betaEntry struct {
	Name          string `json:"n"`
	LowerCaseName string `json:"l"`
	Url           string `json:"u"`
	Grade         string `json:"g,omitempty"`
	Pitches       uint   `json:"p,omitempty"`
	Stars         uint   `json:"s,omitempty"`
	Types         string `json:"t,omitempty"` // bstar = Boulder+Sport+Trade+Aid+topRope
	Difficulty    uint   `json:"d,omitempty"`
}
