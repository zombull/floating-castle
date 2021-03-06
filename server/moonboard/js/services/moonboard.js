/**
 * Service for interacting with the actual board.
*/
moon.factory('moonboard', function ($q, $document, database) {
    'use strict';

    var board = {
        holds: [
            { img: 1, loc: 'J10', dir: 'E' },
            { img: 2, loc: 'J8', dir: 'N' },
            { img: 4, loc: 'G1', dir: 'E' },
            { img: 5, loc: 'H6', dir: 'N' },
            { img: 6, loc: 'A13', dir: 'E' },
            { img: 7, loc: 'B17', dir: 'N' },
            { img: 8, loc: 'C3', dir: 'W' },
            { img: 11, loc: 'F16', dir: 'N' },
            { img: 12, loc: 'C8', dir: 'N' },
            { img: 13, loc: 'C5', dir: 'S' },
            { img: 14, loc: 'E2', dir: 'S' },
            { img: 15, loc: 'J1', dir: 'N' },
            { img: 16, loc: 'I17', dir: 'N' },
            { img: 18, loc: 'B6', dir: 'N' },
            { img: 19, loc: 'C2', dir: 'S' },
            { img: 20, loc: 'B16', dir: 'NE' },
            { img: 21, loc: 'H4', dir: 'SE' },
            { img: 22, loc: 'C15', dir: 'NW' },
            { img: 23, loc: 'J3', dir: 'NE' },
            { img: 25, loc: 'A9', dir: 'N' },
            { img: 26, loc: 'F11', dir: 'NE' },
            { img: 27, loc: 'I14', dir: 'E' },
            { img: 28, loc: 'K18', dir: 'N' },
            { img: 29, loc: 'H2', dir: 'S' },
            { img: 30, loc: 'G18', dir: 'N' },
            { img: 31, loc: 'D11', dir: 'NW' },
            { img: 32, loc: 'F14', dir: 'N' },
            { img: 33, loc: 'F13', dir: 'W' },
            { img: 34, loc: 'F10', dir: 'SW' },
            { img: 35, loc: 'C4', dir: 'N' },
            { img: 36, loc: 'K5', dir: 'SW' },
            { img: 37, loc: 'K12', dir: 'N' },
            { img: 38, loc: 'D1', dir: 'W' },
            { img: 40, loc: 'B7', dir: 'N' },

            { img: 41, loc: 'E13', dir: 'N' }, // actualy #201

            { img: 51, loc: 'K17', dir: 'NE' },
            { img: 52, loc: 'G17', dir: 'N' },
            { img: 53, loc: 'D17', dir: 'N' },
            { img: 54, loc: 'I12', dir: 'E' },
            { img: 56, loc: 'F4', dir: 'N' },
            { img: 57, loc: 'K3', dir: 'SE' },
            { img: 58, loc: 'A16', dir: 'NW' },
            { img: 59, loc: 'J4', dir: 'N' },
            { img: 60, loc: 'A15', dir: 'N' },
            { img: 61, loc: 'B2', dir: 'SW' },
            { img: 62, loc: 'K1', dir: 'SE' },
            { img: 63, loc: 'E6', dir: 'N' },
            { img: 64, loc: 'F2', dir: 'S' },
            { img: 65, loc: 'G3', dir: 'N' },
            { img: 66, loc: 'B4', dir: 'N' },
            { img: 67, loc: 'B1', dir: 'S' },
            { img: 68, loc: 'B14', dir: 'E' },
            { img: 69, loc: 'J7', dir: 'SE' },
            { img: 70, loc: 'A3', dir: 'N' },
            { img: 71, loc: 'I5', dir: 'SE' },
            { img: 72, loc: 'H9', dir: 'N' },
            { img: 73, loc: 'B8', dir: 'SW' },
            { img: 74, loc: 'E11', dir: 'SE' },
            { img: 75, loc: 'E8', dir: 'N' },
            { img: 76, loc: 'A11', dir: 'N' },
            { img: 77, loc: 'A18', dir: 'N' },
            { img: 78, loc: 'G14', dir: 'N' },
            { img: 79, loc: 'G6', dir: 'NE' },
            { img: 80, loc: 'K15', dir: 'E' },
            { img: 82, loc: 'C10', dir: 'W' },
            { img: 83, loc: 'D9', dir: 'NW' },
            { img: 84, loc: 'K13', dir: 'NE' },
            { img: 85, loc: 'H1', dir: 'SE' },
            { img: 86, loc: 'I8', dir: 'NE' },
            { img: 87, loc: 'F5', dir: 'N' },
            { img: 88, loc: 'I16', dir: 'NW' },
            { img: 89, loc: 'H10', dir: 'E' },
            { img: 90, loc: 'C13', dir: 'NW' },
            { img: 91, loc: 'H18', dir: 'N' },
            { img: 99, loc: 'G7', dir: 'NW' },
            { img: 100, loc: 'D3', dir: 'SW' },
            { img: 102, loc: 'C1', dir: 'S' },
            { img: 103, loc: 'H17', dir: 'N' },
            { img: 105, loc: 'H14', dir: 'N' },
            { img: 106, loc: 'H15', dir: 'N' },
            { img: 107, loc: 'K16', dir: 'NE' },
            { img: 108, loc: 'K8', dir: 'N' },
            { img: 109, loc: 'F1', dir: 'S' },
            { img: 110, loc: 'E14', dir: 'NE' },
            { img: 111, loc: 'A8', dir: 'NW' },
            { img: 112, loc: 'I4', dir: 'NE' },
            { img: 113, loc: 'A2', dir: 'S' },
            { img: 114, loc: 'F3', dir: 'SE' },
            { img: 115, loc: 'D6', dir: 'N' },
            { img: 116, loc: 'C17', dir: 'NW' },
            { img: 117, loc: 'G16', dir: 'NW' },
            { img: 118, loc: 'F7', dir: 'N' },
            { img: 119, loc: 'D5', dir: 'W' },
            { img: 122, loc: 'G4', dir: 'N' },
            { img: 123, loc: 'J6', dir: 'N' },
            { img: 124, loc: 'G10', dir: 'NW' },
            { img: 125, loc: 'B9', dir: 'N' },
            { img: 126, loc: 'G8', dir: 'NW' },
            { img: 127, loc: 'K9', dir: 'NE' },
            { img: 128, loc: 'D18', dir: 'N' },
            { img: 129, loc: 'C7', dir: 'N' },
            { img: 130, loc: 'F12', dir: 'S' },
            { img: 131, loc: 'D12', dir: 'NW' },
            { img: 132, loc: 'D15', dir: 'NE' },
            { img: 133, loc: 'K11', dir: 'N' },
            { img: 134, loc: 'I2', dir: 'SE' },
            { img: 135, loc: 'B10', dir: 'NW' },
            { img: 136, loc: 'G13', dir: 'NE' },
            { img: 137, loc: 'H11', dir: 'NE' },
            { img: 138, loc: 'B13', dir: 'N' },
            { img: 139, loc: 'J13', dir: 'NE' },
            { img: 140, loc: 'A5', dir: 'NW' },
            { img: 141, loc: 'F18', dir: 'N' },
            { img: 147, loc: 'H3', dir: 'SE' },
            { img: 148, loc: 'E4', dir: 'NE' },
            { img: 150, loc: 'K14', dir: 'NE' },
            { img: 151, loc: 'D14', dir: 'NE' },
            { img: 152, loc: 'C12', dir: 'SW' },
            { img: 153, loc: 'I1', dir: 'SW' },
            { img: 154, loc: 'H8', dir: 'NE' },
            { img: 155, loc: 'E1', dir: 'W' },
            { img: 156, loc: 'K6', dir: 'N' },
            { img: 157, loc: 'A4', dir: 'NW' },
            { img: 158, loc: 'D2', dir: 'NW' },
            { img: 159, loc: 'K2', dir: 'S' },
            { img: 160, loc: 'G2', dir: 'S' },
            { img: 161, loc: 'F6', dir: 'NW' },
            { img: 162, loc: 'E17', dir: 'SW' },
            { img: 163, loc: 'G11', dir: 'NW' },
            { img: 164, loc: 'F15', dir: 'NW' },
            { img: 165, loc: 'E3', dir: 'SW' },
            { img: 166, loc: 'I3', dir: 'SE' },
            { img: 167, loc: 'J2', dir: 'NE' },
            { img: 168, loc: 'I15', dir: 'S' },
            { img: 169, loc: 'J9', dir: 'NE' },
            { img: 170, loc: 'B18', dir: 'NW' },
            { img: 171, loc: 'D10', dir: 'NW' },
            { img: 172, loc: 'F8', dir: 'N' },
            { img: 173, loc: 'A14', dir: 'N' },
            { img: 174, loc: 'J17', dir: 'SE' },
            { img: 175, loc: 'A6', dir: 'N' },
            { img: 176, loc: 'J16', dir: 'N' },
            { img: 177, loc: 'E10', dir: 'E' },
            { img: 178, loc: 'C14', dir: 'NW' },
            { img: 179, loc: 'I13', dir: 'SE' },
            { img: 180, loc: 'E16', dir: 'S' },
            { img: 181, loc: 'A17', dir: 'N' },
            { img: 182, loc: 'F17', dir: 'N' },
            { img: 183, loc: 'A12', dir: 'N' },
            { img: 184, loc: 'B11', dir: 'NW' },
            { img: 185, loc: 'A1', dir: 'SW' },
            { img: 186, loc: 'H12', dir: 'N' },
            { img: 187, loc: 'D8', dir: 'SW' },
            { img: 188, loc: 'E7', dir: 'N' },
            { img: 189, loc: 'I7', dir: 'NE' },
            { img: 190, loc: 'I10', dir: 'NW' },
            { img: 191, loc: 'J14', dir: 'S' },
            { img: 192, loc: 'F9', dir: 'N' },
            { img: 193, loc: 'D4', dir: 'NW' },
            { img: 194, loc: 'H5', dir: 'E' },
            { img: 195, loc: 'J11', dir: 'NE' },
            { img: 196, loc: 'J18', dir: 'N' },
            { img: 197, loc: 'C16', dir: 'NE' },
            { img: 198, loc: 'E18', dir: 'N' },
            { img: 199, loc: 'B3', dir: 'SW' },
            { img: 200, loc: 'K4', dir: 'NE' },
            { img: 201, loc: 'H7', dir: 'SW' },
            { img: 202, loc: 'D7', dir: 'SE' },
            { img: 203, loc: 'I18', dir: 'W' },
            { img: 204, loc: 'C18', dir: 'E' },
            { img: 205, loc: 'G12', dir: 'E' },
            { img: 206, loc: 'E12', dir: 'W' },
            { img: 207, loc: 'J15', dir: 'SE' },
            { img: 208, loc: 'B15', dir: 'SW' },
            { img: 209, loc: 'E15', dir: 'SW' },
            { img: 210, loc: 'G15', dir: 'SE' },
            { img: 211, loc: 'H13', dir: 'E' },
            { img: 212, loc: 'D13', dir: 'W' },
            { img: 213, loc: 'B5', dir: 'SW' },
            { img: 214, loc: 'J5', dir: 'SE' },
            { img: 215, loc: 'E9', dir: 'NE' },
            { img: 216, loc: 'G9', dir: 'NW' },
            { img: 217, loc: 'C11', dir: 'W' },
            { img: 218, loc: 'I11', dir: 'E' },
            { img: 219, loc: 'D16', dir: 'SW' },
            { img: 220, loc: 'H16', dir: 'SE' },
            { img: 221, loc: 'B12', dir: 'SW' },
            { img: 222, loc: 'J12', dir: 'SE' },
            { img: 223, loc: 'A7', dir: 'NE' },
            { img: 224, loc: 'K7', dir: 'NW' },
            { img: 225, loc: 'E5', dir: 'E' },
            { img: 226, loc: 'G5', dir: 'W' },
            { img: 227, loc: 'C9', dir: 'SW' },
            { img: 228, loc: 'I9', dir: 'SE' },
            { img: 229, loc: 'A10', dir: 'SW' },
            { img: 230, loc: 'K10', dir: 'SE' },
            { img: 231, loc: 'C6', dir: 'NE' },
            { img: 232, loc: 'I6', dir: 'NW' },
        ],
        xcoords: {
            A: 62,
            B: 94,
            C: 128,
            D: 160,
            E: 193,
            F: 226,
            G: 259,
            H: 292,
            I: 325,
            J: 357,
            K: 390,
        },
        ycoords: {
            '1': 616,
            '2': 582,
            '3': 549,
            '4': 516,
            '5': 484,
            '6': 451,
            '7': 417,
            '8': 385,
            '9': 352,
            '10': 319,
            '11': 287,
            '12': 254,
            '13': 221,
            '14': 189,
            '15': 155,
            '16': 122,
            '17': 89,
            '18': 56,
        },
        rotation: {
            'N': 0,
            'NE': 45,
            'E': 90,
            'SE': 135,
            'S': 180,
            'SW': 225,
            'W': 270,
            'NW': 315,
        }
    };

    var canvas = null;
    var stage = null;
    var borders = [];
    var containers = null;

    var images = null;

    function drawBoard(loaded) {
        canvas = document.getElementById("problemCanvas");
        stage = new createjs.Stage(canvas);
        borders = [];
        containers = new Map();
    
        var background = new createjs.Bitmap('data:image/png;base64,'+images[0]);
        background.scaleX = 0.66;
        background.scaleY = 0.66;
        stage.addChild(background);
        
        _.each(board.holds, function(hold) {
            var img = new Image();
            img.src = 'data:image/png;base64,'+images[hold.img];
            img.onload = function (event) {
                var container = new createjs.Container();
                container.regX = (this.width / 2);
                container.regY = (this.height / 2);
                container.x = board.xcoords[hold.loc.substring(0, 1)];
                container.y = board.ycoords[hold.loc.substring(1)];
                container.rotation = board.rotation[hold.dir];
                container.z = 1;
                container.scaleX = 0.666;
                container.scaleY = 0.666;
    
                var bmp = new createjs.Bitmap(this);
                container.addChild(bmp);
                stage.addChild(container);
                
                containers.set(hold.loc, container);
                if (containers.size == board.holds.length) {
                    stage.update();
                    loaded.resolve();
                }
            };
        });
    }

    function setHolds(holds, color)  {
        _.each(holds, function(loc, id) {
            var container = containers.get(loc);
            var border = new createjs.Shape();
            border.graphics.setStrokeStyle(6).beginStroke(color).drawCircle(container.regX, container.regY, 30);
            container.addChild(border);
            container.z = 2;
            borders.push(border);
        });
    }

    return {
        load: function() {
            var loaded = $q.defer();
            $document.ready(function() {
                if (images === null) {
                    database.images(function(img) {
                        images = img;
                        drawBoard(loaded);
                    });
                } else {
                    drawBoard(loaded);
                }
            });
            return loaded.promise;
        },
        set: function(holds) {
            _.each(borders, function(border) {
                border.parent.removeChild(border);
            });
            borders = [];

            var h = holds.split(',');
            setHolds(h[0].match(/([A-Z][0-9]+)/g), "rgba(0,0,0,1)");
            setHolds(h[1].match(/([A-Z][0-9]+)/g), "rgba(255,57,0,1)");
            setHolds(h[2].match(/([A-Z][0-9]+)/g), "rgba(0,0,0,1)");

            // Sort the children so that the board (z==0) is at the bottom
            // of the canvas, holds without borders are in the middle, and
            // holds with borders are on top.  This way the borders (circles)
            // are layered on top of any holds not in use by the problem.
            stage.sortChildren(function(a, b) {
                return a.z - b.z;
            });
            stage.update();
        }
    };
});
