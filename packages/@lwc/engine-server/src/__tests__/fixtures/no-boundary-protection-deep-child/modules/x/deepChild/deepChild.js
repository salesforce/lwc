import { LightningElement } from 'lwc';

export default class NoBoundaryProtectionDeepChild extends LightningElement {
  connectedCallback() {
    throw new Error('Can\'t catch me, I\'m the gingerbread man');
  }

  errorCallback() {
    console.log('caught in deep child');
    // try to swallow error (and hopefully fail)
  }
}
