import { LightningElement, api, wire } from 'lwc';
import { getValue } from './adapter';

export default class AdapterChild extends LightningElement {
  static renderMode = 'light';

  @api
  uuid = Math.floor(Math.random() * 1_000_000_000);

  @wire(getValue, { uuid: '$uuid' })
  value;

  connectedCallback() {
    console.log(`connecting component ${this.uuid}`);
  }

  disconnectedCallback() {
    console.log(`disconnecting component ${this.uuid}`);
  }
}
