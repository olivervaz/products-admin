import DoubleSlider from '../../../components/double-slider';

const filters = [
  {
    id: 'title',
    name: 'Product name',
    template: `
    <input type="text" data-form="filterName" class="form-control" placeholder="Enter a title...">`,
    isComponent: false,
    component: null,
},
  {
    id: 'price',
    name: 'Price',
    template: '',
    isComponent: true,
    component:(() => {
      const doubleSlider = new DoubleSlider();
      doubleSlider.subElements.thumbLeft.dataset.filter = 'price_gte';
      doubleSlider.subElements.thumbRight.dataset.filter = 'price_lte';

      return doubleSlider;
    })()
  },
  { id: 'status',
    name: 'Status',
    template: `
    <select class="form-control" data-form="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
    </select>
    `,
    isComponent: false,
    component: null
  }
];

export default filters;
