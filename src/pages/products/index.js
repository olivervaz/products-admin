import SortableTable from '../../components/sortable-table';
import DoubleSlider from '../../components/double-slider';
import header from './productsTableHeadersConfig';
import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
  }

  async initComponents() {
    const sortableTable = new SortableTable(header, {
      url: `/api/rest/products?_embed=subcategory.category`,
      isSortLocally: false,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    const doubleSlider = new DoubleSlider({})

    this.components.sortableTable = sortableTable;
    this.components.doubleSlider = doubleSlider;
  }

  get template() {
    return `<div class="products">
      <div class="content__top-panel">
        <h2 class="page-title">Products</h2>
        <a href="/products/add" class="button-primary">Add products</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
         <div class="form-group">
            <label class="form-label">Sort by:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Product name">
          </div>
          <div class="form-group" data-element="doubleSlider">
            <label class="form-label" for="">Price:</label>
            <!-- double slider component -->
          </div>
          <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Both</option>
              <option value="1">Active</option>
              <option value="0">Not active</option>
            </select>
          </div>
          </form>
         </div>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async updateTable(from, to) {
    const encodedFrom = encodeURIComponent(from.toISOString());
    const encodedTo = encodeURIComponent(to.toISOString());

    const PRODUCTS_URL = `${BACKEND_URL}/api/rest/products?_embed=subcategory.category`;

    const data = await fetchJson(PRODUCTS_URL);

    //TODO: implement logic with add rows;
    this.components.sortableTable.addRows(data);
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
  }

  destroy() {
    this.components.forEach(component => {
      component.destroy();
    });
  }
}
