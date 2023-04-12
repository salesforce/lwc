import { createElement } from 'lwc';
import Test from 'x/test';

it('should support handleEvent', () => {
    const elm = createElement('x-test', { is: Test });

    let invoked = false;
    elm.addEventListener('foo', {
        handleEvent() {
            invoked = true;
        },
    });
    elm.dispatchEvent(new CustomEvent('foo'));

    expect(invoked).toBe(true);
});
