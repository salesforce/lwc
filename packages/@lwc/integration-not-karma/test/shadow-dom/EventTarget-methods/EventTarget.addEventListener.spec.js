import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

function createShadowTree(parentNode) {
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    parentNode.appendChild(elm);
    return extractDataIds(elm);
}

describe('EventTarget.addEventListener', () => {
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

        const log = [];
        targets.forEach((node) => {
            node.addEventListener('click', () => log.push(node));
        });

        nodes.button.click();

        expect(log).toEqual(targets);
    });

    it('should accept a listener config as second parameter for all nodes except shadow root and host', () => {
        const targets = [
            nodes.button,
            nodes['container_div'],
            /*
            TODO [#2134]: These are valid cases but currently fail.
            nodes['x-container'].shadowRoot,
            nodes['x-container'],
            */
            document.body,
            document.documentElement,
            document,
            window,
        ];

        const log = [];
        targets.forEach((node) => {
            node.addEventListener('click', { handleEvent: () => log.push(node) });
        });

        nodes.button.click();

        expect(log).toEqual(targets);
    });

    it('should accept a function listener as second parameter for a non-node EventTarget', () => {
        const target = new EventTarget();
        const listener = jasmine.createSpy();
        target.addEventListener('dummy', listener);
        target.dispatchEvent(new CustomEvent('dummy'));
        expect(listener).toHaveBeenCalled();
    });

    it('should accept a listener config as second parameter for a non-node EventTarget', () => {
        const target = new EventTarget();
        const listener = jasmine.createSpy();
        target.addEventListener('dummy', { handleEvent: listener });
        target.dispatchEvent(new CustomEvent('dummy'));
        expect(listener).toHaveBeenCalled();
    });

    it('should call event listener with the same order', () => {
        const logs = [];
        for (let i = 1; i <= 10; i++) {
            nodes.button.addEventListener('foo', () => logs.push(i));
        }
        nodes.button.dispatchEvent(new CustomEvent('foo'));
        expect(logs).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should accept null as second parameter', () => {
        expect(() => nodes.button.addEventListener('dummy', null)).not.toThrowError(TypeError);
    });

    it('should accept undefined as second parameter', () => {
        expect(() => nodes.button.addEventListener('dummy', undefined)).not.toThrowError(TypeError);
    });

    it('should accept null as third parameter', () => {
        expect(() => nodes.button.addEventListener('dummy', null, null)).not.toThrowError(
            TypeError
        );
    });

    it('should accept undefined as third parameter', () => {
        expect(() => nodes.button.addEventListener('dummy', undefined, undefined)).not.toThrowError(
            TypeError
        );
    });

    it('should throw error when second parameter is not passed', () => {
        expect(() => nodes.button.addEventListener('dummy')).toThrowError(TypeError);
    });

    it('should throw error when no parameters are passed', () => {
        expect(() => nodes.button.addEventListener()).toThrowError(TypeError);
    });

    [123, 'string', true, BigInt('123'), Symbol('dummy')].forEach((primitive) => {
        it(`should throw error when ${typeof primitive} is passed as second parameter`, () => {
            expect(() => nodes.button.addEventListener('dummy', primitive)).toThrowError(TypeError);
        });
    });

    describe('identical event listeners', () => {
        function test({ node, expectedCount }) {
            let count = 0;
            function listener() {
                count += 1;
            }
            node.addEventListener('test', listener);
            node.addEventListener('test', listener);
            node.dispatchEvent(new CustomEvent('test'));
            expect(count).toBe(expectedCount);
        }
        function testWithOptions({ node, options, expectedCount }) {
            let count = 0;
            function listener() {
                count += 1;
            }
            if (options) {
                options.forEach((option) => {
                    node.addEventListener('test', listener, option);
                });
            }
            node.dispatchEvent(new CustomEvent('test'));
            expect(count).toBe(expectedCount);
        }

        describe('without options', () => {
            let container;
            beforeEach(() => {
                container = createElement('x-container', { is: Container });
                document.body.appendChild(container);
            });

            it('should be discarded on host elements', () => {
                test({
                    node: container,
                    expectedCount: 1,
                });
            });
            it('should be discarded on shadow roots', () => {
                test({
                    node: container.shadowRoot,
                    expectedCount: 1,
                });
            });
            it('should be discarded on native elements', () => {
                test({
                    node: container.shadowRoot.querySelector('button'),
                    expectedCount: 1,
                });
            });
        });

        describe('with options', () => {
            let container;
            beforeEach(() => {
                container = createElement('x-container', { is: Container });
                document.body.appendChild(container);
            });

            // TODO [#2253]: Uncomment test once options are supported on host/root.
            /*
            it('should be discarded on host elements', () => {
                testWithOptions({
                    node: container,
                    options: [true, { capture: true }],
                    expectedCount: 1,
                });
            });
            */
            it('should log error on host elements', () => {
                expect(() => {
                    container.addEventListener('test', () => {}, {});
                }).toLogErrorDev(
                    /The `addEventListener` method in `LightningElement` does not support any options./
                );
            });

            // TODO [#2253]: Uncomment test once options are supported on host/root.
            /*
            it('should be discarded on shadow roots', () => {
                testWithOptions({
                    node: container.shadowRoot,
                    options: [true, { capture: true }],
                    expectedCount: 1,
                });
            });
            */
            it('should log error on shadow roots', () => {
                expect(() => {
                    container.shadowRoot.addEventListener('test', () => {}, {});
                }).toLogErrorDev(
                    /The `addEventListener` method on ShadowRoot does not support any options./
                );
            });

            it('should be discarded on native elements', () => {
                testWithOptions({
                    node: container.shadowRoot.querySelector('button'),
                    options: [true, { capture: true }],
                    expectedCount: 1,
                });
            });
        });

        describe('with different options', () => {
            let container;
            beforeEach(() => {
                container = createElement('x-container', { is: Container });
                document.body.appendChild(container);
            });

            // TODO [#2253]: Uncomment test once options are supported on host/root.
            /*
            it('should not be discarded on host elements', () => {
                testWithOptions({
                    node: container,
                    options: [true, {capture: true}, false, {capture: false}],
                    expectedCount: 2,
                });
            });
            */
            it('should log error on host elements', () => {
                expect(() => {
                    container.addEventListener('test', () => {}, {});
                }).toLogErrorDev(
                    /The `addEventListener` method in `LightningElement` does not support any options./
                );
            });

            // TODO [#2253]: Uncomment test once options are supported on host/root.
            /*
            it('should not be discarded on shadow roots', () => {
                testWithOptions({
                    node: container.shadowRoot,
                    options: [true, {capture: true}, false, {capture: false}],
                    expectedCount: 2,
                });
            });
            */
            it('should log error on shadow roots', () => {
                expect(() => {
                    container.shadowRoot.addEventListener('test', () => {}, {});
                }).toLogErrorDev(
                    /The `addEventListener` method on ShadowRoot does not support any options./
                );
            });

            it('should not be discarded on native elements', () => {
                testWithOptions({
                    node: container.shadowRoot.querySelector('button'),
                    options: [true, { capture: true }, false, { capture: false }],
                    expectedCount: 2,
                });
            });
        });
    });

    describe('should invoke listener with correct current target', () => {
        it('for host element', () => {
            let id;
            function handleTest() {
                id = this.id;
            }

            const firstContainer = createElement('x-container', { is: Container });
            firstContainer.setAttribute('id', 'first-container');
            const secondContainer = createElement('x-container', { is: Container });
            secondContainer.setAttribute('id', 'second-container');

            firstContainer.addEventListener('test', handleTest);
            secondContainer.addEventListener('test', handleTest);
            firstContainer.dispatchEvent(new CustomEvent('test'));
            expect(id).toEqual('first-container');
            secondContainer.dispatchEvent(new CustomEvent('test'));
            expect(id).toEqual('second-container');
        });

        it('for shadow root', () => {
            let id;
            function handleTest() {
                id = this.host.id;
            }

            const firstContainer = createElement('x-container', { is: Container });
            firstContainer.setAttribute('id', 'first-container');
            const firstContainerShadowRoot = firstContainer.shadowRoot;
            const secondContainer = createElement('x-container', { is: Container });
            secondContainer.setAttribute('id', 'second-container');
            const secondContainerShadowRoot = secondContainer.shadowRoot;

            firstContainerShadowRoot.addEventListener('test', handleTest);
            secondContainerShadowRoot.addEventListener('test', handleTest);
            firstContainerShadowRoot.dispatchEvent(new CustomEvent('test'));
            expect(id).toEqual('first-container');
            secondContainerShadowRoot.dispatchEvent(new CustomEvent('test'));
            expect(id).toEqual('second-container');
        });
    });
});
