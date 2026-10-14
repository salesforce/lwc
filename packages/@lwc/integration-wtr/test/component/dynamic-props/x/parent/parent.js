import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api showShapeShifter = false;
    @api showPlainChild = false;
    @api arbitraryValue = 'anything';
}
