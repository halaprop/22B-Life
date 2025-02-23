
export class ConsoleGrid {
  static kBorderWidth = 1;

  // in life, status line el is optional, root element is not used. caller passes canvas el in
  constructor(params) {
    this.canvas = params.canvas;
    this.rowCount = params.rowCount || 20;
    this.colCount = params.colCount || 30;
    this.cellSize = params.cellSize || 16;
    this.backgroundDots = params.backgroundDots ?? true;
    this.statusLineEl = params.statusLineEl;

    if (this.statusLineEl) {
      this.statusLineEl.innerHTML = "&nbsp";
    }
    this._emptyTile = { char: (this.backgroundDots ? "\u00B7" : " "), color: "#c0c0c0" };

    this.width = this.colCount * this.cellSize;
    this.height = this.rowCount * this.cellSize;

    this.canvas.width = this.width + 2 * ConsoleGrid.kBorderWidth;
    this.canvas.height = this.height + 2 * ConsoleGrid.kBorderWidth;
    this.ctx = this.canvas.getContext("2d");

    this.grid = {};
    this.redraw();
  }

  gridAt(row, col) {
    const key = `${row}-${col}`;
    return this.grid[key] ?? this._emptyTile;
  }

  setGridAt(row, col, value) {
    const key = `${row}-${col}`;
    if (value) {
      this.grid[key] = value;
    } else {
      delete this.grid[key];
    }
  }

  drawCharAt(row, col, char, color = "white") {
    if (this.isValidPosition(row, col)) {
      this.setGridAt(row, col, { char, color });
      this.redrawCell(row, col);
    }
  }

  eraseCharAt(row, col) {
    if (this.isValidPosition(row, col)) {
      this.setGridAt(row, col, null);
      this.redrawCell(row, col);
    }
  }

  eraseAll() {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        this.setGridAt(row, col, null);
      }
    }
    this.redraw();
  }

  setStatusLine(statusLine) {
    if (this.statusLineEl) {
      this.statusLineEl.innerText = statusLine;
    }
  }

  eraseLog() {
    if (this.statusLineEl) {
      this.statusLineEl.innerText = "";
    }
  }

  redraw() {
    const { ctx, width, height } = this;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = ConsoleGrid.kBorderWidth;
    ctx.strokeRect(
      ConsoleGrid.kBorderWidth / 2,
      ConsoleGrid.kBorderWidth / 2,
      width + ConsoleGrid.kBorderWidth,
      height + ConsoleGrid.kBorderWidth
    );

    ctx.font = `${this.cellSize * 0.8}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        this.drawCell(ctx, row, col);
      }
    }
  }

  // clear the background and call draw
  redrawCell(row, col) {
    const { ctx, cellSize } = this;
    const x = col * cellSize + ConsoleGrid.kBorderWidth;
    const y = row * cellSize + ConsoleGrid.kBorderWidth;

    ctx.fillStyle = "black";
    ctx.fillRect(x, y, cellSize, cellSize);
    this.drawCell(ctx, row, col);
  }

  // answer the cell center for a given row and col
  cellCenter(row, col) {
    const cellSize = this.cellSize;
    const x = col * cellSize + cellSize / 2 + ConsoleGrid.kBorderWidth;
    const y = row * cellSize + cellSize / 2 + ConsoleGrid.kBorderWidth + this.cellSize * 0.1;
    return { x, y };
  }

  // draw just the text. use when we know we've cleared the background
  // like in redraw()
  drawCell(ctx, row, col) {
    const { char, color } = this.gridAt(row, col);;
    const { x, y } = this.cellCenter(row, col);

    ctx.fillStyle = color;
    ctx.fillText(char, x, y);
  }

  isValidPosition(row, col) {
    return row >= 0 && row < this.rowCount && col >= 0 && col < this.colCount;
  }
}

export class Cout {
  constructor(element) {
    this.element = element;
  }

  writeLine(line, append = false) {
    if (!this.element) {
      return;
    }

    if (append) {
      this.element.innerHTML += line + "<br>";
      this.element.scrollTop = this.element.scrollHeight;
    } else {
      this.element.innerHTML = line + "<br>";
    }
  }
}