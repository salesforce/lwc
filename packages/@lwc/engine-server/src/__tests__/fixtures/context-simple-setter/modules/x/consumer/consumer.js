import { LightningElement, wire } from 'lwc';
import { WireAdapter } from '../../../wire-adapter';

export default class ConsumerComponent extends LightningElement {
  _foo;

  @wire(WireAdapter, { unused: '$definitelyUnused' })
  set foo(newFoo) {
    this._foo = newFoo;
  }
  get foo() {
    return this._foo
  };
}
