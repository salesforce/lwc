import { LightningElement } from 'lwc';

export default class extends LightningElement {
  connectedCallback() {
    // Modify this component's aria properties at runtime, which should be reflected to attributes

    // Standard ARIA property
    this.ariaBusy = 'true'

    // Non-standard LWC-specific legacy ARIA property
    this.ariaActiveDescendant = 'foo'
  }
}
