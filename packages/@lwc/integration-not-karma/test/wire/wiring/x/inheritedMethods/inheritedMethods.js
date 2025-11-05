import { LightningElement, wire } from 'lwc';
import { EchoWireAdapter } from 'x/echoAdapter';

class Base extends LightningElement {
    @wire(EchoWireAdapter, { name: 'parentMethod', parent: true }) parentMethod() {}
    @wire(EchoWireAdapter, { name: 'overriddenInChild', parent: true }) overriddenInChild() {}
}

export default class InheritedMethods extends Base {
    @wire(EchoWireAdapter, { name: 'childMethod', child: true }) childMethod() {}
    @wire(EchoWireAdapter, { name: 'overriddenInChild', child: true }) overriddenInChild() {}
}
