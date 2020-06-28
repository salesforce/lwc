import { LightningElement, api } from 'lwc';

export default class ConditionalSlot extends LightningElement {
    @api
    activatefalsepath;

    @api
    activatetruepath;
}
