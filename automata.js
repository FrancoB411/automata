let paused, sketch, playfield, next, tmp;

let sliderValue = 30;
let bg = 57;
let color = [0, 255, 0];

const EMPTY = 0;
const CELL = 1;
const DECAY = 2;
const RELAPSE = 3;

const colors = [
    "#000000",
    "#AAFFAA",
    "#7F887F",
    "#222255"
];

const CELL_RADIUS = 5;
const PLAYFIELD_ROWS = parseInt(window.innerHeight / CELL_RADIUS);
const PLAYFIELD_COLS = parseInt(window.innerWidth / CELL_RADIUS);


const widthOf = (selector) => {
    return document.querySelector(selector).offsetWidth;
};

const createMatrix = (rows, cols) => {
    const rowsArr = new Array(rows);

    for (let r = 0; r < rowsArr.length; r++) {
        const row = new Array(cols);
        for (let i = 0; i < row.length; i++) { row[i] = EMPTY; }
        rowsArr[r] = row;
    };

    return rowsArr;
};

const clearMatrix = (matrix) => {
    for (let i = 0; i < PLAYFIELD_ROWS; i++) {
        for (let j = 0; j < PLAYFIELD_COLS; j++) {
            matrix[i][j] = EMPTY;
        }
    }
};

const isEmpty = (playfield) => {
    for (let i = 0; i < playfield.length; i++) {
        if (!playfield[i].every((c) => c == EMPTY)) return false;
    }
    return true;
};

const buffer1 = createMatrix(PLAYFIELD_ROWS, PLAYFIELD_COLS);
const buffer2 = createMatrix(PLAYFIELD_ROWS, PLAYFIELD_COLS);

const automata = (s) => {
    playfield = buffer1;
    next = buffer2;
    let neighborhood = [-1, 0, 1];

    const countInNeighborhood = (x, y, playfield, value) => {
        let res = 0;

        for (let i of neighborhood) {
            for (let j of neighborhood) {
                if (
                    x + i < 0 ||
                    x + i >= PLAYFIELD_ROWS ||
                    y + j < 0 ||
                    y + j >= PLAYFIELD_COLS
                ) continue;

                if (playfield[x + i][y + j] == value) res++;
            }
        }
        return res;
    };

    const drawCell = (col, row, value) => {
        s.noStroke();
        s.fill(colors[value]);
        s.circle(CELL_RADIUS * col, CELL_RADIUS * row, CELL_RADIUS);
    };

    const evaluateCell = (x, y, playfield, nextField) => {
        switch (playfield[x][y]) {
            case EMPTY:
                if (
                    countInNeighborhood(x, y, playfield, CELL) > 1
                    && countInNeighborhood(x, y, playfield, CELL) < 4
                ) {
                    nextField[x][y] = CELL;
                }
                break;
            case CELL:
                if (countInNeighborhood(x, y, playfield, CELL) > 3
                    && countInNeighborhood(x, y, playfield, CELL) < 5) {
                    nextField[x][y] = CELL;
                } else {
                    nextField[x][y] = DECAY;
                }
                break;
            case DECAY:
                if (countInNeighborhood(x, y, playfield, CELL) > 3) {
                    nextField[x][y] = DECAY;
                } else {
                    nextField[x][y] = RELAPSE;
                }
                break;
            default:
        }
    };

    const seed = (playfield) => {
        let cx, cy;
        cx = PLAYFIELD_ROWS / 2;
        cy = PLAYFIELD_COLS / 2;

        playfield[cx][cy] = CELL;
        playfield[cx - 1][cy] = CELL;
        playfield[cx + 1][cy] = CELL;
        playfield[cx][cy - 1] = CELL;

        return playfield;
    };

    s.setup = () => {
        s.createCanvas(window.innerWidth, window.innerHeight);
        s.background(colors[EMPTY]);

        for (let i = 0; i < PLAYFIELD_ROWS; i++) {
            for (let j = 0; j < PLAYFIELD_COLS; j++) {
                if (Math.floor(Math.random(10) * 10 + 1) > 7) {
                    playfield[i][j] = CELL;
                } else {
                    playfield[i][j] = EMPTY;
                }
            }
        }
    };

    const step = () => {
        clearMatrix(next);
        for (let row = 0; row < PLAYFIELD_ROWS; row++) {
            for (let col = 0; col < PLAYFIELD_COLS; col++) {
                evaluateCell(row, col, playfield, next);
            }
        }
        tmp = playfield;
        playfield = next;
        next = tmp;
      tmp = null;
    };

    s.keyPressed = () => {
        // step();
        paused = !paused;
    };

    s.draw = () => {
        if (!paused) { step(); }
        s.clear();
        s.background(colors[EMPTY]);
        if (isEmpty(playfield)) {
            seed(playfield);
        };
        for (let row = 0; row < PLAYFIELD_ROWS; row++) {
            for (let col = 0; col < PLAYFIELD_COLS; col++) {
                if (playfield[row][col] != EMPTY) {
                    drawCell(col, row, playfield[row][col]);
                }
            }
        }
    };
};


const init = () => {
    console.log('starting');
    sketch = new p5(automata, "body");
};

window.onload = init;
