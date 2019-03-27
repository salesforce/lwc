import { createElement } from 'test-utils';
import XTest from 'x/test';
import XSlotted from 'x/slotted';

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
    it('should update child with slot content if value changes', () => {
        const elm = createElement('x-test', { is: XSlotted });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child');
        expect(child).not.toBeNull();
        expect(child.querySelector('.content')).toBeNull();

        // The warning message is not of concern here. That is covered by a test in decorators/api/index.spec.js
        // Testing the start of the error message to not miss errors thrown for other reasons
        expect(() => {
            child.show = true;
        }).toLogWarningDev(/\[LWC warning\]: If property show decorated with @api.*/);
        return Promise.resolve()
            .then(() => {
                expect(child.querySelector('.content')).not.toBeNull();
                expect(() => {
                    child.show = false;
                }).toLogWarningDev(/\[LWC warning\]: If property show decorated with @api.*/);
            })
            .then(() => {
                expect(child.querySelector('.content')).toBeNull();
                expect(() => {
                    child.show = true;
                }).toLogWarningDev(/\[LWC warning\]: If property show decorated with @api.*/);
            })
            .then(() => {
                expect(child.querySelector('.content')).not.toBeNull();
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
