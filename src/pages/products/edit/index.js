import Page from '../../base'
import ProductForm from '../../../components/product-form/index.js';

export default class ProductFormPage extends Page{

  constructor(match) {
    super();
    this.productId = match[1];
  }

  async initComponents(){
    const productForm = new ProductForm(this.productId);
    await productForm.render();
    this.components.productForm = productForm;
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

}
