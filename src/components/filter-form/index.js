export default class FilterForm {
  constructor(items = [
    {
      id: '',
      name: '',
      template: '',
      isComponent: true
    }
  ]) {
    this.items = items;

    this.render();
  }

  onFormChange = (event) => {
    const isFilter = event.target.dataset.filter;

    if (isFilter) {
      const data = this.getFormsData();

      this.element.dispatchEvent(new CustomEvent('datafilter', {
        bubbles: true,
        detail: data
      }));
    }
  };

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.renderInputs();

    this.element.addEventListener('change', this.onFormChange);
  }

  renderInputs() {
    this.items.forEach(item => {
      const fieldSet = document.createElement('div');
      fieldSet.classList.add('form-group');

      if (!item.isComponent) {
        fieldSet.innerHTML = item.template;
      } else{
        fieldSet.append(item.component.element);
      }

      fieldSet.firstElementChild.dataset.filter = item.id;
      const label = document.createElement('label');
      label.classList.add('form-label');
      label.innerText = item.name + ':';
      fieldSet.prepend(label);

      this.element.append(fieldSet);
    });
  }



  getFormsData() {
    const elements = this.element.querySelectorAll('[data-filter]');

    /*for components set attributes(value, data-filter) in component`s configs*/

    return [...elements].reduce((accum, input) => {
      accum[input.dataset.filter] = input.value;

      return accum;
    }, {});
  }

  get template() {
    return `
      <form class="form-inline form-filters"></form>
    `;
  }

  destroy(){
    this.element.removeEventListener('change', this.onFormChange);
    this.element.remove();
  }

}
