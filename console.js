
export class LifeUI {
  static kBorderWidth = 1;

  // in life, status line el is optional, root element is not used. caller passes canvas el in
  constructor(params) {
    this.canvas = params.canvas;
    this.rowCount = params.rowCount || 20;
    this.colCount = params.colCount || 30;
    this.cellSize = params.cellSize || 16;

    const width = this.colCount * this.cellSize;
    const height = this.rowCount * this.cellSize;

    this.canvas.width = width + 2 * LifeUI.kBorderWidth;
    this.canvas.height = height + 2 * LifeUI.kBorderWidth;
    const ctx = this.canvas.getContext("2d");
    this.ctx = ctx;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = LifeUI.kBorderWidth;
    ctx.strokeRect(
      LifeUI.kBorderWidth / 2,
      LifeUI.kBorderWidth / 2,
      width + LifeUI.kBorderWidth,
      height + LifeUI.kBorderWidth
    );
  }

  drawSet(set) {
    let livingCells = 0;    
    const ctx = this.ctx;
    ctx.fillStyle = 'white';
    const inset = 1;
    const insetCellSize = this.cellSize - inset * 2;

    for (let key of set) {
      livingCells++;
      const row = Math.floor(key / this.colCount);
      const col = key % this.colCount;
      const x = col * this.cellSize + LifeUI.kBorderWidth;
      const y = row * this.cellSize + LifeUI.kBorderWidth;
      ctx.fillRect(x+inset, y+inset, insetCellSize, insetCellSize);
    }
    return livingCells;
  }

  eraseAll() {
    const { ctx, width, height } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = LifeUI.kBorderWidth;
    ctx.strokeRect(
      LifeUI.kBorderWidth / 2,
      LifeUI.kBorderWidth / 2,
      width + LifeUI.kBorderWidth,
      height + LifeUI.kBorderWidth
    );
  }
}
