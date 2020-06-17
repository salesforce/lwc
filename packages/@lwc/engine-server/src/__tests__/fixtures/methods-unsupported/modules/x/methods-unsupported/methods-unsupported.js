import { LightningElement } from 'lwc';

export default class MethodsUnsupported extends LightningElement {
    connectedCallback() {
        expect(() => this.dispatchEvent(new CustomEvent('foo'))).toThrowError('"dispatchEvent" is not supported in this environment')
        expect(() => this.getBoundingClientRect()).toThrowError('"getBoundingClientRect" is not supported in this environment')
        expect(() => this.querySelector('.foo')).toThrowError('"querySelector" is not supported in this environment')
        expect(() => this.querySelectorAll('.foo')).toThrowError('"querySelectorAll" is not supported in this environment')
        expect(() => this.getElementsByTagName('x-foo')).toThrowError('"getElementsByTagName" is not supported in this environment')
        expect(() => this.getElementsByClassName('foo')).toThrowError('"getElementsByClassName" is not supported in this environment')
    }
}