import { LightningElement, api } from 'lwc';
import './component.js';

export default class Parent extends LightningElement {
    composedPath;

    @api
    get child() {
        return this.refs.child;
    }

    @api
    getShadowedComposedPath() {
        return this.child.composedPath;
    }

    @api
    getComposedPath() {
        return this.composedPath;
    }

    @api
    clickShadowedButton() {
        this.child.click();
    }

    handleClick(event) {
        this.composedPath = event.composedPath();
    }
}
