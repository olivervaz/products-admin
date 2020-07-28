import InfinityTable from '../infinity-table';

export default class ProductsTable extends InfinityTable {
  formatRow(id, row) {
    let url = `/products/${id}`;
    return `<a href="${url}" class="sortable-table__row">${row}</a>`;
  }
}
