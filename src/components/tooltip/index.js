class Tooltip {
  static instance;

  element;

  onPointerOut = (event) => {
    this.remove();
  }

  onPointerOver = (event) => {
    const target = event.target.closest('[data-tooltip]');
    if(target) {
      this.render(target.dataset.tooltip);
      this.defineTooltipPosition(event);
    }
  }

  onPointerMove = (event) => {
    this.defineTooltipPosition(event)
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  getTooltipTemplate(text) {
    return `<div class="tooltip">${text}</div>`
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
    document.addEventListener('pointermove', this.onPointerMove);
  }

  initialize() {
    this.initEventListeners();
  }

  defineTooltipPosition(event){
    this.element.style.top = event.clientY + 10 + 'px';
    this.element.style.left = event.clientX + 10 + 'px';
  }

  render(text) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTooltipTemplate(text);
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
    this.remove();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}

const tooltip = new Tooltip();

export default tooltip;
