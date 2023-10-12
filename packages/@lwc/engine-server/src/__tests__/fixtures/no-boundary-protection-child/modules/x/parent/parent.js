import { LightningElement } from 'lwc';

export default class NoBoundaryProtectionParent extends LightningElement {
  errorCallback() {
    // try to swallow error (and hopefully fail)
  }
}
