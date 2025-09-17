import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    static renderMode = 'light';

    @api content;
}
