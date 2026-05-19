export function modelFromString(string, format) {
  if (format === 'txt') {
    return parse22B(string);
  } else {
    return parseConwayWiki(string);
  }
}

export function parse22B(string) {
  let lines = string.split('\n');
  if (!lines.length) return;

  const dims = lines[0].split(' ');
  const rowCount = parseInt(dims[0]);
  const colCount = parseInt(dims[1]);
  const cells = new Set();

  lines = lines.slice(1);

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] === 'O') {
        cells.add(row * colCount + col);
      }
    }
  }
  return { rowCount, colCount, cells };
}

export function parseConwayWiki(string) {
  const lines = string.split('\n');
  if (!lines.length) return;

  let rowCount = 0, colCount = 0;
  for (const line of lines) {
    if (line[0] === '!') continue;
    rowCount++;
    if (line.length > colCount) colCount = line.length;
  }

  const cells = new Set();
  let dataRow = 0;

  for (const line of lines) {
    if (line[0] === '!') continue;
    for (let col = 0; col < line.length; col++) {
      if (line[col] === 'O') {
        cells.add(dataRow * colCount + col);
      }
    }
    dataRow++;
  }
  return { rowCount, colCount, cells };
}
