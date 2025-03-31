

export class SubModel {
  constructor(params) {
    Object.assign(this, params);
  }

  key(row, col) {
    return row * this.colCount + col;
  }

  setCell(row, col, state) {
    const key = this.key(row, col);
    state ? this.cells.add(key) : this.cells.delete(key);
  }

  getCell(row, col) {
    const key = this.key(row, col);
    return this.cells.has(key);
  }

  // receive external edges and return cells and internal edges
  // externalEdges is { externalTopEdge: [bools], externalBottomEdge: [bools] }
  // return { cells: {set of true indexes }, { leftEdge: [bools], rightEdge: [bools] }  };
  computeNext(externalEdges) {
    const cells = new Set();

    const internalEdges = { topEdge: [], bottomEdge: [] };
    for (let row = this.row; row < this.row + this.rowCount; row++) {
      for (let col = this.col; col < this.col + this.colCount; col++) {
        const value = this.getCell(row, col);
        const liveNeighbors = this.livingNeighbors(row, col, externalEdges);

        const nextValue = (liveNeighbors == 3) || (value && liveNeighbors == 2);
        if (nextValue) {
          const key = row * this.colCount + col;
          cells.add(key)
        }
        if (row == this.row) {
          internalEdges.topEdge.push(nextValue);
        } else if (row == this.row + this.rowCount - 1) {
          internalEdges.bottomEdge.push(nextValue);
        }
      }
    }
    this.cells = cells;
    return { cells, internalEdges };
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