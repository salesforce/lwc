import { LightningElement, api } from 'lwc';

export default class ConditionalSlotContent extends LightningElement {
    @api
    activatefalsepath;

    @api
    activatetruepath;
}
