import SortableTable from '../../components/sortable-table';
import RangePicker from '../../components/range-picker';
import ColumnChart from '../../components/column-chart';
import header from './bestsellersTableHeadersConfig';
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
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);

    const sortableTable = new SortableTable(header, {
      url: `/api/dashboard/bestsellers?from=${encodedFrom}&to=${encodedTo}`,
      isSortLocally: true
    });

    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      data: ordersData,
      label: 'orders',
      link: '#'
    });
    const salesChart = new ColumnChart({
      data: salesData,
      label: 'sales',
      link: 'sales/'
    });
    const customersChart = new ColumnChart({
      data: customersData,
      label: 'customers',
      link: 'customers/'
    });

    this.components.sortableTable = sortableTable;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
    this.components.rangePicker = rangePicker;
  }

  get template() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- range-picker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async getDataForColumnCharts(from, to) {
    const encodedFrom = encodeURIComponent(from.toISOString());
    const encodedTo = encodeURIComponent(to.toISOString());

    const ORDERS_URL = `${BACKEND_URL}api/dashboard/orders?from=${encodedFrom}&to=${encodedTo}`;
    const SALES_URL = `${BACKEND_URL}api/dashboard/sales?from=${encodedFrom}&to=${encodedTo}`;
    const CUSTOMERS_URL = `${BACKEND_URL}api/dashboard/customers?from=${encodedFrom}&to=${encodedTo}`;

    const ordersData = fetchJson(ORDERS_URL);
    const salesData = fetchJson(SALES_URL);
    const customersData = fetchJson(CUSTOMERS_URL);

    const data = await Promise.all([ordersData, salesData, customersData]);
    return data.map(item => Object.values(item));
  }

  async updateColumnsCharts(from, to) {
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);
    this.components.ordersChart.update(ordersData);
    this.components.salesChart.update(salesData);
    this.components.customersChart.update(customersData);
  }

  updateTable(from, to) {
    const encodedFrom = encodeURIComponent(from.toISOString());
    const encodedTo = encodeURIComponent(to.toISOString());

    const params = new URLSearchParams();
    params.append('from', encodedFrom);
    params.append('to', encodedTo);

    this.components.sortableTable.updateRows(params);
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
      this.updateColumnsCharts(from, to);
      this.updateTable(from, to);
    });
  }

  destroy() {
    for(const component in this.components){
      this.components[component].destroy();
    }
  }
}
