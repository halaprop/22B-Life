export function modelFromString(string, format) {
  if (format === 'txt') return parse22B(string);
  if (format === 'cells') return parseConwayWiki(string);
  if (format === 'rle') return parseRLE(string);
  // auto-detect pasted content: RLE has an "x = N" header line
  return /x\s*=/.test(string) ? parseRLE(string) : parseConwayWiki(string);
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

export function parseRLE(string) {
  const lines = string.split('\n').filter(l => l.trim().length > 0);

  let i = 0;
  while (i < lines.length && lines[i][0] === '#') i++;
  if (i >= lines.length) return null;

  const header = lines[i++];
  const xMatch = header.match(/x\s*=\s*(\d+)/);
  const yMatch = header.match(/y\s*=\s*(\d+)/);
  if (!xMatch || !yMatch) return null;

  const colCount = parseInt(xMatch[1]);
  const rowCount = parseInt(yMatch[1]);
  const data = lines.slice(i).join('').split('!')[0];

  const cells = new Set();
  let row = 0, col = 0, runStr = '';

  for (const ch of data) {
    if (ch >= '0' && ch <= '9') {
      runStr += ch;
    } else {
      const count = runStr ? parseInt(runStr) : 1;
      runStr = '';
      if (ch === 'b') {
        col += count;
      } else if (ch === 'o') {
        for (let k = 0; k < count; k++) cells.add(row * colCount + col++);
      } else if (ch === '$') {
        row += count;
        col = 0;
      }
    }
  }
  return { rowCount, colCount, cells };
}

export function parseConwayWiki(string) {
  const lines = string.split('\n').filter(l => l.length > 0);
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
