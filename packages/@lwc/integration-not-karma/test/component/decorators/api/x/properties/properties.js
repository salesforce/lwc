import { LightningElement, api } from 'lwc';

export default class Properties extends LightningElement {
    @api publicProp = 'public';
    privateProp = 'private';
}
