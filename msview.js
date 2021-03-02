let MinesweeperView = class {
    constructor(model) {
        this.model = model;
        this.div = document.createElement('div');

        let minefield_table = document.createElement('table');
        for (let r=0; r<model.getHeight(); r++) {
            let trow = document.createElement('tr');
            for (let c=0; c<model.getWidth(); c++) {
                let tcell = document.createElement('td');
                let cell_view = new CellView(model.getCell(r,c));
                {
                    let click_row = r;
                    let click_col = c;

                    cell_view.div.addEventListener('click', (e) => {
                        let action = 'reveal';
                        if (e.shiftKey) {
                            action = 'toggleMark';
                        } else if (e.altKey) {
                            action = 'clear';
                        }
                        this.updateListeners({
                            row: click_row,
                            col: click_col,
                            action: action
                        })
                    });
                }
                tcell.append(cell_view.div);
                trow.append(tcell);
            }
            minefield_table.append(trow);
        }
        this.div.append(minefield_table);

        let elapsed_div = document.createElement('div');
        elapsed_div.innerHTML = "Elapsed Time: <span id='elapsed'>0</span> seconds";
        this.div.append(elapsed_div);

        this.listeners = [];

        this.timerHandler = () => {
            document.querySelector("#elapsed").innerHTML =
                (this.model.elapsed()/1000.0).toString();
        };

        this.model.addListener((model, event) => {
            if (event == "lost") {
                clearInterval(this.timerHandler);
                this.timerHandler();
                alert("You lose!");
            } else if (event == "won") {
                clearInterval(this.timerHandler);
                this.timerHandler();
                alert("You won!");
            } else if (event == "started") {
                setInterval(this.timerHandler, 200);
            }
        })
    }

    addListener(listener) {
        let idx = this.listeners.findIndex((l) => l == listener);
        if (idx == -1) {
            this.listeners.push(listener);
        }
    }

    removeListener(listener) {
        let idx = this.listeners.findIndex((l) => l == listener);
        if (idx != -1) {
            this.listeners.splice(idx, 1);
        }
    }

    updateListeners(event) {
        this.listeners.forEach((l) => l(event));
    }
}

let CellView = class {
    constructor(cell) {
        this.div = document.createElement('div');
        this.div.classList.add('cellview');
        this.div.classList.add('unrevealed');

        cell.addListener((c) => {
            if (c.getStatus() == MinesweeperCell.Status.UNMARKED) {
                this.div.innerHTML = "";
            } else if (c.getStatus() == MinesweeperCell.Status.MARKED) {
                this.div.innerHTML = "X";
            } else if (c.getStatus() == MinesweeperCell.Status.REVEALED) {
                this.div.classList.remove('unrevealed');
                if (c.isBomb()) {
                    this.div.innerHTML = "*";
                } else {
                    let nbc = cell.neighborBombCount();
                    this.div.innerHTML = "";
                    if (nbc != 0) {
                        this.div.innerHTML = nbc.toString();
                    }
                }
            }
        });
    }
}