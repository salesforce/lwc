import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api list;
    other = new Set(['zip', 'zap', 'zop'])
}