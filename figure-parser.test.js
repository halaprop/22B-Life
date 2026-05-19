import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse22B, parseConwayWiki } from './figure-parser.js';

const key = (r, c, colCount) => r * colCount + c;

// parse22B

test('parse22B: reads dimensions from header', () => {
  const input = '3 5\n.....\n.....\n.....\n';
  const model = parse22B(input);
  assert.equal(model.rowCount, 3);
  assert.equal(model.colCount, 5);
});

test('parse22B: places live cells at correct positions', () => {
  const input = '3 5\n.....\n..O..\n.....\n';
  const model = parse22B(input);
  assert.equal(model.cells.size, 1);
  assert.ok(model.cells.has(key(1, 2, model.colCount)));
});

test('parse22B: empty grid has no cells', () => {
  const input = '3 3\n...\n...\n...\n';
  const model = parse22B(input);
  assert.equal(model.cells.size, 0);
});

// parseConwayWiki

test('parseConwayWiki: places live cell at correct position', () => {
  const input = '.O.\n...\n';
  const model = parseConwayWiki(input);
  assert.ok(model.cells.has(key(0, 1, model.colCount)));
});

test('parseConwayWiki: comment lines do not shift cell rows', () => {
  const input = '! comment\n! another\n.O.\n...\n';
  const model = parseConwayWiki(input);
  // first data row is row 0 — without the fix this would land at row 2
  assert.ok(model.cells.has(key(0, 1, model.colCount)));
});

test('parseConwayWiki: rowCount excludes comment lines', () => {
  const input = '! comment\n.O.\n...\n';
  const model = parseConwayWiki(input);
  assert.equal(model.rowCount, 2);
});

test('parseConwayWiki: colCount is width of widest data line', () => {
  const input = '! comment\n.O.\n.....\n';
  const model = parseConwayWiki(input);
  assert.equal(model.colCount, 5);
});
