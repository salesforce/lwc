import { LightningElement } from 'lwc';

export default class NoBoundaryProtectionParent extends LightningElement {
  connectedCallback() {
    throw new Error('Can\'t catch me, I\'m the gingerbread man');
  }

  errorCallback() {
    // try to swallow error (and hopefully fail)
  }
}
