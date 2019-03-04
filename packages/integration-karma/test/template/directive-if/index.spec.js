import { createElement } from 'test-utils';
import XTest from 'x/test';

describe('if:true directive', () => {
    it('should render if the value is truthy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
    });

    it('should not render if the value is falsy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.isVisible = false;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.true')).toBeNull();
    });

    it('should update if the value change', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();

        elm.isVisible = false;
        return Promise.resolve()
            .then(() => {
                expect(elm.shadowRoot.querySelector('.true')).toBeNull();
                elm.isVisible = {};
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
                elm.isVisible = 0;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.true')).toBeNull();
                elm.isVisible = 1;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
                elm.isVisible = null;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.true')).toBeNull();
                elm.isVisible = [];
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.true')).not.toBeNull();
            });
    });
});

describe('if:false directive', () => {
    it('should not render if the value is truthy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.false')).toBeNull();
    });

    it('should render if the value is falsy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.isVisible = false;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
    });

    it('should update if the value change', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.isVisible = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.false')).toBeNull();

        elm.isVisible = false;
        return Promise.resolve()
            .then(() => {
                expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
                elm.isVisible = {};
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.false')).toBeNull();
                elm.isVisible = 0;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
                elm.isVisible = 1;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.false')).toBeNull();
                elm.isVisible = null;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.false')).not.toBeNull();
                elm.isVisible = [];
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.false')).toBeNull();
            });
    });
});
