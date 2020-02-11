import { createElement, LightningElement } from 'lwc';
describe('Basic DOM manipulation cases', () => {
    let context;
    let elm;
    class Test extends LightningElement {
        constructor() {
            super();
            context = this;
        }
    }
    beforeEach(() => {
        elm = createElement('x-test', { is: Test });
    });
    afterEach(() => {
        context = undefined;
        elm = undefined;
    });

    it('should return false for uninitilized host', () => {
        expect(context.isConnected).toBe(false);
    });
    it('should return true for connected host', () => {
        document.body.appendChild(elm);
        expect(context.isConnected).toBe(true);
    });
    it('should return false for disconnected host', () => {
        document.body.appendChild(elm);
        document.body.removeChild(elm);
        expect(context.isConnected).toBe(false);
    });
    it('should return true for reconnected host', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        document.body.appendChild(elm);
        container.appendChild(elm);
        expect(context.isConnected).toBe(true);
    });
    it('should return false for host connected to detached fargment', () => {
        const frag = document.createDocumentFragment();
        frag.appendChild(elm);
        expect(context.isConnected).toBe(false);
    });
});

describe('isConnected in life cycle callbacks', () => {
    it('accessing isConnected in constructor will throw', () => {
        class Test extends LightningElement {
            constructor() {
                super();
                this.isConnected;
            }
        }
        expect(() => {
            createElement('x-test', { is: Test });
        }).toThrowErrorDev(
            Error,
            /Assert Violation: this\.isConnected should not be accessed during the construction phase of the custom element <x-test>\. The value will always be false for Lightning Web Components constructed using lwc.createElement\(\)\./
        );
    });
    it('accessing isConnected in renderedCallback will throw', () => {
        class Test extends LightningElement {
            renderedCallback() {
                this.isConnected;
            }
        }
        const elm = createElement('x-test', { is: Test });
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowErrorDev(
            Error,
            /Assert Violation: this\.isConnected should not be accessed during the renderedCallback of the custom element <x-test>\. The value will always be true\./
        );
    });
    it('isConnected in connectedCallback should return true', () => {
        let actual;
        class Test extends LightningElement {
            connectedCallback() {
                actual = this.isConnected;
            }
        }
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        expect(actual).toBe(true);
    });
    it('isConnected in disconnectedCallback should return false', () => {
        let actual;
        class Test extends LightningElement {
            disconnectedCallback() {
                actual = this.isConnected;
            }
        }
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        document.body.removeChild(elm);
        expect(actual).toBe(false);
    });
});
