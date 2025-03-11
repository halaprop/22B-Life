

export class SubModel {
  constructor(params) {
    Object.assign(this, params);
  }

  key(row, col) {
    return row * this.parentColCount + col;
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
  // externalEdges is { externalLeftEdge: [bools], externalRightEdge: [bools] }
  // return { cells: {set of true indexes }, { leftEdge: [bools], rightEdge: [bools] }  };
  computeNext(externalEdges) {
    const cells = new Set();

    // for (let row = this.row; row < this.row + this.rowCount; row++) {
    //   this.setCell(row, this.col - 1, externalEdges.externalLeftEdge[row]);
    //   this.setCell(row, this.col + this.colCount, externalEdges.externalRightEdge[row]);
    // }

    const internalEdges = { leftEdge: [], rightEdge: [] };
    for (let row = this.row; row < this.row + this.rowCount; row++) {
      for (let col = this.col; col < this.col + this.colCount; col++) {
        const value = this.getCell(row, col);
        const liveNeighbors = this.livingNeighbors(row, col, externalEdges);

        const nextValue = (liveNeighbors == 3) || (value && liveNeighbors == 2);
        if (nextValue) {
          const key = row * this.parentColCount + col;
          cells.add(key)
        }
        if (col == this.col) {
          internalEdges.leftEdge.push(nextValue);
        }
        if (col == this.col + this.colCount - 1) {
          internalEdges.rightEdge.push(nextValue);
        }
      }
    }
    this.cells = cells;
    return { cells, internalEdges };
  }

  livingNeighbors(row, col, externalEdges) {
    let result = 0;
    const startRow = Math.max(0, row - 1);
    const endRow = Math.min(this.rowCount - 1, row + 1);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        let value;
        if (col == this.col - 1) {
          value = externalEdges.externalLeftEdge[row];
        } else if (col == this.colCount) {
          value = externalEdges.externalRightEdge[row];
        } else {
          value = this.getCell(r, c);
        }
        if (value) result++;
      }
    }
    return this.getCell(row, col) ? result - 1 : result;
  }

}