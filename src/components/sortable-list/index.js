export default class SortableList {
  element;

  onPointerDown = (event) => {
    const target = event.target.closest('.sortable-list__item');
    const { clientX, clientY } = event;

    if (target) {
      event.preventDefault();
      this.moving = target;
      this.moving.classList.add('sortable-list__item_dragging');
      this.initialIndex = [...this.element.children].indexOf(this.moving);
      this.placeholder = this.placeholderTemplate;
      this.moving.after(this.placeholder);

      this.shift = {
        x: event.clientX - target.getBoundingClientRect().x,
        y: event.clientY - target.getBoundingClientRect().y
      };
      this.moveElement({ clientX, clientY });

      document.addEventListener('pointermove', this.onPointerMove);
      document.addEventListener('pointerup', this.onPointerUp);
    }
  };

  onPointerMove = (event) => {
    const { clientX, clientY } = event;
    this.moveElement({ clientX, clientY });

    const elementBelow = document.elementFromPoint(clientX, clientY);

    if (elementBelow) {
      const elementParent = elementBelow.parentNode;
      const index = [...elementParent.children].indexOf(elementBelow);
      const { top } = elementParent.firstElementChild.getBoundingClientRect();
      const { bottom } = elementParent.lastElementChild.getBoundingClientRect();

      if (clientY < top) {
        this.movePlaceholderTo(index);
      } else {
        this.movePlaceholderTo(index + 1);
      }
    }
  };

  onPointerUp = (event) => {
    const index = [...this.element.children].indexOf(this.placeholder);

    this.placeholder.replaceWith(this.moving);
    this.clearMovingData();

    if (this.initialIndex !== index) {
      this.dispatchEvent();
    }

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  };

  constructor({ items = [] } = {}) {
    //items should be node elements;
    this.items = items;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.renderList();

    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  get template() {
    return `
    <ul class="sortable-list">
    </ul>`;
  }

  get placeholderTemplate() {
    const placeholder = document.createElement('div');
    const movingHeight = this.moving.getBoundingClientRect().height;

    placeholder.style.height = movingHeight + 'px';
    placeholder.classList.add('sortable-list__placeholder');

    return placeholder;
  }

  renderList() {
    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      item.dataset.grabHandle = 'true';
      this.element.append(item);
    });
  }

  moveElement({ clientX, clientY }) {
    this.moving.style.left = clientX - this.shift.x + 'px';
    this.moving.style.top = clientY - this.shift.y + 'px';
  }

  movePlaceholderTo(index) {
    const currentElement = this.element.children[index];

    if (currentElement !== this.placeholder) {
      this.element.insertBefore(this.placeholder, currentElement);
    }
  }

  clearMovingData() {
    this.moving.classList.remove('sortable-list__item_dragging');
    this.moving.style.left = '';
    this.moving.style.top = '';
    this.initialIndex = null;
    this.shift = null;
    this.moving = null;
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('reordered', {
      bubbles: true
    }));
  }

  scrollWindow(clientY) {
    const scrollingValue = 10;
    const threshold = 20;

    if (clientY < threshold) {
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingValue);
    }
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.element.remove();
  }
}
