import { LightningElement, readonly } from 'lwc';

export default class extends LightningElement {
    foo = { willSays: 'mobs 4eva' };
    readonlyFoo = readonly(this.foo);
    // Proxy is the same when stringified but it's a different object
    areSameStringified = JSON.stringify(this.foo) === JSON.stringify(this.readonlyFoo);
    areSame = this.foo == this.readonlyFoo;
}
