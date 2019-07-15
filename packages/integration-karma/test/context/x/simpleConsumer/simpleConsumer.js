import { LightningElement, wire } from 'lwc';
import { Provider } from 'x/simpleProvider';

export default class ConsumerElement extends LightningElement {
    @wire(Provider) context;
}
