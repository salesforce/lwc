import { createElement } from 'lwc';
import Container from 'c/container';
import { fn as mockFn } from '@vitest/spy';
import { extractDataIds } from '../../../helpers/utils.js';

function createShadowTree(parentNode) {
    const elm = createElement('c-container', { is: Container });
    elm.setAttribute('data-id', 'c-container');
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
            nodes['c-container'].shadowRoot,
            nodes['c-container'],
            document.body,
            document.documentElement,
            document,
            window,
        ];

        const listener = mockFn();
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

        const listener = { handleEvent: mockFn() };
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
