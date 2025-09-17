import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api loggers = [];

    @api mainLogger;
}
