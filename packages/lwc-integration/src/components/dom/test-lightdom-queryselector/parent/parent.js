import { Element, api } from 'engine';

export default class Parent extends Element {
    @api
    selectAllDivs() {
        return this.querySelectorAll('div');
    }
}
