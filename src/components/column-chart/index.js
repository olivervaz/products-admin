export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
                data = [],
                label = '',
                link = '',
              } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;

    this.render();
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data);

    return data
      .map(item => {
        const scale = this.chartHeight / maxValue;
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getTotalValue(data){
    return data.reduce((acum,next)=> acum + next, 0);
  }

  get template () {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.label === 'sales'? '$':''}${this.getTotalValue(this.data)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove(`column-chart_loading`);
    }

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update (data) {
    this.subElements.header.textContent = this.getTotalValue(data);
    this.subElements.body.innerHTML = this.getColumnBody(data);
  }

  destroy() {
    this.element.remove();
  }
}
