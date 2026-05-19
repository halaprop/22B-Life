import { modelFromString } from './figure-parser.js';

const kPatterns = [
  { category: 'Test', patterns: [
    { name: 'Basic Figures',    file: 'basic-figures.txt', note: 'classic still lifes and oscillators' },
    { name: 'Burst',            file: 'burst.txt' },
    { name: 'Canada Goose',     file: 'canada-goose.txt',  note: 'diagonal spaceship' },
    { name: 'Glider Gun',       file: 'glider-gun.txt',    note: 'Gosper · fires every 30 gens' },
    { name: 'Queen Bee',        file: 'queen-bee.txt',     note: 'period 30 shuttle' },
    { name: 'R-pent',           file: 'rpent.txt',         note: '5 cells · 1,103 generations' },
    { name: "Gosper's Breeder", file: 'breeder1.cells',    note: 'first breeder · quadratic growth' },
  ]},
  { category: 'Still Lifes', patterns: [
    { name: 'Block',   file: 'block.rle',   note: '4 cells · stable' },
    { name: 'Beehive', file: 'beehive.rle', note: '6 cells · stable' },
    { name: 'Loaf',    file: 'loaf.rle',    note: '7 cells · stable' },
  ]},
  { category: 'Oscillators', patterns: [
    { name: 'Blinker (p2)',         file: 'blinker.rle',        note: '3 cells · period 2' },
    { name: 'Toad (p2)',            file: 'toad.rle',           note: '6 cells · period 2' },
    { name: 'Beacon (p2)',          file: 'beacon.rle',         note: 'period 2' },
    { name: 'Pulsar (p3)',          file: 'pulsar.rle',         note: '48 cells · period 3' },
    { name: 'Pentadecathlon (p15)', file: 'pentadecathlon.rle', note: '10 cells · period 15' },
  ]},
  { category: 'Spaceships', patterns: [
    { name: 'Glider',                 file: 'glider.rle',     note: '5 cells · c/4 diagonal' },
    { name: 'Lightweight spaceship',  file: 'lwss.rle',       note: 'c/2 orthogonal · period 4' },
    { name: 'Middleweight spaceship', file: 'mwss.rle',       note: 'c/2 orthogonal · period 4' },
    { name: 'Heavyweight spaceship',  file: 'hwss.rle',       note: 'c/2 orthogonal · period 4' },
    { name: 'Copperhead',             file: 'copperhead.rle', note: 'c/10 orthogonal · found 2016' },
    { name: 'Sir Robin',              file: 'sirrobin.rle',   note: 'c/6 orthogonal · first pure orthogonal · found 2018' },
  ]},
  { category: 'Guns', patterns: [
    { name: 'Gosper glider gun', file: 'gosperglidergun.rle', note: 'period 30 · first gun ever found' },
    { name: 'Simkin glider gun', file: 'simkinglidergun.rle', note: 'period 120 · smallest known gun' },
  ]},
  { category: 'Methuselahs', patterns: [
    { name: 'Acorn',   file: 'acorn.rle',   note: '7 cells · 5,206 generations' },
    { name: 'Diehard', file: 'diehard.rle', note: '7 cells · vanishes after 130 gens' },
    { name: 'Lidka',   file: 'lidka.rle',   note: '13 cells · 29,055 generations' },
    { name: 'Bunnies', file: 'bunnies.rle', note: '9 cells · 17,332 generations' },
  ]},
  { category: 'Puffers', patterns: [
    { name: 'Puffer 1', file: 'puffer1.rle', note: 'first puffer ever found · leaves debris trail' },
  ]},
  { category: 'Complex', patterns: [
    { name: 'Switch engine', file: 'switchengine.rle', note: '10 cells · grows infinitely via puffer trail' },
    { name: 'Max',           file: 'max.rle',          note: 'spacefiller · expands to fill all space with zebra stripes' },
  ]},
];

export class FigureModal {
  constructor(modalID) {
    this.modal = UIkit.modal(modalID);
    this.selectedItem = null;
    this.runButton = document.querySelector('#run-browse');
    this._buildAccordion();
  }

  _buildAccordion() {
    const accordion = document.querySelector('#browse-accordion');
    for (const { category, patterns } of kPatterns) {
      const li = document.createElement('li');
      const items = patterns.map(p => {
        const noteHtml = p.note
          ? `<div class="uk-text-muted uk-text-small">${p.note}</div>`
          : '';
        return `<li class="uk-padding-small" data-file="${p.file}">${p.name}${noteHtml}</li>`;
      }).join('');
      li.innerHTML = `
        <a class="uk-accordion-title" href="#">${category}</a>
        <div class="uk-accordion-content">
          <ul class="uk-list uk-list-divider">${items}</ul>
        </div>`;
      accordion.appendChild(li);
    }

    accordion.querySelectorAll('[data-file]').forEach(item => {
      item.addEventListener('click', () => this._clickedItem(item));
    });
  }

  _clickedItem(item) {
    document.querySelectorAll('#browse-accordion [data-file]').forEach(i =>
      i.classList.remove('uk-background-primary', 'uk-light')
    );
    item.classList.add('uk-background-primary', 'uk-light');
    this.selectedItem = item;
    this.selectedPattern = kPatterns
      .flatMap(cat => cat.patterns)
      .find(p => p.file === item.getAttribute('data-file'));
  }

  async fetchAndParse() {
    this.modal.hide();
    if (!this.selectedItem) return null;
    const file = this.selectedItem.getAttribute('data-file');
    const response = await fetch(`figures/${file}`);
    const text = await response.text();
    const model = modelFromString(text, file.split('.').pop());
    if (!model) return null;
    return { ...model, name: this.selectedPattern?.name, note: this.selectedPattern?.note };
  }
}
