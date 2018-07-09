import { LightningElement, getHostShadowRoot } from "../../framework/html-element";
import { createElement } from "../../framework/upgrade";

// https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element
describe('assignedNodes and assignedElements', () => {
    describe('slots default content', () => {
        // Initialized before each test
        let element;

        beforeEach(() => {
            function html($api, $cmp, $slotset) {
                return [
                    $api.s('', { key: 0 }, [
                        $api.p('awesome comment'),
                        $api.t('foo bar baz'),
                        $api.h('div', { key: 1 }, [])
                    ], $slotset)
                ];
            }
            html.slots = [''];

            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            /*
            <x-assigned-nodes>
                <slot>
                    <!-- awesome comment -->
                    foo bar baz
                    <div />
                </slot>
            </x-assigned-nodes>
            */
            element = createElement('x-assigned-nodes', { is: MyComponent });
        });

        it('should not find any slotables (assignedNodes)', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot');
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should not find any slotables (assignedElements)', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot');
            expect(slot.assignedElements()).toHaveLength(0);
        });

        it('should find flattened slotables (assignedNodes)', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot');
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(3);
            expect(assigned[2].tagName).toBe('DIV');
        });

        it('should find flattened slotables (assignedElements)', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot');
            const assigned = slot.assignedElements({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('nested slots default content', () => {
        // Initialized before each test
        let element;

        beforeEach(() => {
            function html($api, $cmp, $slotset) {
                return [
                    $api.s('outer', { key: 0, attrs: { name: 'outer' } }, [
                        $api.s('inner', { key: 1, attrs: { name: 'inner' } }, [
                            $api.h('div', { key: 2 }, [])
                        ], $slotset)
                    ], $slotset)
                ];
            }
            html.slots = ['outer', 'inner'];

            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            /*
            <x-assigned-nodes>
                <slot name="outer">
                    <slot name="inner">
                        <div />
                    </slot>
                </slot>
            </x-assigned-nodes>
            */
            element = createElement('x-assigned-nodes', { is: MyComponent });
        });

        it('should not find any slotables for the outer slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="outer"]');
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should not find any slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="inner"]');
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should find flattened slotables for the outer slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="outer"]');
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });

        it('should find flattened slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="inner"]');
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('nested slots assigned content', () => {
        describe('when slotable assigned to outer slot', () => {
            // Initialized before each test
            let element;

            beforeEach(() => {
                class AssignedNodesChild extends LightningElement {
                    render() {
                        const html = function($api, $cmp, $slotset) {
                            return [
                                $api.s('outer', { key: 0, attrs: { name: 'outer' } }, [
                                    $api.s('inner', { key: 1, attrs: { name: 'inner' } }, [
                                        $api.h('div', { key: 2 }, [])
                                    ], $slotset)
                                ], $slotset)
                            ];
                        };
                        html.slots = ['outer', 'inner'];
                        return html;
                    }
                }

                class AssignedNodes extends LightningElement {
                    render() {
                        return function($api, $cmp, $slotset) {
                            return [
                                $api.c('x-assigned-nodes-child', AssignedNodesChild, { key: 3 }, [
                                    $api.h('p', { key: 4, attrs: { slot: 'outer' }, }, []),
                                ])
                            ];
                        };
                    }
                }

                /*
                <x-assigned-nodes>
                    <x-assigned-nodes-child>
                        <p slot="outer" />
                    </x-assigned-nodes-child>
                </x-assigned-nodes>

                <x-assigned-nodes-child>
                    <slot name="outer">
                        <slot name="inner">
                            <div />
                        </slot>
                    </slot>
                </x-assigned-nodes-child>
                */
                element = createElement('x-assigned-nodes', { is: AssignedNodes });
            });

            it('should find the slotable for the outer slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="outer"]');
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should not find any slotable for the inner slot', () => {
                // not possible in fallback mode because if the content of the outer is
                // slotted correctly, its fallback with the inner is not going to be added
                // to the dom.
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it('should find assigned content for the outer slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="outer"]');
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should find default content for the inner slot', () => {
                // not possible in fallback mode because if the content of the outer is
                // slotted correctly, its fallback with the inner is not going to be added
                // to the dom.
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('DIV');
            });
        });

        describe('when slotable assigned to inner slot', () => {
            // Initialized before each test
            let element;

            beforeEach(() => {
                class AssignedNodesChild extends LightningElement {
                    render() {
                        const html = function($api, $cmp, $slotset) {
                            return [
                                $api.s('outer', { key: 0, attrs: { name: 'outer' } }, [
                                    $api.s('inner', { key: 1, attrs: { name: 'inner' } }, [
                                        $api.h('div', { key: 2 }, [])
                                    ], $slotset)
                                ], $slotset)
                            ];
                        };
                        html.slots = ['outer', 'inner'];
                        return html;
                    }
                }

                class AssignedNodes extends LightningElement {
                    render() {
                        return function($api, $cmp, $slotset) {
                            return [
                                $api.c('x-assigned-nodes-child', AssignedNodesChild, { key: 3 }, [
                                    $api.h('p', { key: 4, attrs: { slot: 'inner' } }, []),
                                ])
                            ];
                        };
                    }
                }

                /*
                <x-assigned-nodes>
                    <x-assigned-nodes-child>
                        <p slot="inner" />
                    </x-assigned-nodes-child>
                </x-assigned-nodes>

                <x-assigned-nodes-child>
                    <slot name="outer">
                        <slot name="inner">
                            <div />
                        </slot>
                    </slot>
                </x-assigned-nodes-child>
                */
                element = createElement('x-assigned-nodes', { is: AssignedNodes });
            });

            it('should not find any slotable for the outer slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="outer"]');
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it('should find the slotable for the inner slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it('should find default content for the outer slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="outer"]');
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it('should find assigned content for the inner slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });
        });
    });
});

