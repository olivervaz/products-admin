import Page from '../base';
import SortableList from '../../components/sortable-list';
import fetchJson from '../../utils/fetch-json';

const BACKEND_URL = process.env.BACKEND_URL;

export default class CategoriesPage extends Page{

  onPageClick = event => {
    const target = event.target.closest('.category__header');

    if(target){
      const category = event.target.closest('.category');
      category.classList.toggle('category_open');
    }
  }

  get template() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h2 class="page-title">Categories</h2>
       </div>
        <div data-element="categoriesContainer"></div>
        <!-- sortable-list components -->
    </div>`;
  }

  getCategoryTemplate(obj) {
    //TODO: create separate component for drop-down lists
    return `
        <div class="category" data-id="${obj.id}">
            <header class="category__header">${obj.title}</header>
            <div class="category__body">
            <div class="subcategory-list">${this.getSubcategoriesElement(obj.subcategories)}</div>
            </div>
        </div>`;
  }

  getSubcategoryElementTemplate(item) {
    return `
        <li class="categories__sortable-list-item" data-id="${item.id}">
            <span>${item.title}</span>
            <span><b>${item.count}</b> products</span>
        </li>
    `;
  }

  async getCategories() {
    const CATEGORIES_URL = `${BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`;

    return await fetchJson(CATEGORIES_URL);
  }

  getSubcategoriesElement(subcategories) {
    const element = document.createElement('div');
    const list = new SortableList({
      items: subcategories.map(item => {
        const elem = document.createElement('div');
        elem.innerHTML = this.getSubcategoryElementTemplate(item);
        return elem.firstElementChild;
      })
    });
    element.append(list.element);

    return element.innerHTML;
  }


  renderCategories(data) {
    const { categoriesContainer } = this.subElements;
    categoriesContainer.innerHTML = data.map(category => this.getCategoryTemplate(category)).join('\n');
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    const data = await this.getCategories();

    this.renderCategories(data);

    document.addEventListener('click', this.onPageClick);

    return this.element;
  }
}
