import { LightningElement, getHostShadowRoot } from "../../framework/html-element";
import { createElement } from "../../framework/upgrade";
import { compileTemplate } from 'test-utils';

interface LightningSlotElement extends HTMLSlotElement {
    assignedElements(options?: object): Element[];
}

describe.skip('slotchange event', () => {
    describe('declarative binding', () {
        // Initialized before each test
        let element;

        beforeEach(() => {
            class Child extends LightningElement {
                constructor() {
                    super();
                    this._assignedElementsCount = -1;
                    this._slotChangeCount = 0;
                }
                render() {
                    return compileTemplate(`
                        <template>
                            <slot onslotchange={handleSlotChange}></slot>
                        </template>
                    `);
                }
                handleSlotChange(event) {
                    this._slotChangeCount += 1;
                    this._assignedElementsCount = event.assignedElements().length;
                }
                get assignedElementsCount() {
                    return this._assignedElementsCount;
                }
                get slotChangeCount() {
                    return this._slotChangeCount;
                }
            }
            Child.publicProps = {
                assignedElementsCount: {
                    config: 1, // readonly
                },
                slotChangeCount: {
                    config: 1, // readonly
                },
            };

            class Parent extends LightningElement {
                constructor() {
                    super();
                    this.things = ['foo'];
                }
                render() {
                    return compileTemplate(`
                        <template>
                            <x-child>
                                <template for:each={things} for:item="thing">
                                    <span key={thing}>{thing}</span>
                                </template>
                            </x-child>
                        </template>
                    `, {
                        modules: { 'x-child': Child }
                    });
                }
                setThings(things) {
                    this.things = things;
                }
            }
            Parent.publicMethods = ['setThings'];
            Parent.track = { things: 1 };

            element = createElement('x-parent', { is: Parent });
        });

        it('should dispatch on initial render', () => {
            document.body.appendChild(element);
            const child: HTMLUnknownElement = getHostShadowRoot(element).querySelector('x-child');
            expect(child.assignedElementsCount).toBe(1);
            expect(child.slotChangeCount).toBe(1);
        });

        it('should dispatch when adding slotables', () => {
            document.body.appendChild(element);
            element.setThings(['foo', 'bar']);
            const child: HTMLUnknownElement = getHostShadowRoot(element).querySelector('x-child');
            expect(child.assignedElementsCount).toBe(2);
            expect(child.slotChangeCount).toBe(2);
        });

        it('should dispatch when removing slotables', () => {
            document.body.appendChild(element);
            element.setThings([]);
            const child: HTMLUnknownElement = getHostShadowRoot(element).querySelector('x-child');
            expect(child.assignedElementsCount).toBe(0);
            expect(child.slotChangeCount).toBe(2);
        });
    });

    describe('programmatic binding', () {
        // Initialized before each test
        let element;

        beforeEach(() => {
            class Child extends LightningElement {
                render() {
                    return compileTemplate(`
                        <template>
                            <slot></slot>
                        </template>
                    `);
                }
            }

            class Parent extends LightningElement {
                things;
                constructor() {
                    super();
                    this.things = ['foo'];
                }
                render() {
                    return compileTemplate(`
                        <template>
                            <x-child>
                                <template for:each={things} for:item="thing">
                                    <span key={thing}>{thing}</span>
                                </template>
                            </x-child>
                        </template>
                    `, {
                        modules: { 'x-child': Child }
                    });
                }
                setThings(things) {
                    this.things = things;
                }
            }
            Parent.publicMethods = ['setThings'];
            Parent.track = { things: 1 };

            element = createElement('x-parent', { is: Parent });
        });

        it('should not be composed', () => {
            expect.assertions(1);

            element.addEventListener('slotchange', () => {
                // Host element should not get the event
                expect(false);
            });
            document.body.appendChild(element);
            expect(true);
        });

        it('should dispatch when adding slotables', () => {
            expect.assertions(1);

            document.body.appendChild(element);
            const child: HTMLUnknownElement = getHostShadowRoot(element).querySelector('x-child');
            const shadowRoot = getHostShadowRoot(child);
            shadowRoot.addEventListener('slotchange', () => {
                const slot = event.target as LightningSlotElement;
                expect(slot.assignedElements().length).toBe(2);
            });
            element.setThings(['foo', 'bar']);
        });

        it('should dispatch when removing slotables', () => {
            expect.assertions(1);

            document.body.appendChild(element);
            const child: HTMLUnknownElement = getHostShadowRoot(element).querySelector('x-child');
            const shadowRoot = getHostShadowRoot(child);
            shadowRoot.addEventListener('slotchange', () => {
                const slot = event.target as LightningSlotElement;
                expect(slot.assignedElements().length).toBe(0);
            });
            element.setThings([]);
        });
    });
});

