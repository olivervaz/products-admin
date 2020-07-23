import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  constructor(match) {
    this.productId = match[1];
  }

  async render() {
    const productForm = new ProductForm(this.productId);
    this.form = await productForm.render();
    this.element = document.createElement('div');

    this.element.innerHTML = this.template;

    this.element = this.element.firstElementChild;

    const contentBox = this.element.querySelector('.content-box');
    contentBox.append(this.form);

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
      <div class="content-box"></div>
    </div>`
  }

  initEventListeners(){

  }

}
