import { LightningElement, wire } from 'lwc';
import { WireAdapterA, WireAdapterB } from '../../../wire-adapter';

export default class Component extends LightningElement {
  @wire(WireAdapterA) top;
  @wire(WireAdapterB) nested;
}
