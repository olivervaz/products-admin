import SortableTable from '../sortable-table';

export default class ProductsTable extends SortableTable {
  formatRow(id, row) {
    let url = `/products/${id}`;
    return `<a href="${url}" class="sortable-table__row">${row}</a>`;
  }
}
