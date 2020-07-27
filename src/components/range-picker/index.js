export default class RangePicker {
  element;
  subElements = {};
  selectingFrom = true;
  selected = {
    from: new Date(),
    to: new Date()
  };
  dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit'};

  static daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }


  constructor({
                from = new Date(),
                to = new Date()
              } = {}
  ) {
    this.showDateFrom = new Date(from);
    this.selected = { from, to };

    this.render();
  }

  get template() {
    return `<div class="rangepicker">
        <div class="rangepicker__input" data-elem="input">
           ${this.inputTemplate}
        </div>
        <div class="rangepicker__selector" data-elem="selector"></div>
    </div>`;
  }

  get inputTemplate() {
    return `
      <span data-elem="from">${this.selected.from.toLocaleDateString('en-EN', this.dateOptions)}</span> -
      <span data-elem="to">${this.selected.to.toLocaleDateString('en-EN', this.dateOptions)}</span>
    `;
  }

  get selectorTemplate() {
    const dateFrom = new Date(this.showDateFrom);
    const dateTo = new Date(this.showDateFrom);

    dateTo.setMonth(dateFrom.getMonth() + 1);

    return `
          <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control rangepicker__selector-control-left"></div>
          <div class="rangepicker__selector-control rangepicker__selector-control-right"></div>
          <div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
              <time datetime="${dateFrom.toLocaleString('en-EN', { month: 'long' })}">
                 ${dateFrom.toLocaleString('en-EN', { month: 'long' })}
              </time>
            </div>
            ${this.weekDaysTemplate}
            ${this.getMonthDates(dateFrom.getMonth(), dateFrom.getFullYear())}
          </div>
          <div class="rangepicker__calendar">
           <div class="rangepicker__month-indicator">
              <time datetime="${dateTo.toLocaleString('en-EN', { month: 'long' })}">
                 ${dateTo.toLocaleString('en-EN', { month: 'long' })}
              </time>
            </div>
            ${this.weekDaysTemplate}
            ${this.getMonthDates(dateTo.getMonth(), dateTo.getFullYear())}
          </div>`;
  }

  get weekDaysTemplate() {
    const weekDays = ['Пн', 'Вт', 'Cр', 'Чт', 'Пт', 'Сб', 'Вс'];
    return `
        <div class="rangepicker__day-of-week">
            ${weekDays.map(item => `<div>${item}</div>`).join('')}
        </div>
  `;
  }

  getMonthDates(month, year) {
    /*
    creates array with dates
    iterateі through array
    returns dates templates
    */
    const daysAmount = [...Array(RangePicker.daysInMonth(month, year)).keys()].map(x => x + 1);
    return `
        <div class="rangepicker__date-grid">
            ${daysAmount.map(day => this.getDateTemplate(day, month, year)).join('')}
        </div>
  `;
  }

  getDateTemplate(day, month, year) {
    const date = new Date(year, month, day);
    return `
     <button type="button"
             class="rangepicker__cell"
             data-value="${date}">${day}</button>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-elem]')) {
      subElements[subElement.dataset.elem] = subElement;
    }

    return subElements;
  }

  initEventListeners() {
    const { input, selector } = this.subElements;
    document.addEventListener('click', this.onOuterClick, true);
    input.addEventListener('click', this.onInputClick);
    selector.addEventListener('click', this.onArrowClick);
    selector.addEventListener('click', this.onDateClick);
  }


  onOuterClick = (event) => {
    const isVisible = this.element.classList.contains('rangepicker_open');
    const isInput = this.element.contains(event.target);

    if (isVisible && !isInput) {
      this.element.classList.remove('rangepicker_open');
    }

  };

  onInputClick = () => {
    this.element.classList.toggle('rangepicker_open');
    this.subElements.selector.innerHTML = this.selectorTemplate;
    this.highlightSelectedDates();
  };

  onArrowClick = (event) => {
    const isArrow = event.target.classList.contains('rangepicker__selector-control');
    const arrow = event.target;

    if (isArrow) {

      switch (true) {
        case arrow.classList.contains('rangepicker__selector-control-right'):
          this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
          break;
        case arrow.classList.contains('rangepicker__selector-control-left'):
          this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
          break;
      }
      this.subElements.selector.innerHTML = this.selectorTemplate;
      this.highlightSelectedDates();
    }
  };

  onDateClick = (event) => {
    const isDate = event.target.classList.contains('rangepicker__cell');
    const selectedDate = new Date(event.target.dataset.value);

    if (isDate) {
      this.defineSelectedDates(selectedDate);
    }
  };

  defineSelectedDates(date) {
    if (this.selectingFrom) {

      this.selected.from = date;
      this.selected.to = null;
      this.highlightSelectedDates();

      this.selectingFrom = false;

    } else {

      if (date > this.selected.from) {
        this.selected.to = date;
        this.highlightSelectedDates();
      } else {
        this.selected.to = this.selected.from;
        this.selected.from = date;
      }

      this.subElements.input.innerHTML = this.inputTemplate;
      this.selectingFrom = true;
      this.dispatchEvent();
      this.close();
    }
  }

  highlightSelectedDates() {
    const cells = this.element.querySelectorAll('.rangepicker__cell');
    this.clearDatesHighlighting(cells);
    this.addDatesHighlighting(cells);
  }

  addDatesHighlighting(cells) {
    const fromDate = this.selected.from;
    const toDate = this.selected.to;

    cells.forEach(item => {
      const itemDate = new Date(item.dataset.value);

      if (fromDate && itemDate.toDateString()=== fromDate.toDateString()) {
        item.classList.add('rangepicker__selected-from');
      } else if (toDate && itemDate.toDateString() === toDate.toDateString()) {
        item.classList.add('rangepicker__selected-to');
      } else if (itemDate > fromDate && toDate && itemDate < toDate) {
        item.classList.add('rangepicker__selected-between');
      }
    });
  }

  clearDatesHighlighting(cells) {
    cells.forEach(item => {
      item.classList.remove('rangepicker__selected-between');
      item.classList.remove('rangepicker__selected-from');
      item.classList.remove('rangepicker__selected-to');
    });
  }

  dispatchEvent(){
    const event = new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected
    });

    this.element.dispatchEvent(event);
  }

  close() {
    this.element.classList.remove('rangepicker_open');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    const { input, selector } = this.subElements;
    this.remove();
    document.removeEventListener('click', this.onOuterClick, true);
    input.removeEventListener('click', this.onInputClick);
    selector.removeEventListener('click', this.onArrowClick);
    selector.removeEventListener('click', this.onDateClick);
  }
}
