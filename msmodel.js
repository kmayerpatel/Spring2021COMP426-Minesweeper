let MinesweeperModel = function (width, height, bomb_count) {

    width = (width < 1) ? 1 : (width > 100) ? 100 : width;
    height = (height < 1) ? 1 : (height > 100) ? 100 : height;
    bomb_count = (bomb_count < 0) ? 0 : (bomb_count > width * height) ?  width*height : bomb_count;

    let state = MinesweeperModel.State.INITIALIZED;
    let start_time = null;
    let end_time = null;

    let bomb_flags = [];
    for (let i=0; i<(width*height)-bomb_count; i++) {
        bomb_flags.push(false);
    }
    for (let i=0; i<bomb_count; i++) {
        bomb_flags.push(true);
    }
    shuffle(bomb_flags);

    let minefield = [];
    for (let row=0; row<height; row++) {
        let cellrow = [];
        for (let col=0; col<width; col++) {
            cellrow.push(new MinesweeperCell(this, row, col, bomb_flags.pop()));
        }
        minefield.push(cellrow);
    }

    let model_observers = [];
    this.addListener = function (listener) {
        model_observers.push(listener);
    }

    let update = (event) => {
        model_observers.forEach((l) => {
            l(this, event);
        })
    };

    this.getWidth = function () {
        return width;
    }

    this.getHeight = function () {
        return height;
    }

    this.getCell = function(row, col) {
        return minefield[row][col];
    }

    this.elapsed = function() {
        if (state == MinesweeperModel.State.INITIALIZED) {
            return 0;
        } else if (state == MinesweeperModel.State.IN_PROGRESS) {
            return Date.now() - start_time;
        } else {
            return end_time - start_time;
        }
    }

    this.gameStarted = function() {
        return (state == MinesweeperModel.State.IN_PROGRESS);
    }

    this.gameOver = function() {
        return (state == MinesweeperModel.State.WON) || (state == MinesweeperModel.State.LOST);
    }

    this.start = function () {
        if (this.gameStarted()) {
            return;
        }
        start_time = Date.now();
        state = MinesweeperModel.State.IN_PROGRESS;
        update("started");
    }

    this.won = function () {
        if (state != MinesweeperModel.State.IN_PROGRESS) {
            return;
        }

        end_time = Date.now();
        state = MinesweeperModel.State.WON;
        update("won");
    }

    this.lose = function () {
        if (state != MinesweeperModel.State.IN_PROGRESS) {
            return;
        }

        end_time = Date.now();
        state = MinesweeperModel.State.LOST;
        update("lost");
    }

}

MinesweeperModel.State = {
    INITIALIZED: 0,
    IN_PROGRESS: 1,
    WON: 2,
    LOST: 3
}

let MinesweeperCell = function (model, row, col, is_bomb) {
    let status = MinesweeperCell.Status.UNMARKED;
    let cell_observers = [];

    this.addListener = function (listener) {
        cell_observers.push(listener);
    }

    let update = () => {
        cell_observers.forEach((l) => {
            l(this);
        })
    };

    this.reveal = function () {
        if (status == MinesweeperCell.Status.UNMARKED) {
            status = MinesweeperCell.Status.REVEALED;
            update();
        }
    }

    this.mark = function () {
        if (status == MinesweeperCell.Status.UNMARKED) {
            status = MinesweeperCell.Status.MARKED;
            update();
        }
    }

    this.unmark = function () {
        if (status == MinesweeperCell.Status.MARKED) {
            status = MinesweeperCell.Status.UNMARKED;
            update();
        }
    }

    this.getStatus = function () {
        return status;
    }

    this.getRow = function() {return row;}

    this.getCol = function() {return col;}

    this.isBomb = function () {
        return is_bomb;
    }

    let neighbors = null;
    this.getNeighbors = function () {
        if (neighbors == null) {
            neighbors = []
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr != 0 || dc != 0) {
                        let nrow = row + dr;
                        let ncol = col + dc;
                        if (nrow >= 0 && nrow < model.getHeight() &&
                            ncol >= 0 && ncol < model.getWidth()) {
                            neighbors.push(model.getCell(nrow, ncol));
                        }
                    }
                }
            }
        }
        return neighbors;
    }

    let nbc = null;
    this.neighborBombCount = function() {
        if (nbc == null) {
            nbc = 0;
            this.getNeighbors().forEach((c) => {
                if (c.isBomb()) {
                    nbc++
                }
            });
        }
        return nbc;
    }
}

MinesweeperCell.Status = {
    MARKED: 0,
    UNMARKED: 1,
    REVEALED: 2
}


/*
 * * Randomly shuffle an array
* https://stackoverflow.com/a/2450976/1293256
* @param  {Array} array The array to shuffle
* @return {String}      The first item in the shuffled array
*/
let shuffle = function (array) {

    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;

};
