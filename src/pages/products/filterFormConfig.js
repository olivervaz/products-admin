const filters = [
  {
    id: 'title',
    name: 'Product name',
    template: `
    <input type="text" data-form="filterName" class="form-control" placeholder="Enter a title...">`,
    isComponent: false,
},
  {
    id: 'price',
    name: 'Price',
    template: '',
    isComponent: true,
  },
  { id: 'status',
    name: 'Status',
    template: `
    <select class="form-control" data-form="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
    </select>
    `
  }
];

export default filters;
