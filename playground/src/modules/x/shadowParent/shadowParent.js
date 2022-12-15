import { LightningElement } from 'lwc';
import xShadowChild from 'x/shadowChild';
import xLightChild from 'x/lightChild';

export default class extends LightningElement {
  ctors = [xShadowChild, xLightChild];
  lazyConstructor;

  clickHandler() {
    this.lazyConstructor = this.ctors.shift();
    this.ctors.push(this.lazyConstructor);
  }
}