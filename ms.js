window.addEventListener('load', () => {
    let model = new MinesweeperModel(10, 10, 10);
    let view = new MinesweeperView(model);
    let controller = new MinesweeperController(model, view);

    let body = document.querySelector("body");
    body.append(view.div);
})