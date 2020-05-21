import { createElement } from 'lwc';

import Test from 'x/test';

it('computes reactivity graph per render cycle', () => {
    const elm = createElement('x-test', { is: Test });
    elm.dynamicValue = 1;
    elm.renderDynamic = false;
    document.body.appendChild(elm);

    expect(elm.getRenderCount()).toBe(1);

    // Updating dynamic value if it is not part of the template should not trigger a rerender.
    elm.dynamicValue = 2;
    return Promise.resolve()
        .then(() => {
            expect(elm.getRenderCount()).toBe(1);

            // Toggling the visibility should trigger a rerender.
            elm.dynamicValue = 3;
            elm.renderDynamic = true;
        })
        .then(() => {
            expect(elm.getRenderCount()).toBe(2);

            // The dynamic value is rendered so updating it trigger a rerender.
            elm.dynamicValue = 4;
        })
        .then(() => {
            expect(elm.getRenderCount()).toBe(3);

            // Toggling the visibility should trigger a rerender.
            elm.dynamicValue = 5;
            elm.renderDynamic = false;
        })
        .then(() => {
            expect(elm.getRenderCount()).toBe(4);

            // Now that the dynamic value is not rendered any more updating the value should not
            // trigger a render cycle.
            elm.dynamicValue = 6;
        })
        .then(() => {
            expect(elm.getRenderCount()).toBe(4);
        });
});
