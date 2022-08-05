import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api
    customElementId = 'kamigamo';

    @api
    nativeElementId = 'shimogamo';
}
