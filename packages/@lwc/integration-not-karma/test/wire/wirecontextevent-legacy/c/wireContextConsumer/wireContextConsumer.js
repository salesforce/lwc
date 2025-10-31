import { LightningElement, wire } from 'lwc';
import { wireContextAdapter } from 'c/wireContextAdapter';

export default class WireContextConsumer extends LightningElement {
    @wire(wireContextAdapter) contextValue;
}
