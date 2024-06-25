import { createElement } from 'lwc';
import { ENABLE_THIS_DOT_HOST_ELEMENT } from 'test-utils';

import Wrapper from 'x/wrapper';

function createWrapper() {
    const elm = createElement('x-wrapper', { is: Wrapper });
    document.body.appendChild(elm);
    return elm;
}

if (ENABLE_THIS_DOT_HOST_ELEMENT) {
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
} else {
    // this.hostElement unsupported
    it('this.hostElement unsupported in older API versions', () => {
        const elm = createWrapper();

        const shadowElement = elm.getShadowElement();

        let hostElement;

        const callback = () => {
            hostElement = shadowElement.getHostElement();
        };

        if (process.env.FORCE_LWC_V6_ENGINE_FOR_TEST) {
            // TODO [#4313]: remove temporary logic to support v7 compiler + v6 engine
            callback(); // no warning
        } else {
            expect(callback).toLogWarningDev(/Increase the API version to use it/);
        }

        expect(hostElement).toBeUndefined();
    });
}
