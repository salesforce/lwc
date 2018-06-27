import { Element, getHostShadowRoot } from "../../html-element";
import { createElement } from "../../upgrade";

// https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element
describe('assignedNodes', () => {
    describe('slots fallback (basic)', () => {
        // Initialized before each test
        let element;

        beforeEach(() => {
            function html($api, $cmp, $slotset) {
                return [
                    $api.s('', { key: 0 }, [
                        $api.h('div', { key: 1 }, [])
                    ], $slotset)
                ];
            }
            html.slots = [''];

            class MyComponent extends Element {
                render() {
                    return html;
                }
            }

            /*
            <x-assigned-nodes>
                <slot>
                    <div />
                </slot>
            </x-assigned-nodes>
            */
            element = createElement('x-assigned-nodes', { is: MyComponent });
        });

        it('should not find any slotables', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot');
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should find flattened slotables', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot');
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('slots fallback (slots in slots)', () => {
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

            class MyComponent extends Element {
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
            expect(assigned[0].tagName).toBe('SLOT');
            expect(assigned[0].name).toBe('inner');
        });

        it('should find flattened slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="inner"]');
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('slots fallback (slots in slots with assigned slotable)', () => {
        describe('when slotable assigned to outer slot', () => {
            // Initialized before each test
            let element;

            beforeEach(() => {
                class AssignedNodesChild extends Element {
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

                class AssignedNodes extends Element {
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
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                // skipping this one because in fallback, if content is slotted for the outer, the inner slot
                // is not added to the DOM at all.
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it.skip('should find flattened slotables (assigned) for the outer slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="outer"]');
                const assigned = slot.assignedNodes({ flatten: true });
                // skipping this one because in fallback, if content is slotted for the outer, the default content
                // is not added to the DOM at all.
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should find flattened slotables (fallback) for the inner slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                // skipping this one because in fallback, if content is slotted for the outer, the inner slot
                // is not added to the DOM at all.
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('DIV');
            });
        });

        describe('when slotable assigned to inner slot', () => {
            // Initialized before each test
            let element;

            beforeEach(() => {
                class AssignedNodesChild extends Element {
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

                class AssignedNodes extends Element {
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

            it('should find flattened slotables (fallback) for the outer slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="outer"]');
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('SLOT');
                expect(assigned[0].name).toBe('inner');
            });

            it.skip('should find flattened slotables (fallback) for the inner slot', () => {
                document.body.appendChild(element);
                const slot = getHostShadowRoot(getHostShadowRoot(element).querySelector('x-assigned-nodes-child'))
                    .querySelector('[name="inner"]');
                const assigned = slot.assignedNodes({ flatten: true });
                // Skipping this because in fallback mode the default content (surfaced via flatten) is not supported
                // if slotted content is provided.
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('DIV');
            });
        });
    });
});
