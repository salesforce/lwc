import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
  @api lowerlimit;
  @api upperlimit;
  value = null;

  handleChange(newValue) {
    newValue = Number.parseInt(newValue, 10);
    this.value = newValue;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: newValue,
      })
    );
  }
}
