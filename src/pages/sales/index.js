import Page from '../base'
import InfinityTable from '../../components/infinity-table';
import RangePicker from '../../components/range-picker';
import header from './salesTableHeadersConfig';
import fetchJson from '../../utils/fetch-json';

export default class SalesPage extends Page{

  onDateSelect = event => {
    const { from, to } = event.detail;
    this.updateTable(from, to);
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

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.onDateSelect);
  }

  destroy() {
    this.components.rangePicker.element.removeEventListener('date-select', this.onDateSelect);
    super.destroy();
  }
}
