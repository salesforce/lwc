import { createElement } from 'lwc';
import Wrapper from 'x/wrapper';
import { ENABLE_THIS_DOT_HOST_ELEMENT } from '../../../helpers/utils.js';

function createWrapper() {
    const elm = createElement('x-wrapper', { is: Wrapper });
    document.body.appendChild(elm);
    return elm;
}

it.runIf(ENABLE_THIS_DOT_HOST_ELEMENT)(
    'should provide the root element for light rendering',
    () => {
        const elm = createWrapper();

        const divElement = elm.getDivElement();
        const lightElement = elm.getLightElement();
        const hostElement = lightElement.getHostElement();

        expect(hostElement).toBeTruthy();
        expect(hostElement.tagName).toEqual('X-LIGHT');
        expect(hostElement.dataset.name).toEqual('lightElement');

        expect(hostElement).toEqual(lightElement);
        expect(hostElement.parentElement).toEqual(divElement);
    }
);

it.runIf(ENABLE_THIS_DOT_HOST_ELEMENT)(
    'should provide the root element for shadow rendering',
    () => {
        const elm = createWrapper();

        const divElement = elm.getDivElement();
        const shadowElement = elm.getShadowElement();
        const hostElement = shadowElement.getHostElement();

        expect(hostElement).toBeTruthy();
        expect(hostElement.tagName).toEqual('X-SHADOW');
        expect(hostElement.dataset.name).toEqual('shadowElement');

        expect(hostElement).toEqual(shadowElement);
        expect(hostElement.parentElement).toEqual(divElement);
    }
);

// this.hostElement unsupported
it.skipIf(ENABLE_THIS_DOT_HOST_ELEMENT)(
    'this.hostElement unsupported in older API versions',
    () => {
        const elm = createWrapper();

        const shadowElement = elm.getShadowElement();

        let hostElement;

        expect(() => {
            hostElement = shadowElement.getHostElement();
        }).toLogWarningDev(/Increase the API version to use it/);

        expect(hostElement).toBeUndefined();
    }
);
