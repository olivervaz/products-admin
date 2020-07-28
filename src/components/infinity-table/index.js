import SortableTable from '../sortable-table';

export default class InfinityTable extends SortableTable{

  onScroll = async (event) => {
    const { id, order } = this.sorted;
    const windowBottom = document.documentElement.getBoundingClientRect().bottom;

    if (!this.isLoading && windowBottom < document.documentElement.clientHeight + 100) {
      this.isLoading = true;
      this.fromSize = this.toSize;
      this.toSize = this.toSize + 20;
      const data = this.data = await this.loadData(id, order);

      if (data.length > 0) {
        const rows = this.getTableBodyRows(data);
        this.subElements.body.insertAdjacentHTML('beforeend', rows);
      } else {
        window.removeEventListener('scroll', this.onScroll);
      }
    }
    this.isLoading = false;
  };

  initEventListeners() {
    super.initEventListeners();
    window.addEventListener('scroll', this.onScroll);
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll);
    super.destroy();
  }
}
