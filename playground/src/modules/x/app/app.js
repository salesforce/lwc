import { LightningElement, api } from 'lwc';
import Signal from 'x/signal';

export default class App extends LightningElement {
    @api signal = new Signal('initial value');
}