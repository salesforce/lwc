import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

function createShadowTree(parentNode) {
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    parentNode.appendChild(elm);
    return extractDataIds(elm);
}

describe('Eventnodes.button.removeEventListener', () => {
    let nodes;
    beforeEach(() => {
        nodes = createShadowTree(document.body);
    });

    it('should accept a function listener as second parameter for all nodes', () => {
        const targets = [
            nodes.button,
            nodes['container_div'],
            nodes['x-container'].shadowRoot,
            nodes['x-container'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        const listener = jasmine.createSpy();
        targets.forEach((node) => {
            node.addEventListener('click', listener);
        });
        targets.forEach((node) => {
            node.removeEventListener('click', listener);
        });

        nodes.button.click();

        expect(listener).not.toHaveBeenCalled();
    });

    it('should accept a listener config as second parameter for all nodes except shadow root and host', () => {
        const targets = [
            nodes.button,
            nodes['container_div'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        const listener = { handleEvent: jasmine.createSpy() };
        targets.forEach((node) => {
            node.addEventListener('click', listener);
        });
        targets.forEach((node) => {
            node.removeEventListener('click', listener);
        });

        nodes.button.click();

        expect(listener.handleEvent).not.toHaveBeenCalled();
    });

    it('should not throw error when listener is not added', () => {
        expect(() => nodes.button.removeEventListener('dummy', () => {})).not.toThrowError(
            TypeError
        );
    });

    it('should throw error when second parameter is not passed', () => {
        expect(() => nodes.button.removeEventListener('dummy')).toThrowError(TypeError);
    });

    it('should throw error when no parameters are passed', () => {
        expect(() => nodes.button.removeEventListener()).toThrowError(TypeError);
    });

    [123, 'string', true, BigInt('123'), Symbol('dummy')].forEach((primitive) => {
        it(`should throw error when ${typeof primitive} is passed as second parameter`, () => {
            expect(() => nodes.button.removeEventListener('dummy', primitive)).toThrowError(
                TypeError
            );
        });
    });
});
