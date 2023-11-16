import { LightningElement } from 'lwc';

export default class NoBoundaryProtectionChild extends LightningElement {
  connectedCallback() {
    throw new Error('Can\'t catch me, I\'m the gingerbread man');
  }

  errorCallback() {
    console.log('caught in child');
    // try to swallow error (and hopefully fail)
  }
}
