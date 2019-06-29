import { LightningElement, api } from 'lwc';

export default class SpecialCharacterPublicProp extends LightningElement {
    @api public_prop = 'underscore property';
}
