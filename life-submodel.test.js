import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SubModel } from './life-submodel.js';

const ROWS = 5;
const COLS = 5;
const key = (r, c) => r * COLS + c;

function makeModel(aliveCells) {
  const cells = new Set(aliveCells.map(([r, c]) => key(r, c)));
  return new SubModel({ row: 0, col: 0, rowCount: ROWS, colCount: COLS, cells });
}

function alivePairs(model) {
  return [...model.cells]
    .map(k => [Math.floor(k / COLS), k % COLS])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

const noEdges = { externalTopEdge: [], externalBottomEdge: [] };

test('blinker oscillates', () => {
  const m = makeModel([[1, 2], [2, 2], [3, 2]]);
  m.computeNext(noEdges);
  assert.deepEqual(alivePairs(m), [[2, 1], [2, 2], [2, 3]]);
  m.computeNext(noEdges);
  assert.deepEqual(alivePairs(m), [[1, 2], [2, 2], [3, 2]]);
});

test('block is a still life', () => {
  const m = makeModel([[1, 1], [1, 2], [2, 1], [2, 2]]);
  m.computeNext(noEdges);
  assert.deepEqual(alivePairs(m), [[1, 1], [1, 2], [2, 1], [2, 2]]);
});

test('lone cell dies', () => {
  const m = makeModel([[2, 2]]);
  m.computeNext(noEdges);
  assert.equal(m.cells.size, 0);
});

test('dead cell with 3 neighbors is born', () => {
  const m = makeModel([[1, 1], [1, 2], [2, 1]]);
  m.computeNext(noEdges);
  assert.ok(m.cells.has(key(2, 2)));
});

test('external top edge counts as neighbors', () => {
  const SUB_ROW = 3;
  const cells = new Set();
  const m = new SubModel({ row: SUB_ROW, col: 0, rowCount: 3, colCount: COLS, cells });

  // three live cells in the row above the submodel, at cols 1-3
  // cell at [3,2] has exactly 3 neighbors from external edge → should be born
  const externalTopEdge = [false, true, true, true, false];
  m.computeNext({ externalTopEdge, externalBottomEdge: [] });

  assert.ok(m.cells.has(SUB_ROW * COLS + 2));
});
