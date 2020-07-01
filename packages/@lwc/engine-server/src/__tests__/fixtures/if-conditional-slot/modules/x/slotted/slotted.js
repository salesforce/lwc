import { LightningElement, api } from 'lwc';

export default class ConditionallySlotted extends LightningElement {
    @api
    activatefalsepath;

    @api
    activatetruepath;
}