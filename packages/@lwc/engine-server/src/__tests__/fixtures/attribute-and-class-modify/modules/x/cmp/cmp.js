import { LightningElement } from 'lwc';

export default class extends LightningElement {
  connectedCallback() {
    // Modify this component's class and attributes at runtime
    // We expect a data-lwc-host-mutated attr to be added with the mutated attribute names in unique sorted order
    this.setAttribute('data-foo', 'bar')
    this.classList.add('yolo')
    this.classList.add('woot')
    this.setAttribute('aria-label', 'haha')
  }
}
