import { LightningElement, wire } from 'lwc';
import wireAdapter from 'x/wireAdapter';

export default class WireMethods extends LightningElement {
    @wire(wireAdapter) foo() {}
    @wire(wireAdapter, { a: true }) bar() {}
    @wire(wireAdapter, { b: true, c: '$foo' }) baz() {}
}
