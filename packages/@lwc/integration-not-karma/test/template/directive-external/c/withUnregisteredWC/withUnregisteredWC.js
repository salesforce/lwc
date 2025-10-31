import { api, LightningElement } from 'lwc';

export default class WithUnregisteredWC extends LightningElement {
    @api data = 'default';
}
