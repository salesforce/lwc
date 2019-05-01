import { createElement } from 'lwc';
import XTest from 'x/test';
import XSlotted from 'x/slotted';
import NestedRenderConditional from 'x/nestedRenderConditional';

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

    it('should remove element within a nested conditional', () => {
        const elm = createElement('x-nested-render-conditional', { is: NestedRenderConditional });
        document.body.appendChild(elm);

        const elementToggler = elm.shadowRoot.querySelector('.click-me');

        elementToggler.click();

        return Promise.resolve().then(() => {
            const elementInsideNestedCondition = elm.shadowRoot.querySelector('.toggle');

            expect(elementInsideNestedCondition).toBeNull();
        });
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
    if (process.env.NATIVE_SHADOW) {
        // In native shadow, the slotted content from parent is always queriable, its only the
        // child's <slot> that is rendered/unrendered based on the directive
        it('should update child with slot content if value changes', () => {
            const elm = createElement('x-test', { is: XSlotted });
            document.body.appendChild(elm);
            const assignedSlotContent = elm.shadowRoot.querySelector('div.content');
            const child = elm.shadowRoot.querySelector('x-child');
            expect(child).not.toBeNull();
            expect(child.shadowRoot.querySelector('slot')).toBeNull();

            // The warning message is not of concern here. That is covered by a test in decorators/api/index.spec.js
            // Testing the start of the error message to not miss errors thrown for other reasons
            expect(() => {
                child.show = true;
            }).toLogErrorDev(/\[LWC error\]: If property show decorated with @api.*/);
            return Promise.resolve()
                .then(() => {
                    const slot = child.shadowRoot.querySelector('slot');
                    expect(slot).not.toBeNull();
                    const assignedNodes = slot.assignedNodes({ flatten: true });
                    expect(assignedNodes.length).toBe(1);
                    expect(assignedNodes[0]).toBe(assignedSlotContent);
                    expect(() => {
                        child.show = false;
                    }).toLogErrorDev(/\[LWC error\]: If property show decorated with @api.*/);
                })
                .then(() => {
                    expect(child.shadowRoot.querySelector('slot')).toBeNull();
                    expect(() => {
                        child.show = true;
                    }).toLogErrorDev(/\[LWC error\]: If property show decorated with @api.*/);
                })
                .then(() => {
                    const slot = child.shadowRoot.querySelector('slot');
                    expect(slot).not.toBeNull();
                    const assignedNodes = slot.assignedNodes({ flatten: true });
                    expect(assignedNodes.length).toBe(1);
                    expect(assignedNodes[0]).toBe(assignedSlotContent);
                });
        });
    } else {
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
            }).toLogErrorDev(/\[LWC error\]: If property show decorated with @api.*/);
            return Promise.resolve()
                .then(() => {
                    expect(child.querySelector('.content')).not.toBeNull();
                    expect(() => {
                        child.show = false;
                    }).toLogErrorDev(/\[LWC error\]: If property show decorated with @api.*/);
                })
                .then(() => {
                    expect(child.querySelector('.content')).toBeNull();
                    expect(() => {
                        child.show = true;
                    }).toLogErrorDev(/\[LWC error\]: If property show decorated with @api.*/);
                })
                .then(() => {
                    expect(child.querySelector('.content')).not.toBeNull();
                });
        });
    }
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
