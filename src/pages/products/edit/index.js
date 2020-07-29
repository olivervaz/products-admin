import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match) {
    this.productId = match[1];
  }

  async initComponents(){
    const productForm = new ProductForm(this.productId);
    await productForm.render();
    this.components.productForm = productForm;
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

  get template() {
    return `
    <div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Products</a> / ${this.productId ? 'Edit' : 'Add'}
        </h1>
      </div>
      <div class="content-box" data-element="productForm"></div>
    </div>`
  }

  initEventListeners(){

  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  destroy() {
    for(const component in this.components){
      this.components[component].destroy();
    }
  }

}
