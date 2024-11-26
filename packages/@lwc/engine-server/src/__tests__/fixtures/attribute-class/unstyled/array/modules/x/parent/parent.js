import { LightningElement } from 'lwc';

export default class extends LightningElement {
    get computedClassNames() {
      return [{
        button__icon: true
      }]
    }
  }