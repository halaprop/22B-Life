

export class SubModel {
  constructor(params) {
    Object.assign(this, params);
  }

  key(row, col) {
    return row * this.colCount + col;
  }

getCell(row, col) {
    const key = this.key(row, col);
    return this.cells.has(key);
  }

  // externalEdges: { externalTopEdge: [bools], externalBottomEdge: [bools] }
  // returns: { cellsArray: Uint32Array, internalEdges: { topEdge: [bools], bottomEdge: [bools] } }
  computeNext(externalEdges) {
    const topRow = this.row;
    const bottomRow = this.row + this.rowCount - 1;
    const candidates = new Set();

    // every live cell and its neighbors are candidates
    for (const key of this.cells) {
      const row = Math.floor(key / this.colCount);
      const col = key % this.colCount;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r >= topRow && r <= bottomRow && c >= 0 && c < this.colCount) {
            candidates.add(r * this.colCount + c);
          }
        }
      }
    }

    // cells in our top/bottom rows adjacent to live external edge cells are also candidates
    for (let c = 0; c < this.colCount; c++) {
      if (externalEdges.externalTopEdge[c]) {
        for (let dc = -1; dc <= 1; dc++) {
          const nc = c + dc;
          if (nc >= 0 && nc < this.colCount) candidates.add(topRow * this.colCount + nc);
        }
      }
      if (externalEdges.externalBottomEdge[c]) {
        for (let dc = -1; dc <= 1; dc++) {
          const nc = c + dc;
          if (nc >= 0 && nc < this.colCount) candidates.add(bottomRow * this.colCount + nc);
        }
      }
    }

    const cells = new Set();
    const internalEdges = {
      topEdge: new Array(this.colCount).fill(false),
      bottomEdge: new Array(this.colCount).fill(false),
    };

    for (const key of candidates) {
      const row = Math.floor(key / this.colCount);
      const col = key % this.colCount;
      const value = this.getCell(row, col);
      const liveNeighbors = this.livingNeighbors(row, col, externalEdges);
      const nextValue = (liveNeighbors === 3) || (value && liveNeighbors === 2);
      if (nextValue) cells.add(key);
      if (row === topRow) internalEdges.topEdge[col] = nextValue;
      if (row === bottomRow) internalEdges.bottomEdge[col] = nextValue;
    }

    this.cells = cells;
    const cellsArray = new Uint32Array(cells);
    return { cellsArray, internalEdges };
  }

  livingNeighbors(row, col, externalEdges) {
    let result = 0;
    const startCol = Math.max(0, col - 1);
    const endCol = Math.min(this.colCount - 1, col + 1);

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = startCol; c <= endCol; c++) {
        let value;
        if (r == this.row - 1) {
          value = externalEdges.externalTopEdge[c] ?? false;
        } else if (r == this.row + this.rowCount) {
          value = externalEdges.externalBottomEdge[c] ?? false;
        } else {
          value = this.getCell(r, c);
        }
        if (value) {
          result++;
        }
      }
    }
    return this.getCell(row, col) ? result - 1 : result;
  }

}