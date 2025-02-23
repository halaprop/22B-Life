

export class Life {
  constructor(model) {
    Object.assign(this, model);
  }

  keyForRowCol(row, col) {
    return row * this.colCount + col;
  }

  setCellValueAt(row, col, value) {
    const key = this.keyForRowCol(row, col);
    this.cells.set(key, value);
  }

  cellValueAt(row, col) {
    const key = this.keyForRowCol(row, col);
    return this.cells.get(key)
  }

  safeCellValueAt(row, col) {
    const inBounds = row >= 0 && row < this.rowCount && col >= 0 && col < this.colCount;
    return inBounds ? this.cellValueAt(row, col) : 0;
  }

  nextLife() {
    const result = new Life({ rowCount: this.rowCount, colCount: this.colCount, cells: new Map() });
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        let liveNeighbors = this.livingNeighbors(row, col);
        let nextValue = false;
        if (this.cellValueAt(row, col)) {
          // if a cell is alive, it stays alive with 2 or 3 neighbors
          if ((liveNeighbors == 2 || liveNeighbors == 3))
            nextValue = true;
        } else {
          // if it's not alive, it becomes alive with 3 neighbors
          if (liveNeighbors == 3)
            nextValue = true;
        }
        if (nextValue) {
          result.setCellValueAt(row, col, nextValue);
        }
      }
    }
    return result;
  }

  FAST_nextLife() {
    const result = new Life({ rowCount: this.rowCount, colCount: this.colCount, cells: new Map() });
    const deadNeighbors = new Set();

    const offsets = [
      [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];


    for (const [key, value] of this.cells) {
      const row = Math.floor(key / this.colCount);
      const col = key % this.colCount;

      // count living neighbors inline
      let liveNeighbors = 0;
      for (let offset of offsets) {
        let neighborRow = row + offset[0];
        let neighborCol = col + offset[1];
        if (this.safeCellValueAt(neighborRow, neighborCol)) {
          liveNeighbors++;
        } else {
          deadNeighbors.add([neighborRow, neighborCol])
        }
      }

      // conway rules
      let nextValue = false;
      if (this.cellValueAt(row, col)) {
        // if a cell is alive, it stays alive with 2 or 3 neighbors
        if ((liveNeighbors == 2 || liveNeighbors == 3))
          nextValue = true;
      } else {
        // if it's not alive, it becomes alive with 3 neighbors
        if (liveNeighbors == 3)
          nextValue = true;
      }
      if (nextValue) {
        result.setCellValueAt(row, col, nextValue);
      }
    }

    for (const [row, col] of deadNeighbors) {
      let liveNeighbors = 0;
      for (let offset of offsets) {
        let neighborRow = row + offset[0];
        let neighborCol = col + offset[1];
        if (this.safeCellValueAt(neighborRow, neighborCol)) {
          liveNeighbors++;
        }
      }
      if (liveNeighbors == 3) {
        result.setCellValueAt(row, col, true);
      }
    }
    return result;
  }

  livingNeighbors(row, col) {
    let living = 0;

    const offsets = [
      [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];

    for (let offset of offsets) {
      let neighborRow = row + offset[0];
      let neighborCol = col + offset[1];
      if (this.safeCellValueAt(neighborRow, neighborCol)) {
        living++;
      }
    }
    return living;
  }
}
