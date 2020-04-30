import { LightningElement } from 'lwc';
import tmpl from './lifecycle-hooks.html';

export default class LifecycleHooks extends LightningElement {
    hooks = [];

    constructor() {
        super();
        this.hooks.push('constructor');
    }

    connectedCallback() {
        this.hooks.push('connectedCallback');
    }

    render() {
        this.hooks.push('render');
        return tmpl;
    }

    renderedCallback() {
        this.hooks.push('renderedCallback');
    }
}