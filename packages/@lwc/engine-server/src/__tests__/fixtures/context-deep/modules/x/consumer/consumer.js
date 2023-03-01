import { LightningElement, wire } from 'lwc';
import { WireAdapter } from '../../../wire-adapter';

export default class Component extends LightningElement {
  @wire(WireAdapter) foo;
}
