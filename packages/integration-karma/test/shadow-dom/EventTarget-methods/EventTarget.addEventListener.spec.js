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

    if (!process.env.COMPAT) {
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
    }

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

    if (!process.env.COMPAT) {
        // Safari 10 does not throw these errors even though they are part of the spec
        it('should throw error when second parameter is not passed', () => {
            expect(() => nodes.button.addEventListener('dummy')).toThrowError(TypeError);
        });

        it('should throw error when no parameters are passed', () => {
            expect(() => nodes.button.addEventListener()).toThrowError(TypeError);
        });

        // IE, Firefox etc don't throw these errors
        [123, 'string', true, BigInt('123'), Symbol('dummy')].forEach((primitive) => {
            it(`should throw error when ${typeof primitive} is passed as second parameter`, () => {
                expect(() => nodes.button.addEventListener('dummy', primitive)).toThrowError(
                    TypeError
                );
            });
        });
    }

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

    describe('identical listeners', () => {
        describe('should discard multiple identical listeners on same target', () => {
            function testDiscardingIdenticalListeners(
                target,
                listenerTargets,
                expected,
                composed = false
            ) {
                const logs = [];
                const listener = function (event) {
                    logs.push([this, event.currentTarget]);
                };
                listenerTargets.forEach((target) => {
                    target.addEventListener('dedupe', listener);
                    target.addEventListener('dedupe', listener); // identical listener
                });
                target.dispatchEvent(new CustomEvent('dedupe', { bubbles: true, composed }));
                expect(logs).toEqual(expected);
            }
            it('listeners on shadow root, non-composed event', () => {
                const expected = [
                    [nodes.button, nodes.button],
                    [nodes['container_div'], nodes['container_div']],
                ];

                if (process.env.NATIVE_SHADOW) {
                    expected.push([
                        nodes['x-container'].shadowRoot,
                        nodes['x-container'].shadowRoot,
                    ]);
                } else {
                    expected.push([nodes['x-container'].shadowRoot, nodes['x-container']]);
                }

                testDiscardingIdenticalListeners(
                    nodes.button,
                    [nodes.button, nodes['container_div'], nodes['x-container'].shadowRoot],
                    expected
                );
                testDiscardingIdenticalListeners(
                    nodes.button,
                    [nodes.button, nodes['container_div'], nodes['x-container'].shadowRoot],
                    expected
                );
            });

            it('listeners on host, composed event', () => {
                testDiscardingIdenticalListeners(
                    nodes.button,
                    [nodes.button, nodes['container_div'], nodes['x-container']],
                    [
                        [nodes.button, nodes.button],
                        [nodes['container_div'], nodes['container_div']],
                        [nodes['x-container'], nodes['x-container']],
                    ],
                    true
                );
            });
        });
        describe('should invoke identical listeners on same target with different options', () => {
            // Note: addEventListener() with options are restricted for shadow root and host elements
            function testIdenticalListeners(target, listenerTargets, expected) {
                const logs = [];
                const listener = function (event) {
                    logs.push([this, event.currentTarget]);
                };
                listenerTargets.forEach((target) => {
                    target.addEventListener('identical', listener);
                    target.addEventListener('identical', listener, { passive: true }); // identical listener with different option
                });
                target.dispatchEvent(new CustomEvent('identical', { bubbles: true }));
                expect(logs).toEqual(expected);
            }
            it('listeners on standard html elements', () => {
                testIdenticalListeners(
                    nodes.button,
                    [nodes.button, nodes['container_div']],
                    [
                        [nodes.button, nodes.button],
                        [nodes['container_div'], nodes['container_div']],
                    ]
                );
            });
        });
    });
});
