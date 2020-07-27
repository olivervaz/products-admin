import FilterForm from '../../components/filter-form';
import ProductsTable from '../../components/products-table';
import header from './productsTableHeadersConfig';
import filters from './filterFormConfig';
import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  subElements = {};
  components = {};

  onDataFilter = (event) => {
    const formData = event.detail;
    const params = this.createQueryParams(formData);

    this.updateTable(params)
  }

  async initComponents() {
    const sortableTable = new ProductsTable(header, {
      url: `/api/rest/products?_embed=subcategory.category`,
      isSortLocally: false,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    const filterForm = new FilterForm(filters);

    this.components.sortableTable = sortableTable;
    this.components.filterForm = filterForm;
  }

  get template() {
    return `<div class="products">
      <div class="content__top-panel">
        <h2 class="page-title">Products</h2>
        <a href="/products/add" class="button-primary">Add products</a>
      </div>
      <div class="content-box content-box_small" data-element="filterForm">
            <!--filter-form component-->
      </div>
      <div data-element="sortableTable">
            <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async updateTable(params ='') {
    const PRODUCTS_URL = new URL(`${BACKEND_URL}api/rest/products?_embed=subcategory.category&${params}`);
    console.log(PRODUCTS_URL);
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
    document.addEventListener('datafilter', this.onDataFilter);
  }

  destroy() {
    document.removeEventListener('datafilter', this.onDataFilter);
    this.components.forEach(component => {
      component.destroy();
    });
  }

  createQueryParams(formData) {
    const queryParams = new URLSearchParams('');

    for (const param in formData) {

      if (formData.hasOwnProperty(param)) {
        queryParams.append('_' + param, formData[param]);
      }
    }
    return queryParams;
  }
}
