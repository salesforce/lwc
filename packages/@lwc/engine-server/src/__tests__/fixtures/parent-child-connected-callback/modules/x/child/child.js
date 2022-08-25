import { LightningElement } from "lwc";

export default class extends LightningElement {
  result

  connectedCallback() {
    this.result = 'connectedCallback called'
  }
}
