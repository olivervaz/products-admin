import SortableTable from "../../components/sortable-table";
import RangePicker from "../../components/range-picker";
import ColumnChart from "../../components/column-chart"
import header from "./tableHeadersConfig";
import fetchJson from '../../utils/fetch-json'

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
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);

    const sortableTable = new SortableTable(header, {
      url: `/api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}&_start=0&_end=30`,
      isSortLocally: true,
    });

    const rangePicker = new RangePicker({from, to});

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
    console.log(BACKEND_URL + 'api');
    const ORDERS = `${BACKEND_URL}api/dashboard/orders?
                            from=${from.toISOString()}&to=${to.toISOString()}`;
    const SALES = `${BACKEND_URL}api/dashboard/sales?
                            from=${from.toISOString()}&to=${to.toISOString()}`;
    const CUSTOMERS = `${BACKEND_URL}api/dashboard/customers?
                            from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

    const ordersData = fetchJson(ORDERS);
    const salesData = fetchJson(SALES);
    const customersData = fetchJson(CUSTOMERS);

    const data = await Promise.all([ordersData, salesData, customersData]);
    return data.map(item => Object.values(item));
  }

  async updateColumnsCharts(from, to) {
    const [ordersData, salesData, customersData] = await this.getDataForColumnCharts(from, to);
    this.components.ordersChart.update(ordersData);
    this.components.salesChart.update(salesData);
    this.components.customersChart.update(customersData);
  }

  async updateTable(from, to) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);
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
      const {element} = this.components[component];

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
      const {from, to} = event.detail;
      this.updateColumnsCharts(from, to);
      this.updateTable(from, to);
    });
  }

  destroy() {
    this.components.forEach(component => {
      component.destroy();
    });
  }
}
