import { LightningElement, api } from 'lwc';

export default class UppercaseCharacterPublicPropChild extends LightningElement {
    @api Upper = 'default value';
}
