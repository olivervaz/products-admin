import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  fromSize = 0;
  toSize = 30;

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      /*finds first sortable column and
       uses its id for init sorting */
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    if (column) {
      const { id, order } = column.dataset;
      const arrow = column.querySelector('.sortable-table__sort-arrow');
      column.dataset.order = order === 'asc' ? 'desc' : 'asc';
      column.classList.add('bold');

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortLocally(id, order);
      } else {
        this.sortOnServer(id, order);
      }
    }
  };

  getTable() {
    return `
      <div class="sortable-table">
              ${this.getTableHeader()}
              ${this.getTableBody()}
      </div>`;
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getTableHeaderRow(item)).join('')}
    </div>`;
  }

  getTableHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getSortingArrow(id)}
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
      </div>`;
  }

  getTableBodyRows(data) {
    return data.map(item => this.formatRow(item.id, this.getTableBodyRow(item))).join('');
  }

  getTableBodyRow(item) {
    const cells = this.headersConfig.map(({id, template }) => {
      return {
        id,
        template
      };
    });

    return cells.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getProductUrl(obj) {
    if (obj.subcategory) {
      return `/${obj.subcategory}/${obj.id}`;
    }
    return `/${obj.id}/`;
  }

  async updateRows(params = new URLSearchParams()){
    const data = await this.loadData(this.sorted.id,this.sorted.order, params);
    this.renderRows(data);
  }

  get tableEmptyPlaceholder() {
    return `
            <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
    </div>`;
  }

  async renderRows(data) {
    if (data.length <= 0) {
      this.subElements.body.innerHTML = this.tableEmptyPlaceholder;

    } else {
      this.subElements.body.innerHTML = await this.getTableBodyRows(data);
    }
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = this.data = await this.loadData(id, order);

    await this.renderRows(data);

    this.initEventListeners();
  }

  async loadData(id, order, params = new URLSearchParams()) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.fromSize);
    this.url.searchParams.set('_end', this.toSize);

    [...params.entries()].forEach(pair => {
      this.url.searchParams.set(pair[0], pair[1]);
    })

    return await fetchJson(this.url);
  }

  sortLocally(id, order) {
    const data = this.sortData(id, order);
    this.renderRows(data);
    this.sorted.id = id;
    this.sorted.order = order;
  }

  async sortOnServer(id, order) {
    const serverData = await this.loadData(id, order);
    this.renderRows(serverData);
    this.sorted.id = id;
    this.sorted.order = order;
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
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
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements.header.removeEventListener('pointerdown', this.onSortClick);
    this.remove();
    this.subElements = {};
  }

  formatRow(id, row) {
    return `<div class="sortable-table__row">${row}</div>`
  }
}
