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
    it('should return false in the constructor', () => {
        let actual;
        class Test extends LightningElement {
            constructor() {
                super();
                actual = this.isConnected;
            }
        }
        createElement('x-test', { is: Test });
        expect(actual).toBe(false);
    });
    it('should return true in the connectedCallback', () => {
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
    it('should return true in renderedCallback after the initial insertion', () => {
        let actual;

        class Test extends LightningElement {
            renderedCallback() {
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
