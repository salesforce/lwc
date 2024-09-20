import { LightningElement } from 'lwc';
import template from './template.html';

export default class Basic extends LightningElement {
  static renderMode = 'light';

  render() {
    return template;
  }
}
