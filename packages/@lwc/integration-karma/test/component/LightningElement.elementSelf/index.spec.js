import { createElement } from 'lwc';

import Wrapper from 'x/wrapper';

function createWrapper() {
    const elm = createElement('x-wrapper', { is: Wrapper });
    document.body.appendChild(elm);
    return elm;
}

it('should provide the root element for light rendering', () => {
    const elm = createWrapper();

    const divElement = elm.getDivElement();
    const lightElement = elm.getLightElement();
    const elementSelf = lightElement.getHostElement();

    expect(elementSelf).toBeTruthy();
    expect(elementSelf.tagName).toEqual('X-LIGHT');
    expect(elementSelf.dataset.name).toEqual('lightElement');

    expect(elementSelf).toEqual(lightElement);
    expect(elementSelf.parentElement).toEqual(divElement);
});

it('should provide the root element for shadow rendering', () => {
    const elm = createWrapper();

    const divElement = elm.getDivElement();
    const shadowElement = elm.getShadowElement();
    const elementSelf = shadowElement.getHostElement();

    expect(elementSelf).toBeTruthy();
    expect(elementSelf.tagName).toEqual('X-SHADOW');
    expect(elementSelf.dataset.name).toEqual('shadowElement');

    expect(elementSelf).toEqual(shadowElement);
    expect(elementSelf.parentElement).toEqual(divElement);
});
