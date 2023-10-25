import { LightningElement, wire } from 'lwc';
import { isMobile } from './mqAdapter';

export default class AdapterApp extends LightningElement {
  static renderMode = 'light';

  uuid = Math.floor(Math.random() * 1_000_000_000);

  @wire(isMobile, { uuid: '$uuid' })
  isMobile;
}
