import { LightningElement, api } from 'lwc';
export default class Parent extends LightningElement {
    @api childName = 'from-parent';
}
