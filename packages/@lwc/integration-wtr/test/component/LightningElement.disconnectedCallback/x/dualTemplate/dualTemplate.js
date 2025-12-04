import { LightningElement, api, track } from 'lwc';
import templateWithChild from './templateA.html';
import templateWithoutChild from './templateB.html';

export default class ParentWithDualTemplate extends LightningElement {
    @track
    _hideChild = false;

    get hideChild() {
        return this._hideChild;
    }
    @api
    set hideChild(value) {
        this._hideChild = value;
    }

    render() {
        return this._hideChild ? templateWithoutChild : templateWithChild;
    }
}
