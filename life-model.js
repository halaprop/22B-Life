const kMaxSubmodels = 8;
const kOptimalWidth = 20;

const workerScript = './life-worker.js';

export class LifeModel {
  constructor(rowCount, colCount, sourceSet) {
    this.rowCount = rowCount;
    this.colCount = colCount;

    const submodelCount = Math.min(kMaxSubmodels, Math.ceil(colCount / kOptimalWidth));
    const width = Math.floor(colCount / submodelCount);
    let remainder = colCount % submodelCount;

    console.log("submodel count", submodelCount, "approx size", { rowCount, width }, `${rowCount*width} cells each`);

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
          const value = sourceSet.has(key);
          if (value) {
            cells.add(key);
          }
          if (col == subCol) {
            leftEdge.push(value);
          } else if (col == subCol + subColCount - 1) {
            rightEdge.push(value);
          }
        }
      }
      allInternalEdges.push({ leftEdge, rightEdge });
      allCells.push(cells);

      // submodel params are { row, col, rowCount, colCount, parentColCount, cells }
      const params = { row: 0, col: subCol, rowCount, colCount: subColCount, parentColCount: colCount, cells }
      const submodel = new SubModelProxy(params);
      submodels.push(submodel);
      subCol += subColCount;
    }
    this.allInternalEdges = allInternalEdges;
    this.allCells = allCells;
    this.submodels = submodels;
  }

  async init() {
    try {
      for (let submodel of this.submodels) {
        await submodel.create();
      }
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  draw(grid) {
    grid.eraseAll();
    let totalLiving = 0;
    for (const cells of this.allCells) {
      totalLiving += grid.drawSet(cells);
    }
    return totalLiving;
  }

  // so we can do fast rendering as a string
  // render into: 
  //   <div id="text-canvas"  style="border: 1px solid white; white-space: pre;  font-family: monospace;  width: 100%;  height: 100%;  overflow: auto; font-size: 2px;"></div>
  asString() {
    const bytes = new Uint8Array(this.rowCount * this.colCount + this.rowCount - 1).fill(0x20);
    for (let i = 0; i < this.rowCount - 1; i++) {
        bytes[(i + 1) * this.colCount + i] = 0x0A;
    }
    for (const cells of this.allCells) {
        for (const key of cells) {
            let adjustedKey = key + Math.floor(key / this.colCount); 
            bytes[adjustedKey] = 0x23;
        }
    }
    return new TextDecoder().decode(bytes);
  }

  async computeNext() {
    try {
      const edges = this.allInternalEdges;
      const computePromises = this.submodels.map((submodel, i) => {
        const externalLeftEdge = (i > 0) ? edges[i - 1].rightEdge : [];
        const externalRightEdge = (i < this.submodels.length - 1) ? edges[i + 1].leftEdge : [];
        return submodel.compute({ externalLeftEdge, externalRightEdge });
      });

      const result = await Promise.all(computePromises);
      this.allCells = result.map(obj => obj.cells);
      this.allInternalEdges = result.map(obj => obj.internalEdges);
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }
}


/*****************************************************************************/
/*****************************************************************************/

export class SubModelProxy {
  constructor(submodelParams) {
    this.submodelParams = submodelParams;
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

  async create() {
    const promise = this.sendMessage('create', this.submodelParams);
    this.submodelParams = null; // the worker keeps the current state;
    return promise;
  }

  async compute(params) {
    return this.sendMessage('compute', params);
  }
}
