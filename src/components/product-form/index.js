import fetchJson from "../../utils/fetch-json.js"

export default class ProductFormComponent {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    subcategory: '',
    price: '',
    discount: '',
    quantity: '',
    status: '',
    images: [],
    categories: []
  };

  onSubmit =  event => {
    event.preventDefault();
    this.save();
  };

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { imageUploadBtn, imageListContainer } = this.subElements;

        formData.append('image', file);

        imageUploadBtn.classList.add('is-loading');
        imageUploadBtn.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method:  'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        });

        imageListContainer.append(this.getImageTemplate({url: result.data.link, source: file.name}));

        imageUploadBtn.classList.remove('is-loading');
        imageUploadBtn.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    };

    // must be in body for IE
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  constructor(productId) {
    this.productId = productId;
    this.render();
  }

  get template() {
    return `
    <div class="product-form">
      <form name = "productForm" data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required=""
                   type="text"
                   name="title"
                   value="${this.formData.title}"
                   class="form-control"
                   placeholder="Название товара">
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required=""
                    class="form-control"
                    name="description"
                    data-element="productDescription"
                    placeholder="Описание товара">${this.formData.description}</textarea>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.categoriesTemplate}
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
           ${this.imageList}
          <div data-element="fileInputList"></div>
          <button type="button" name="uploadImage" class="button-primary-outline" data-element="imageUploadBtn">
            <span>Загрузить</span>
          </button>
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required=""
                   type="number"
                   name="price"
                   value="${this.formData.price}"
                   class="form-control"
                   placeholder="100">
          </fieldset>

          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required=""
                   type="number"
                   name="discount"
                   value="${this.formData.discount}"
                   class="form-control"
                   placeholder="0">
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required=""
                 type="number"
                 class="form-control"
                 name="quantity"
                 value="${this.formData.amount}"
                 placeholder="1">
        </div>

        <div class="form-group form-group__part-half">
           <label class="form-label">Статус</label>
           <select class="form-control" name="status">
           <option value="1">Активен</option>
           <option value="0">Неактивен</option>
           </select>
        </div>

        <div class="form-buttons">
          <button type="submit"
                  name="save"
                  class="button-primary-outline"
                  data-element ="productFormSaveBtn">Сохранить товар</button>
        </div>
      </form>
    </div>`
  }

  get categoriesTemplate() {
    return `
    <select class="form-control" name="subcategory">
      ${this.renderCategoriesOptions()}
    </select>`
  }

  get imageList() {
    return `
         <ul class="sortable-list" data-element="imageListContainer">
           ${this.renderImages()}
        </ul>`
  }

  getImageTemplate(imageObj) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${imageObj.url}">
          <input type="hidden" name="source" value="${imageObj.source}">
                  <span>
                     <img src="./icon-grab.svg" data-grab-handle="" alt="grab">
                     <img class="sortable-table__cell-img" alt="${imageObj.source}" src="${imageObj.url}">
                     <span>${imageObj.source}</span>
                  </span>
            <button type="button">
                <img src="./icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  async render() {
    const categoriesPromise = this.loadCategoriesList();
    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve([this.defaultFormData]);

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;


    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  renderCategoriesOptions() {
    return this.categories
      .map(category => {
        return category.subcategories.map(child => {
          return `<option value="${child.id}">${category.title + " > " + child.title}</option>`
        }).join('\\n');
      }).join('\n');
  }

  renderImages() {
    return this.formData.images.map(image => this.getImageTemplate(image).outerHTML).join('\n');
  }

  renderUploadImageInput() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
          <input> hidden name="images" type="file" accept="image/*">
    `;

    return wrapper.firstElementChild;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getInputsData() {
    const {productForm} = this.subElements;
    const fields = Object.keys(this.defaultFormData);
    const data = {}
    fields.forEach(field => {
      data[field] = productForm[field] && productForm[field].value;
    })

    data.images = [...this.element.querySelectorAll('.sortable-table__cell-img')].map(image => {
      return {
        url: image.src,
        name: image.alt
      }
    });

    return data;
  }

  dispatchEvent() {
    const event = new CustomEvent('product-saved', {
      bubbles: true,
      detail: this.getInputsData()
    })

    this.element.dispatchEvent(event);
  }

  initEventListeners() {
    const {imageListContainer, imageUploadBtn, productFormSaveBtn} = this.subElements;

    imageUploadBtn.addEventListener('click', this.uploadImage);
    productFormSaveBtn.addEventListener('click', this.onSubmit);
    imageListContainer.addEventListener('click', (event) => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    })
  }

  async save(){
    const product = this.getInputsData();

    const result = fetchJson(BACKEND_URL + '/api/rest/products',{
      method:  'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
  }

  async loadCategoriesList () {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProductData (productId) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}
