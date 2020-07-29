import Page from '../../base';
import ProductsTable from '../../../components/products-table';
import FilterForm from '../../../components/filter-form';
import header from './productsTableHeadersConfig';
import filters from './filterFormConfig';

export default class ProductsListPage extends Page{

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

  updateTable(params = new URLSearchParams()) {
    this.components.sortableTable.updateRows(params);
  }

  initEventListeners() {
    document.addEventListener('datafilter', this.onDataFilter);
  }

  destroy() {
    document.removeEventListener('datafilter', this.onDataFilter);
    super.destroy();
  }

  createQueryParams(formData) {
    const queryParams = new URLSearchParams('');

    for (const param in formData) {

      if (formData.hasOwnProperty(param)) {

        if (formData[param]){
          /*if param is not empty and not undefined*/
          queryParams.append(param, formData[param]);
        }

      }
    }
    return queryParams;
  }
}
