import { LightningElement, track, createElement, api } from 'lwc';
import Dummy from './../dummy/dummy';

export default class SyncNodeRemoval extends LightningElement {
    @track errorMessage;
    @track customElementError;
    handleClick() {
        const timeout = window.setTimeout(() => {
            this.errorMessage = 'No error';
        }, 0);
        window.onerror = (errorMessage) => {
            window.clearTimeout(timeout);
            this.errorMessage = errorMessage;
        }

        const elm = this.template.querySelector('.dom');
        const div = document.createElement('div');
        const b = document.createElement('span');
        div.appendChild(b);
        b.textContent = 'asd';
        elm.appendChild(div);
        b.textContent = 'hello'
    }

    handleManualLightningElementClick() {
        const timeout = window.setTimeout(() => {
            this.customElementError = 'No error';
        }, 0);
        window.onerror = (errorMessage) => {
            window.clearTimeout(timeout);
            this.customElementError = errorMessage;
        }

        const elm = this.template.querySelector('.custom-element-dom');
        const div = document.createElement('div');
        const custom = createElement('x-foo', { is: Dummy });
        div.appendChild(custom);
        elm.appendChild(div);
        custom.changeText();
    }
}
