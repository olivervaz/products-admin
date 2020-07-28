import InfinityTable from '../../components/infinity-table';
import RangePicker from '../../components/range-picker';
import header from './salesTableHeadersConfig';
import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
  }

  async initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
    const encodedFrom = encodeURIComponent(from.toISOString());
    const encodedTo = encodeURIComponent(to.toISOString());

    const infinityTable = new InfinityTable(header, {
      url: `api/rest/orders`,
      isSortLocally: false,
      sorted: {
        id: 'createdAt',
        order: 'asc'
      }
    });

    const rangePicker = new RangePicker({ from, to });

    this.components.infinityTable = infinityTable;
    this.components.rangePicker = rangePicker;
  }

  get template() {
    return `<div class="sales">
      <div class="content__top-panel">
        <h2 class="page-title">Sales</h2>
        <!-- range-picker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="infinityTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async updateTable(from, to) {
    const encodedFrom = encodeURIComponent(from.toISOString());
    const encodedTo = encodeURIComponent(to.toISOString());
    const params = new URLSearchParams();

    params.append('createdAt_gte', encodedFrom);
    params.append('createdAt_lte', encodedTo)

    this.components.infinityTable.updateRows(params);
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    await this.initComponents();

    this.subElements = this.getSubElements(this.element);

    this.renderComponents();

    this.initEventListeners();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateTable(from, to);
    });
  }

  destroy() {
    for(const component in this.components){
      this.components[component].destroy();
    }
  }
}
