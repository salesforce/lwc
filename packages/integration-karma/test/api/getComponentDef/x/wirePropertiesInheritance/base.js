import { LightningElement, wire } from 'lwc';
import wireAdapter from 'x/wireAdapter';

export default class Base extends LightningElement {
    @wire(wireAdapter, { parent: true }) parentProp;
    @wire(wireAdapter, { parent: true }) overriddenInChild;
}
