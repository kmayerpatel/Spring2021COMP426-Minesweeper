let MinesweeperController = class {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        view.addListener((e) => {
            console.log(e);
            if (e.action == 'reveal') {
                this.reveal(e.row, e.col, false);
            } else if (e.action == 'toggleMark') {
                this.toggleMark(e.row, e.col);
            } else if (e.action == 'clear') {
                this.clear(e.row, e.col);
            }
        });
    }


    toggleMark(row, col) {
        if (this.model.gameOver()) {
            return;
        } else if (!this.model.gameStarted()) {
            this.model.start();
        }

        let cell = this.model.getCell(row,col);
        if (cell.getStatus() != MinesweeperCell.Status.REVEALED) {
            if (cell.getStatus() == MinesweeperCell.Status.MARKED) {
                cell.unmark();
            } else {
                cell.mark();
                this.test_for_win();
            }
        }
    }

    reveal(row, col, suppress_win_test) {
        if (this.model.gameOver()) {
            return;
        } else if (!this.model.gameStarted()) {
            this.model.start();
        }

        let cell = this.model.getCell(row,col);
        if (cell.getStatus() != MinesweeperCell.Status.UNMARKED) {
            // Either already revealed or marked so don't do anything.
            return;
        }

        cell.reveal();
        if (cell.isBomb()) {
            this.model.lose();
            for (let r =0; r < this.model.getHeight(); r++) {
                for (let c=0; c<this.model.getWidth(); c++) {
                    let cell = this.model.getCell(r,c);
                    if (cell.isBomb()) {
                        cell.reveal();
                    }
                }
            }
            return;
        } else {
            if (cell.neighborBombCount() == 0) {
                cell.getNeighbors().forEach((c) => this.reveal(c.getRow(), c.getCol(), true));
            }
        }

        if (!suppress_win_test) {
            this.test_for_win();
        }
    }

    clear(row, col) {
        if (this.model.gameOver()) {
            return;
        } else if (!this.model.gameStarted()) {
            this.model.start();
        }

        let cell = this.model.getCell(row,col);
        if (cell.getStatus() == MinesweeperCell.Status.REVEALED && (!cell.isBomb())) {
            let mark_count = 0;
            let neighborhood = cell.getNeighbors();
            neighborhood.forEach((n) => mark_count += (n.getStatus() == MinesweeperCell.Status.MARKED) ? 1 : 0);
            if (mark_count == cell.neighborBombCount()) {
                cell.getNeighbors().forEach((c) => this.reveal(c.getRow(), c.getCol(), true));
                this.test_for_win();
            }
        }
    }

    test_for_win() {
        let not_a_win = false;
        for (let r =0; r < this.model.getHeight(); r++) {
            for (let c=0; c<this.model.getWidth(); c++) {
                let cell = this.model.getCell(r,c);
                if (cell.isBomb()) {
                    not_a_win = not_a_win || (cell.getStatus() != MinesweeperCell.Status.MARKED);
                } else {
                    not_a_win = not_a_win || (cell.getStatus() != MinesweeperCell.Status.REVEALED);
                }
            }
        }

        if (!not_a_win) {
            this.model.won();
        }
    }
}