import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api dynamicStyle = 'background-color: red; border-color: red; margin: 1px;';
}
