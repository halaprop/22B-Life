const kMaxSubmodels = 8;

export class LifeModel {
  static createFrom(rowCount, colCount, sourceModel) {
    const submodelCount = Math.min(kMaxSubmodels, Math.ceil(colCount / 10));

    let submodels = [];
    let width = Math.floor(colCount / submodelCount);
    let remainder = colCount % submodelCount;

    let subCol = 0;
    for (let i = 0; i < submodelCount; i++) {
      const subColCount = width + (remainder > 0 ? 1 : 0);
      remainder--;
      // submodel params are row, col, rowCount, colCount, and parentColCount
      const submodel = new SubModel(0, subCol, rowCount, subColCount, colCount);
      for (let row=0; row < rowCount; row++) {
        for (let col = subCol; col < subCol + subColCount; col++) {
          const sourceKey = row*colCount + col;
          const sourceValue = sourceModel.get(sourceKey);
          if (sourceValue) {
            submodel.setCellWithKey(sourceKey, sourceValue); 
          }
        }
      }
      submodels.push(submodel);
      subCol += subColCount;
    }
    return new LifeModel(rowCount, colCount, submodels);
  }

  constructor(rowCount, colCount, submodels) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.submodels = submodels;
  }

  draw(grid) {
    let totalLiving = 0;
    for (let row=0; row <this.rowCount; row++) {
      for (let col=0; col<this.colCount; col++) {
        const value = this.getCell(row, col);
        const glyph = value ? '#' : ' ';
        if (value) totalLiving++;
        grid.drawCharAt(row, col, glyph, 'white');
      }
    };
    return totalLiving;
  }

  findSubmodel(row, col) {
    for (let submodel of this.submodels) {
      if (col >= submodel.col && col < submodel.col + submodel.colCount) {
        return submodel;
      }
    }
    throw new Error(`col ${col} is out of bounds`);
  }

  setCell(row, col, state) {
    let submodel = this.findSubmodel(row, col);
    submodel.setCell(row, col, state);
  }

  getCell(row, col) {
    let submodel = this.findSubmodel(row, col);
    return submodel.getCell(row, col);
  }

  transmitEdges() {
    const edges = {};
    // see Submodel internalEdges(). edges will be keyed with submodel index, and
    // values are { leftEdge: [...bools for every row], rightEdge: [...bools for every row] } 

    const submodelsLength = this.submodels.length;
    for (let i = 0; i < submodelsLength; i++) {
      edges[i] = this.submodels[i].internalEdges();
    }

    for (let i = 0; i < submodelsLength; i++) {
      let leftEdge = edges[i - 1]?.rightEdge || [];
      let rightEdge = edges[i + 1]?.leftEdge || [];
      if (leftEdge.length || rightEdge.length) {
        this.submodels[i].setExternalEdges(leftEdge, rightEdge);
      }
    }
  }

  nextModel() {
    let nextSubmodels = [];
    this.transmitEdges();

    for (let i = 0; i < this.submodels.length; i++) {
      const submodel = this.submodels[i];
      const nextSubmodel = submodel.nextSubmodel();
      nextSubmodels.push(nextSubmodel);
    }
    return new LifeModel(this.rowCount, this.colCount, nextSubmodels);
  }

}

class SubModel {
  constructor(row, col, rowCount, colCount, parentColCount) {
    this.row = row;
    this.col = col;
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.parentColCount = parentColCount;

    this.cells = new Set();
  }

  key(row, col) {
    return row * this.parentColCount + col;
  }

  setCell(row, col, state) {
    const key = this.key(row, col);
    this.setCellWithKey(key, state);
  }

  getCell(row, col) {
    const key = this.key(row, col);
    return this.getCellWithKey(key);
  }

  setCellWithKey(key, state) {
    state ? this.cells.add(key) : this.cells.delete(key);
  }

  getCellWithKey(key) {
    return this.cells.has(key);
  }

  internalEdges() {
    // returns { leftEdge: [...bools for every row], rightEdge: [...bools for every row] } 
    // omits leftEdge for the leftmost submodel and rightEdge for the rightmost
    const result = {};
    if (this.col > 0) result.leftEdge = [];
    if (this.col+this.colCount < this.parentColCount) result.rightEdge = [];
    
    for (let row = this.row; row < this.row + this.rowCount; row++) {
      if (result.leftEdge) {
        const value = this.getCell(row, this.col);
        result.leftEdge.push(value);
      }
      if (result.rightEdge) {
        const value = this.getCell(row, this.col + this.colCount - 1);
        result.rightEdge.push(value);
      }
    }
    return result;
  }

  setExternalEdges(externalLeftEdge, externalRightEdge) {
    for (let row = this.row; row < this.row + this.rowCount; row++) {
      this.setCell(row, this.col - 1, externalLeftEdge[row]);
      this.setCell(row, this.col + this.colCount, externalRightEdge[row]);
    }
  }

  nextSubmodel(externalLeftEdge, externalRightEdge) {
    const result = new SubModel(this.row, this.col, this.rowCount, this.colCount, this.parentColCount);

    for (let row = this.row; row < this.row + this.rowCount; row++) {
      for (let col = this.col; col < this.col + this.colCount; col++) {
        const value = this.getCell(row, col);
        const liveNeighbors = this.livingNeighbors(row, col);
        const nextValue = (liveNeighbors == 3) || (value && liveNeighbors == 2);
        result.setCell(row, col, nextValue);
      }
    }
    return result;
  }

  livingNeighbors(row, col) {
    let result = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (this.getCell(r, c)) {
          result++;
        }
      }
    }
    return this.getCell(row, col) ? result - 1 : result;
  }

}