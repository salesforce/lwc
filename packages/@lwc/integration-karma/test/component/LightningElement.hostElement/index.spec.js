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
    const hostElement = lightElement.getHostElement();

    expect(hostElement).toBeTruthy();
    expect(hostElement.tagName).toEqual('X-LIGHT');
    expect(hostElement.dataset.name).toEqual('lightElement');

    expect(hostElement).toEqual(lightElement);
    expect(hostElement.parentElement).toEqual(divElement);
});

it('should provide the root element for shadow rendering', () => {
    const elm = createWrapper();

    const divElement = elm.getDivElement();
    const shadowElement = elm.getShadowElement();
    const hostElement = shadowElement.getHostElement();

    expect(hostElement).toBeTruthy();
    expect(hostElement.tagName).toEqual('X-SHADOW');
    expect(hostElement.dataset.name).toEqual('shadowElement');

    expect(hostElement).toEqual(shadowElement);
    expect(hostElement.parentElement).toEqual(divElement);
});
