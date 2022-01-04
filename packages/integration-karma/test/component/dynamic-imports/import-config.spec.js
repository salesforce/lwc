import { createElement } from 'lwc';

import PropContainer from 'x/props';

const macroTask = () => new Promise(setTimeout);

it('should pass props passed as config', async () => {
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

it("should render the same custom element when constructor doesn't change", async () => {
    const elm = createElement('x-dynamic', { is: PropContainer });
    document.body.appendChild(elm);

    await Promise.resolve();

    const child = elm.shadowRoot.querySelector('x-ctor');
    expect(child).toBeNull();
    // first rendered with ctor set to undefined (nothing)

    elm.enableOne();
    await macroTask();
    const oneElm = elm.shadowRoot.querySelector('x-ctor');
    elm.enableOneAlternateProps();
    await macroTask();

    // second rendered with ctor set to x-configone
    const oneElmAlternate = elm.shadowRoot.querySelector('x-ctor');
    expect(oneElmAlternate).not.toBeNull();
    const prop1 = oneElmAlternate.shadowRoot.querySelector('span');
    expect(prop1).not.toBeNull();
    expect(prop1.textContent).toBe('prop1 alternate value');
    expect(oneElm).toBe(oneElmAlternate);
});
