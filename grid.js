const kMaxSubmodels = 8;


export class MyClassProxy {
  constructor(workerScript = './worker-bee.js') {
    this.worker = new Worker(workerScript, { type: 'module' });
  }

  sendMessage(command, params) {
    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        const data = event.data;
        if (data.status === 'ok') {
          resolve(data.result || data);
        } else {
          reject(data.error);
        }
        this.worker.removeEventListener('message', handleMessage);
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ command, params });
    });
  }

  async create(params) {
    return this.sendMessage('create', params);
  }

  async compute(params) {
    return this.sendMessage('compute', params);
  }
}

const proxy = new MyClassProxy();

async function run() {
  try {
    const createResult = await proxy.create({ value: 10 });
    console.log('createResult', createResult);

    const computeResult = await proxy.compute({ value: 5 });
    console.log('computeResult', computeResult);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();



export class LifeModel {
  constructor(rowCount, colCount, sourceMap) {
    this.rowCount = rowCount;
    this.colCount = colCount;

    const submodelCount = Math.min(kMaxSubmodels, Math.ceil(colCount / 10));
    const width = Math.floor(colCount / submodelCount);
    let remainder = colCount % submodelCount;

    const submodels = [];
    const allCells = [];
    const allInternalEdges = [];

    let subCol = 0;

    for (let i = 0; i < submodelCount; i++) {
      const subColCount = width + (remainder > 0 ? 1 : 0);
      remainder--;
      const cells = new Set();
      const leftEdge = [];
      const rightEdge = [];
      for (let row = 0; row < rowCount; row++) {
        for (let col = subCol; col < subCol + subColCount; col++) {
          const key = row * colCount + col;
          const value = sourceMap.get(key);
          if (value) {
            cells.add(key);
          }
          if (col == subCol) {
            leftEdge.push(value);
          }
          if (col == subCol + subColCount - 1) {
            rightEdge.push(value);
          }
        }
      }
      allInternalEdges.push({ leftEdge, rightEdge });
      allCells.push(cells);

      // submodel params are { row, col, rowCount, colCount, parentColCount, cells }
      const params = { row: 0, col: subCol, rowCount, colCount: subColCount, parentColCount: colCount, cells }
      const submodel = new SubModel(params);
      submodels.push(submodel);
      subCol += subColCount;
    }
    this.allInternalEdges = allInternalEdges;
    this.allCells = allCells;
    this.submodels = submodels;
  }

  draw(grid) {
    grid.eraseAll();
    let totalLiving = 0;
    for (const cells of this.allCells) {
      for (const key of cells) {
        totalLiving++;
        const row = Math.floor(key / this.colCount);
        const col = key % this.colCount;
        grid.drawCharAt(row, col, '#');
      }
    }
    return totalLiving;
  }

  async computeNext() {
    const edges = this.allInternalEdges;
    const computePromises = this.submodels.map((submodel, i) => {
      const externalLeftEdge = (i > 0) ? edges[i - 1].rightEdge : [];
      const externalRightEdge = (i < this.submodels.length - 1) ? edges[i + 1].leftEdge : [];
      return submodel.computeNext({ externalLeftEdge, externalRightEdge });
    });

    const result = await Promise.all(computePromises);
    this.allCells = result.map(obj => obj.cells);
    this.allInternalEdges = result.map(obj => obj.internalEdges);
  }

}

class SubModel {
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

    for (let row = this.row; row < this.row + this.rowCount; row++) {
      this.setCell(row, this.col - 1, externalEdges.externalLeftEdge[row]);
      this.setCell(row, this.col + this.colCount, externalEdges.externalRightEdge[row]);
    }

    const internalEdges = { leftEdge: [], rightEdge: [] };
    for (let row = this.row; row < this.row + this.rowCount; row++) {
      for (let col = this.col; col < this.col + this.colCount; col++) {
        const value = this.getCell(row, col);
        const liveNeighbors = this.livingNeighbors(row, col);

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