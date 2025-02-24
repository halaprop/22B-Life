

/*****************************************************************************/
/*****************************************************************************/
// LifeModel

export class LifeModel {
  constructor(params) {
    this.rowOrigin = params.rowOrigin;
    this.colOrigin = params.colOrigin;
    this.rowCount = params.rowCount;
    this.colCount = params.colCount;
    this.cells = params.cells;
  }

  static modelFromString(string, format) {
    let params;

    if (format == 'txt') {
      params = this.parse22B(string)
    } else {
     params = this.parseConwayWiki(string)
    }
    params.rowOrigin = 0;
    params.colOrigin = 0;
    return new LifeModel(params);
  }

  static parse22B(string) {
    let lines = string.split('\n');
    if (!lines.length) return;

    const dims = lines[0].split(' ');
    const rowCount = parseInt(dims[0]);
    const colCount = parseInt(dims[1]);
    const cells = new Map();

    lines = lines.slice(1);

    for (let row = 0; row < lines.length; row++) {
      let line = lines[row];
      for (let col = 0; col < line.length; col++) {
        if (line[col] == 'O') {
          const key = row * colCount + col;
          cells.set(key, true);
        }
      }
    }
    return { rowCount, colCount, cells };
  }

  static parseConwayWiki(string) {
    let lines = string.split('\n');
    if (!lines.length) return;

    // first pass gets rowCount and colCount
    let rowCount = 0, colCount = 0;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line[0] == '!') continue;
      rowCount++;
      if (line.length > colCount) colCount = line.length;
    }

    const cells = new Map();

    for (let row = 0; row < lines.length; row++) {
      let line = lines[row];
      if (line[0] == '!') continue;
      for (let col = 0; col < line.length; col++) {
        if (line[col] == 'O') {
          const key = row * colCount + col;
          cells.set(key, true);
        }
      }
    }
    return { rowCount, colCount, cells };
  }

}

/*****************************************************************************/
/*****************************************************************************/

export class BuiltInFigureModal {
  // modalID must contain a <ul> with id #figure-list
  // modalID must contain button with id #run-figure
  constructor(modalID) {
    this.modal = UIkit.modal(modalID);
    this.items = document.querySelectorAll("#figure-list li");

    this.selection = null;
    UIkit.util.on(modalID, "beforeshow", () => this.beforeShow);

    this.items.forEach(item => {
      item.classList.add("uk-padding-small"); // Apply padding dynamically
      item.addEventListener("click", () => this.clickedItem(item));
    });

    this.runButton = this.modal.$el.querySelector("#run-figure");
  }

  beforeShow() {
    this.selectedItem = null;
    this.items.forEach(i => i.classList.remove("uk-background-primary", "uk-light"));
  }

  clickedItem(item) {
    this.items.forEach(i => i.classList.remove("uk-background-primary", "uk-light"));
    item.classList.add("uk-background-primary", "uk-light");
    this.selectedItem = item;
  }

  async fetchAndParse() {
    this.modal.hide();
    if (!this.selectedItem) return;

    const filename = this.selectedItem.getAttribute("data-file");
    const pathFilename = `/figures/${filename}`;
    try {
      let response = await fetch(pathFilename);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const string = await response.text();
      const format = filename.split('.').pop();

      // produce an object that describes a Life state
      // { rowCount, colCount, cells: new Map() }

      const model = LifeModel.modelFromString(string, format);
      // (extension == 'txt') ? this.parseTxt(contents) : this.parseCells(contents);
      return model;

    } catch (error) {
      console.error("Error fetching the file:", error);
    }
  }

}

