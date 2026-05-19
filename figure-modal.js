import { modelFromString } from './figure-parser.js';

export class FigureModal {
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
    const pathFilename = `figures/${filename}`;
    try {
      let response = await fetch(pathFilename);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const string = await response.text();
      const format = filename.split('.').pop();

      // produce an object that describes a Life state
      // { rowCount, colCount, cells: new Map() }
      const model = modelFromString(string, format);
      return model;

    } catch (error) {
      console.error("Error fetching the file:", error);
    }
  }
}