describe('slot.name', () => {
    describe('in fallback', () => {

        it('should resolve the right property name on every slot', () => {
            let element;
            function html($api, $cmp, $slotset) {
                return [
                    $api.s('', { key: 0 }, [
                        $api.h('h1', { key: 1 }, [])
                    ], $slotset),
                    $api.s('foo', { key: 3, attrs: { name: "foo" } }, [
                        $api.h('h2', { key: 4 }, [])
                    ], $slotset)
                ];
            }
            html.slots = ['', 'foo'];

            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            /*
            <x-nodes>
                <slot>
                    <h1 />
                </slot>
                <slot name="foo">
                    <h2 />
                </slot>
            </x-nodes>
            */
            element = createElement('x-assigned-nodes', { is: MyComponent });
            document.body.appendChild(element);
            const slots = getHostShadowRoot(element).querySelectorAll('slot');
            expect(slots.length).toBe(2);
            expect(slots[0].name).toBe('');
            expect(slots[1].name).toBe('foo');
            expect(slots[0].getAttribute('name')).toBe(null);
            expect(slots[1].getAttribute('name')).toBe('foo');
        });

    });
});

describe('slotted elements', () => {
    it('should be visible via event.target', () => {
        expect.assertions(5);

        function htmlChild($api, $cmp) {
            return [
                $api.h('button', {
                    key: 0,
                }, [ $api.t('click me') ]),
            ];
        }

        class XChild extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', this.handleClickOnChild.bind(this));
            }
            render() {
                return htmlChild;
            }
            handleClickOnChild(e) {
                expect(e.target).toBe(this.template.querySelector('button'));
            }
        }

        function htmlContainer($api, $cmp, $slotSet) {
            return [
                $api.s('', { key: 0, on: { click: $api.b($cmp.handleClickInSlot) } }, [], $slotSet),
            ];
        }
        htmlContainer.slots = [''];

        class XContainer extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', this.handleClickInContainer.bind(this));
            }
            render() {
                return htmlContainer;
            }
            handleClickInContainer(e) {
                expect(e.target).toBe(this.querySelector('x-child'));
            }
            handleClickInSlot(e) {
                expect(e.target).toBe(this.querySelector('x-child'));
                expect(e.currentTarget).toBe(this.template.querySelector('slot'));
            }
        }

        function htmlMock($api, $cmp) {
            return [
                $api.c('x-container', XContainer, {
                    key: 0,
                }, [ $api.c('x-child', XChild, { key: 1 }, []) ]),
            ];
        }

        class MyMock extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', this.handleClickInMock.bind(this));
            }
            render() {
                return htmlMock;
            }
            handleClickInMock(e) {
                expect(e.target).toBe(this.template.querySelector('x-child'));
            }
        }

        const elm = createElement('x-mock', { is: MyMock, fallback: true });
        document.body.appendChild(elm);
        const child = getHostShadowRoot(elm).querySelector('x-child');
        const button = getHostShadowRoot(child).querySelector('button');
        button.click();
    });
});