// https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element
describe('assignedNodes and assignedElements', () => {
    describe('slots default content', () => {
        // Initialized before each test
        let element;

        beforeEach(() => {
            function html($api, $cmp, $slotset) {
                return [
                    // Does not use compileTemplate because we want to preserve
                    // comment nodes to make assertions for assignedNodes().
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
            const slot = getHostShadowRoot(element).querySelector('slot') as LightningSlotElement;
            expect(slot.assignedElements()).toHaveLength(0);
        });

        it('should find flattened slotables (assignedNodes)', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot') as LightningSlotElement;
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(3);
            expect(assigned[2].tagName).toBe('DIV');
        });

        it('should find flattened slotables (assignedElements)', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('slot') as LightningSlotElement;
            const assigned = slot.assignedElements({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('nested slots default content', () => {
        // Initialized before each test
        let element;

        const html = compileTemplate(`
            <template>
                <slot name="outer">
                    <slot name="inner">
                        <div></div>
                    </slot>
                </slot>
            </template>
        `);
        html.slots = ['outer', 'inner'];

        beforeEach(() => {
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }
            element = createElement('x-assigned-nodes', { is: MyComponent });
        });

        it('should not find any slotables for the outer slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="outer"]') as LightningSlotElement;
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should not find any slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="inner"]') as LightningSlotElement;
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should find flattened slotables for the outer slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="outer"]') as LightningSlotElement;
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });

        it('should find flattened slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = getHostShadowRoot(element).querySelector('[name="inner"]') as LightningSlotElement;
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
                const childHtml = compileTemplate(`
                    <template>
                        <slot name="outer">
                            <slot name="inner">
                                <div></div>
                            </slot>
                        </slot>
                    </template>
                `);
                childHtml.slots = ['outer', 'inner'];

                class AssignedNodesChild extends LightningElement {
                    render() {
                        return childHtml;
                    }
                }

                const parentHtml = compileTemplate(`
                    <template>
                        <x-assigned-nodes-child>
                            <p slot="outer"></p>
                        </x-assigned-nodes-child>
                    </template>
                `, {
                    modules: { 'x-assigned-nodes-child': AssignedNodesChild }
                });

                class AssignedNodesParent extends LightningElement {
                    render() {
                        return parentHtml;
                    }
                }

                element = createElement('x-assigned-nodes', { is: AssignedNodesParent });
            });

            it('should find the slotable for the outer slot', () => {
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should not find any slotable for the inner slot', () => {
                // not possible in fallback mode because if the content of the outer is
                // slotted correctly, its fallback with the inner is not going to be added
                // to the dom.
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it('should find assigned content for the outer slot', () => {
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should find default content for the inner slot', () => {
                // not possible in fallback mode because if the content of the outer is
                // slotted correctly, its fallback with the inner is not going to be added
                // to the dom.
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('DIV');
            });
        });

        describe('when slotable assigned to inner slot', () => {
            // Initialized before each test
            let element;

            beforeEach(() => {
                const childHtml = compileTemplate(`
                    <template>
                        <slot name="outer">
                            <slot name="inner">
                                <div></div>
                            </slot>
                        </slot>
                    </template>
                `);
                childHtml.slots = ['outer', 'inner'];

                class AssignedNodesChild extends LightningElement {
                    render() {
                        return childHtml;
                    }
                }

                const parentHtml = compileTemplate(`
                    <template>
                        <x-assigned-nodes-child>
                            <p slot="inner"></p>
                        </x-assigned-nodes-child>
                    </template>
                `, {
                    modules: { 'x-assigned-nodes-child': AssignedNodesChild }
                });

                class AssignedNodesParent extends LightningElement {
                    render() {
                        return parentHtml;
                    }
                }

                element = createElement('x-assigned-nodes', { is: AssignedNodesParent });
            });

            it('should not find any slotable for the outer slot', () => {
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it('should find the slotable for the inner slot', () => {
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it('should find default content for the outer slot', () => {
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it('should find assigned content for the inner slot', () => {
                document.body.appendChild(element);
                const child = getHostShadowRoot(element).querySelector('x-assigned-nodes-child');
                const slot = getHostShadowRoot(child as HTMLUnknownElement).querySelector('[name="inner"]') as LightningSlotElement;
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

            const html = compileTemplate(`
                <template>
                    <slot>
                        <h1></h1>
                    </slot>
                    <slot name="foo">
                        <h2></h2>
                    </slot>
                </template>
            `);
            html.slots = ['', 'foo'];

            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

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

        const htmlChild = compileTemplate(`
            <template>
                <button>click me</button>
            </template>
        `);

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

        const htmlContainer = compileTemplate(`
            <template>
                <slot onclick={handleClickInSlot}></slot>
            </template>
        `);
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

        const htmlMock = compileTemplate(`
            <template>
                <x-container>
                    <x-child></x-child>
                </x-container>
            </template>
        `, {
            modules: {
                'x-container': XContainer,
                'x-child': XChild,
            }
        });

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
        const button = getHostShadowRoot(child as HTMLUnknownElement).querySelector('button');
        button.click();
    });
});
