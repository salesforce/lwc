import { LightningElement, api } from 'lwc';

export default class TextInterpolation extends LightningElement {
    @api publicProp = 'default-public-prop';
    privateProp = 'private-prop';
}