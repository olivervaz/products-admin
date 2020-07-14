const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'User',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'date',
    template: data => {
      return `<div class="sortable-table__cell">
          ${new Date(data).toLocaleDateString("en")}
        </div>`;
    }
  },

  {
    id: 'totalCost',
    title: 'Total amount',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: 'Delivery',
    sortable: true,
    sortType: 'string'
  }
];

export default header;
