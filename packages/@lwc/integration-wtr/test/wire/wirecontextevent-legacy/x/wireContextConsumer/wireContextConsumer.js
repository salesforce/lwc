import { LightningElement, wire } from 'lwc';
import { wireContextAdapter } from 'x/wireContextAdapter';

export default class WireContextConsumer extends LightningElement {
    @wire(wireContextAdapter) contextValue;
}
