import { createElement } from 'lwc';
import { registerForLoad, clearRegister } from 'test-utils';
import ConfigOne from 'x/configone';
import ConfigTwo from 'x/configtwo';

import PropContainer from 'x/props';

beforeEach(() => {
    clearRegister();
});

const macroTask = () => new Promise((resolve) => setTimeout(resolve));

it('should pass props passed as config', async () => {
    // note, using `x-` prefix instead of `x/` because these are
    // handled by `registerForLoad`
    registerForLoad('x-configone', ConfigOne);
    registerForLoad('x-configtwo', ConfigTwo);

    const elm = createElement('x-dynamic', { is: PropContainer });
    document.body.appendChild(elm);

    await Promise.resolve();

    const child = elm.shadowRoot.querySelector('x-ctor');
    expect(child).toBeNull();
    // first rendered with ctor set to undefined (nothing)

    elm.enableOne();
    await macroTask();

    // second rendered with ctor set to x-configone
    const oneElm = elm.shadowRoot.querySelector('x-ctor');
    expect(oneElm).not.toBeNull();
    const prop1 = oneElm.shadowRoot.querySelector('span');
    expect(prop1).not.toBeNull();
    expect(prop1.textContent).toBe('prop1 value');

    elm.enableTwo();
    await macroTask();

    // third rendered with ctor set to x-configtwo
    const twoElm = elm.shadowRoot.querySelector('x-ctor');
    expect(twoElm).not.toBeNull();
    const span = twoElm.shadowRoot.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.textContent).toBe('prop2 value');
});
