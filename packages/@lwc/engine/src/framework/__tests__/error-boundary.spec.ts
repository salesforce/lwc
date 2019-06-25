/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

const emptyTemplate = compileTemplate(`<template></template>`);

function createBoundaryComponent({ name, ctor }) {
    const baseTmpl = compileTemplate(
        `
        <template>
            <${name}></${name}>
        </template>
    `,
        {
            modules: { [name]: ctor },
        }
    );

    const recoveryTmpl = compileTemplate(`
        <template></template>
    `);

    class Boundary extends LightningElement {
        error = null;
        getError() {
            return this.error;
        }
        errorCallback(error) {
            this.error = error.message;
        }
        render() {
            return this.error ? recoveryTmpl : baseTmpl;
        }
    }
    Boundary.track = { error: 1 };
    Boundary.publicMethods = ['getError'];

    return Boundary;
}

describe('error boundary component', () => {
    describe('errors occurred inside boundary wrapped child`s life-cycle methods', () => {
        describe('constructor', () => {
            it('should call errorCallback when boundary child throws inside constructor', () => {
                class BoundaryChild extends LightningElement {
                    constructor() {
                        super();
                        throw new Error('Child Constructor Throw');
                    }
                }
                const Boundary = createBoundaryComponent({
                    name: 'x-child',
                    ctor: BoundaryChild,
                });
                const boundaryElm = createElement('x-boundary', { is: Boundary });
                document.body.appendChild(boundaryElm);

                expect(boundaryElm.getError()).toBe('Child Constructor Throw');
            }),
                it('should not affect error boundary siblings when boundary child throws inside constructor', () => {
                    class BoundaryChild extends LightningElement {
                        constructor() {
                            super();
                            throw new Error('Child Constructor Throw');
                        }
                    }

                    class BoundarySibling extends LightningElement {}

                    const Boundary = createBoundaryComponent({
                        name: 'x-child',
                        ctor: BoundaryChild,
                    });

                    const html = compileTemplate(
                        `
                    <template>
                        <x-boundary></x-boundary>
                        <x-boundary-sibling></x-boundary-sibling>
                    </template>
                `,
                        {
                            modules: {
                                'x-boundary': Boundary,
                                'x-boundary-sibling': BoundarySibling,
                            },
                        }
                    );
                    class BoundaryHost extends LightningElement {
                        render() {
                            return html;
                        }
                    }

                    const boundaryHostElm = createElement('x-parent', { is: BoundaryHost });
                    document.body.appendChild(boundaryHostElm);
                    expect(
                        boundaryHostElm.shadowRoot.querySelectorAll('x-boundary-sibling').length
                    ).toBe(1);
                }),
                it('should unmount every descendent if a child constructor throws', () => {
                    class SecondLevelChild extends LightningElement {}

                    const firstChildTmpl = compileTemplate(
                        `
                    <template>
                        <x-second-level-child></x-second-level-child>
                    </template>
                `,
                        {
                            modules: {
                                'x-second-level-child': SecondLevelChild,
                            },
                        }
                    );
                    class FirstLevelChild extends LightningElement {
                        constructor() {
                            super();
                            throw new Error('Child Constructor Throw');
                        }

                        render() {
                            return firstChildTmpl;
                        }
                    }

                    const Boundary = createBoundaryComponent({
                        name: 'x-first-level-child',
                        ctor: FirstLevelChild,
                    });

                    const elm = createElement('x-boundary', { is: Boundary });
                    document.body.appendChild(elm);

                    expect(elm.shadowRoot.querySelector('x-second-level-child')).toBeNull();
                    expect(elm.shadowRoot.querySelector('x-first-level-child')).toBeNull();
                }),
                it('should throw if error occurs in error boundary constructor', () => {
                    class FirstLevelChildSibling extends LightningElement {}

                    class FirstLevelChild extends LightningElement {}

                    const html = compileTemplate(
                        `
                    <template>
                        <x-first-level-child-sibling></x-first-level-child-sibling>
                        <x-first-level-child></x-first-level-child>
                    </template>
                `,
                        {
                            modules: {
                                'x-first-level-child-sibling': FirstLevelChildSibling,
                                'x-first-level-child': FirstLevelChild,
                            },
                        }
                    );
                    class Boundary extends LightningElement {
                        constructor() {
                            super();
                            throw new Error();
                        }

                        render() {
                            return html;
                        }
                    }

                    expect(() => {
                        const elm = createElement('x-boundary', { is: Boundary });
                        document.body.appendChild(elm);
                    }).toThrow();
                    expect(document.body.querySelector('x-first-level-child')).toBeNull();
                    expect(document.body.querySelector('x-first-level-child-sibling')).toBeNull();
                });
        }),
            describe('render', () => {
                it('should call errorCallback when boundary child throws inside render', () => {
                    class BoundaryChild extends LightningElement {
                        render() {
                            throw new Error('Child Render Throw');
                        }
                    }

                    const Boundary = createBoundaryComponent({
                        name: 'x-child',
                        ctor: BoundaryChild,
                    });

                    const boundaryElm = createElement('x-boundary', { is: Boundary });
                    document.body.appendChild(boundaryElm);

                    expect(boundaryElm.getError()).toBe('Child Render Throw');
                }),
                    it('should not capture error from its own render method', () => {
                        class Boundary extends LightningElement {
                            errorCallback() {
                                throw new Error('This should not be called');
                            }
                            render() {
                                throw new Error('Boundary Render Throw');
                            }
                        }

                        const boundaryElm = createElement('x-boundary', { is: Boundary });

                        expect(() => {
                            document.body.appendChild(boundaryElm);
                        }).toThrow(`Boundary Render Throw`);
                    }),
                    it('should not affect error boundary siblings when boundary child throws inside render', () => {
                        class BoundaryChild extends LightningElement {
                            render() {
                                throw new Error('Child Constructor Throw');
                            }
                        }

                        class BoundarySibling extends LightningElement {}

                        const Boundary = createBoundaryComponent({
                            name: 'x-child',
                            ctor: BoundaryChild,
                        });

                        const html = compileTemplate(
                            `
                    <template>
                        <x-boundary></x-boundary>
                        <x-boundary-sibling></x-boundary-sibling>
                    </template>
                `,
                            {
                                modules: {
                                    'x-boundary': Boundary,
                                    'x-boundary-sibling': BoundarySibling,
                                },
                            }
                        );
                        class BoundaryHost extends LightningElement {
                            render() {
                                return html;
                            }
                        }

                        const boundaryHostElm = createElement('x-parent', { is: BoundaryHost });
                        document.body.appendChild(boundaryHostElm);

                        expect(
                            boundaryHostElm.shadowRoot.querySelectorAll('x-boundary-sibling').length
                        ).toBe(1);
                    }),
                    it('should unmount child and its subtree if boundary child throws inside render', () => {
                        class SecondLevelChild extends LightningElement {
                            render() {
                                throw new Error('Child Render Throw');
                            }
                        }

                        const firstChildTmpl = compileTemplate(
                            `
                    <template>
                        <x-second-level-child></x-second-level-child>
                    </template>
                `,
                            {
                                modules: {
                                    'x-second-level-child': SecondLevelChild,
                                },
                            }
                        );
                        class FirstLevelChild extends LightningElement {
                            render() {
                                return firstChildTmpl;
                            }
                        }

                        const Boundary = createBoundaryComponent({
                            name: 'x-first-level-child',
                            ctor: FirstLevelChild,
                        });

                        const elm = createElement('x-boundary', { is: Boundary });
                        document.body.appendChild(elm);
                        return Promise.resolve().then(() => {
                            expect(elm.shadowRoot.querySelector('x-first-level-child')).toBeNull();
                            expect(elm.shadowRoot.querySelector('x-second-level-child')).toBeNull();
                        });
                    }),
                    it('should call errorCallback if slot throws an error inside render', () => {
                        class SlotCmp extends LightningElement {
                            render() {
                                throw Error('Slot cmp throws in render method');
                            }
                        }

                        const childWithSlotTmpl = compileTemplate(`
                    <template>
                        <slot name="x"></slot>
                    </template>
                `);
                        class ChildWithSlot extends LightningElement {
                            render() {
                                return childWithSlotTmpl;
                            }
                        }

                        const boundaryWithSlot = compileTemplate(
                            `
                    <template>
                        <x-child-with-slot>
                            <x-slot-cmp slot="x"></x-slot-cmp>
                        </x-child-with-slot>
                    </template>
                `,
                            {
                                modules: {
                                    'x-slot-cmp': SlotCmp,
                                    'x-child-with-slot': ChildWithSlot,
                                },
                            }
                        );
                        class BoundaryWithSlot extends LightningElement {
                            getError() {
                                return this.error;
                            }
                            errorCallback(error) {
                                this.error = error.message;
                            }
                            render() {
                                return boundaryWithSlot;
                            }
                        }
                        BoundaryWithSlot.publicMethods = ['getError'];
                        BoundaryWithSlot.track = { error: 1 };

                        const boundaryElm = createElement('x-boundary-with-slot', {
                            is: BoundaryWithSlot,
                        });
                        document.body.appendChild(boundaryElm);

                        expect(boundaryElm.getError()).toBe('Slot cmp throws in render method');
                    });
            }),
            describe('renderedCallback', () => {
                it('should call errorCallback when boundary child throws inside renderedCallback', () => {
                    class BoundaryChild extends LightningElement {
                        renderedCallback() {
                            throw new Error('Child RenderedCallback Throw');
                        }
                    }

                    const Boundary = createBoundaryComponent({
                        name: 'x-child',
                        ctor: BoundaryChild,
                    });

                    const boundaryElm = createElement('x-boundary', { is: Boundary });
                    document.body.appendChild(boundaryElm);

                    expect(boundaryElm.getError()).toBe('Child RenderedCallback Throw');
                }),
                    it('should throw an error when error boundary throws inside renderedCallback', () => {
                        class Boundary extends LightningElement {
                            getError() {
                                return this.error;
                            }
                            errorCallback(error) {
                                this.error = error.message;
                            }
                            renderedCallback() {
                                throw new Error('Boundary RenderedCallback Throw');
                            }
                        }
                        Boundary.publicMethods = ['getError'];
                        Boundary.track = { error: 1 };

                        const boundaryElm = createElement('x-boundary', { is: Boundary });

                        expect(() => {
                            document.body.appendChild(boundaryElm);
                        }).toThrow();
                    }),
                    it('should unomunt child error boundary component if it throws inside errorCallback', () => {
                        class ChildBoundaryContent extends LightningElement {
                            renderedCallback() {
                                throw new Error('Child RenderedCallback Throw');
                            }
                        }

                        const html = compileTemplate(
                            `
                    <template>
                        <child-boundary-content></child-boundary-content>
                    </template>
                `,
                            {
                                modules: { 'child-boundary-content': ChildBoundaryContent },
                            }
                        );
                        class ChildErrorBoundary extends LightningElement {
                            getError() {
                                return this.error;
                            }
                            errorCallback() {
                                throw new Error('Child Boundary ErrorCallback Throw');
                            }
                            render() {
                                return html;
                            }
                        }
                        ChildErrorBoundary.publicMethods = ['getError'];
                        ChildErrorBoundary.track = { error: 1 };

                        const HostErrorBoundary = createBoundaryComponent({
                            name: 'child-error-boundary',
                            ctor: ChildErrorBoundary,
                        });

                        const hostBoundaryElm = createElement('host-boundary', {
                            is: HostErrorBoundary,
                        });
                        document.body.appendChild(hostBoundaryElm);

                        expect(hostBoundaryElm.getError()).toBe(
                            'Child Boundary ErrorCallback Throw'
                        );
                        return Promise.resolve().then(() => {
                            // boundary is re-rendered on the next tick
                            expect(
                                hostBoundaryElm.shadowRoot.querySelectorAll('child-error-boundary')
                                    .length
                            ).toBe(0);
                        });
                    });

                it('should unmount error boundary child if it throws inside renderedCallback', () => {
                    class ChildErrorBoundary extends LightningElement {
                        getError() {
                            return this.error;
                        }
                        errorCallback(error) {
                            this.error = error.message;
                        }
                        renderedCallback() {
                            throw new Error('Child Boundary RenderedCallback Throw');
                        }
                    }
                    ChildErrorBoundary.publicMethods = ['getError'];
                    ChildErrorBoundary.track = { error: 1 };

                    const HostErrorBoundary = createBoundaryComponent({
                        name: 'child-error-boundary',
                        ctor: ChildErrorBoundary,
                    });

                    const hostBoundaryElm = createElement('host-boundary', {
                        is: HostErrorBoundary,
                    });
                    document.body.appendChild(hostBoundaryElm);

                    expect(hostBoundaryElm.getError()).toBe(
                        'Child Boundary RenderedCallback Throw'
                    );
                    expect(hostBoundaryElm.querySelectorAll('child-error-boundary').length).toBe(0);
                }),
                    it('should invoke parent boundary if child`s immediate boundary fails inside renderedCallback', () => {
                        class ChildBoundaryContent extends LightningElement {
                            renderedCallback() {
                                throw new Error('Child RenderedCallback Throw');
                            }
                        }

                        const html = compileTemplate(
                            `
                    <template>
                        <child-boundary-content></child-boundary-content>
                    </template>
                `,
                            {
                                modules: { 'child-boundary-content': ChildBoundaryContent },
                            }
                        );
                        class ChildErrorBoundary extends LightningElement {
                            getError() {
                                return this.error;
                            }
                            errorCallback(error) {
                                this.error = error.message;
                            }
                            renderedCallback() {
                                throw new Error('Child Boundary RenderedCallback Throw');
                            }
                            render() {
                                return html;
                            }
                        }
                        ChildErrorBoundary.publicMethods = ['getError'];
                        ChildErrorBoundary.track = { error: 1 };

                        const HostErrorBoundary = createBoundaryComponent({
                            name: 'child-error-boundary',
                            ctor: ChildErrorBoundary,
                        });

                        const hostBoundaryElm = createElement('host-boundary', {
                            is: HostErrorBoundary,
                        });
                        document.body.appendChild(hostBoundaryElm);

                        expect(hostBoundaryElm.getError()).toBe(
                            'Child Boundary RenderedCallback Throw'
                        );
                        expect(
                            hostBoundaryElm.querySelectorAll('child-error-boundary').length
                        ).toBe(0);
                        expect(
                            hostBoundaryElm.querySelectorAll('child-boundary-content').length
                        ).toBe(0);
                    }),
                    it('should not affect error boundary siblings when boundary child throws inside renderedCallback', () => {
                        class BoundaryChild extends LightningElement {
                            renderedCallback() {
                                throw new Error('Child RenderedCallback Throw');
                            }
                        }
                        class BoundarySibling extends LightningElement {}

                        const Boundary = createBoundaryComponent({
                            name: 'x-child',
                            ctor: BoundaryChild,
                        });

                        const html = compileTemplate(
                            `
                    <template>
                        <x-boundary></x-boundary>
                        <x-boundary-sibling></x-boundary-sibling>
                    </template>
                `,
                            {
                                modules: {
                                    'x-boundary': Boundary,
                                    'x-boundary-sibling': BoundarySibling,
                                },
                            }
                        );
                        class BoundaryHost extends LightningElement {
                            render() {
                                return html;
                            }
                        }
                        const boundaryHostElm = createElement('x-parent', { is: BoundaryHost });
                        document.body.appendChild(boundaryHostElm);

                        expect(
                            boundaryHostElm.shadowRoot.querySelectorAll('x-boundary-sibling').length
                        ).toBe(1);
                    }),
                    it('should unmount boundary child and its subtree if child throws inside renderedCallback', () => {
                        class SecondLevelChild extends LightningElement {
                            renderedCallback() {
                                throw new Error('Child RenderedCallback Throw');
                            }
                        }

                        const firstChildTmpl = compileTemplate(
                            `
                    <template>
                        <x-second-level-child></x-second-level-child>
                    </template>
                `,
                            {
                                modules: {
                                    'x-second-level-child': SecondLevelChild,
                                },
                            }
                        );
                        class FirstLevelChild extends LightningElement {
                            render() {
                                return firstChildTmpl;
                            }
                        }

                        const Boundary = createBoundaryComponent({
                            name: 'x-first-level-child',
                            ctor: FirstLevelChild,
                        });

                        const elm = createElement('x-boundary', { is: Boundary });
                        document.body.appendChild(elm);

                        expect(elm.querySelector('x-second-level-child')).toBeNull();
                        expect(elm.querySelector('x-first-level-child')).toBeNull();
                    });
            }),
            describe('connectedCallback', () => {
                it('should call errorCallback when boundary child throws inside connectedCallback', () => {
                    class BoundaryChild extends LightningElement {
                        connectedCallback() {
                            throw new Error('Child ConnectedCallback Throw');
                        }
                    }

                    const Boundary = createBoundaryComponent({
                        name: 'x-child',
                        ctor: BoundaryChild,
                    });

                    const boundaryElm = createElement('x-boundary', { is: Boundary });
                    document.body.appendChild(boundaryElm);

                    expect(boundaryElm.getError()).toBe('Child ConnectedCallback Throw');
                }),
                    it('should throw an error when error boundary throws inside connectedCallback', () => {
                        class Boundary extends LightningElement {
                            getError() {
                                return this.error;
                            }
                            errorCallback(error) {
                                this.error = error.message;
                            }
                            connectedCallback() {
                                throw new Error('Boundary ConnectedCallback Throw');
                            }
                        }
                        Boundary.publicMethods = ['getError'];
                        Boundary.track = { error: 1 };

                        const boundaryElm = createElement('x-boundary', { is: Boundary });

                        expect(() => {
                            document.body.appendChild(boundaryElm);
                        }).toThrow();
                    }),
                    it('should not affect error boundary siblings when boundary child throws inside connectedCallback', () => {
                        class BoundaryChild extends LightningElement {
                            connectedCallback() {
                                throw new Error('Child ConnectedCallback Throw');
                            }
                        }

                        class BoundarySibling extends LightningElement {}

                        const Boundary = createBoundaryComponent({
                            name: 'x-child',
                            ctor: BoundaryChild,
                        });

                        const html = compileTemplate(
                            `
                    <template>
                        <x-boundary></x-boundary>
                        <x-boundary-sibling></x-boundary-sibling>
                    </template>
                `,
                            {
                                modules: {
                                    'x-boundary': Boundary,
                                    'x-boundary-sibling': BoundarySibling,
                                },
                            }
                        );
                        class BoundaryHost extends LightningElement {
                            render() {
                                return html;
                            }
                        }
                        const boundaryHostElm = createElement('x-parent', { is: BoundaryHost });
                        document.body.appendChild(boundaryHostElm);

                        expect(
                            boundaryHostElm.shadowRoot.querySelectorAll('x-boundary-sibling').length
                        ).toBe(1);
                    }),
                    it('should unmount boundary child and its subtree if boundary child throws inside connectedCallback', () => {
                        class SecondLevelChild extends LightningElement {
                            connectedCallback() {
                                throw new Error('Child ConnectedCallback Throw');
                            }
                        }

                        const firstChildTmpl = compileTemplate(
                            `
                    <template>
                        <x-second-level-child></x-second-level-child>
                    </template>
                `,
                            {
                                modules: {
                                    'x-second-level-child': SecondLevelChild,
                                },
                            }
                        );
                        class FirstLevelChild extends LightningElement {
                            render() {
                                return firstChildTmpl;
                            }
                        }
                        const Boundary = createBoundaryComponent({
                            name: 'x-first-level-child',
                            ctor: FirstLevelChild,
                        });

                        const elm = createElement('x-boundary', { is: Boundary });
                        document.body.appendChild(elm);

                        expect(elm.querySelector('x-second-level-child')).toBeNull();
                        expect(elm.querySelector('x-first-level-child')).toBeNull();
                    });
            });

        describe('protocol', () => {
            it('should throw if error boundary fails to recover', () => {
                class PreErrorChildContent extends LightningElement {
                    render() {
                        throw new Error('Pre-Failure Child Content Throws in Render');
                    }
                }
                const baseTmpl = compileTemplate(
                    `
                    <template>
                        <pre-error-child-content></pre-error-child-content>
                    </template>
                `,
                    {
                        modules: { 'pre-error-child-content': PreErrorChildContent },
                    }
                );
                class InnerErrorBoundary extends LightningElement {
                    errorCallback() {
                        throw new Error(`Boundary failed to recover`); // propagate error because it has no ways to recover
                    }
                    render() {
                        return baseTmpl;
                    }
                }

                const elm = createElement('inner-error-boundary', { is: InnerErrorBoundary });

                expect(() => {
                    document.body.appendChild(elm);
                }).toThrowError(`Boundary failed to recover`);
            }),
                it('should show alternative view after initial error', () => {
                    class PreErrorChildContent extends LightningElement {
                        render() {
                            throw new Error('Pre-Failure Child Content Throws in Render');
                        }
                    }
                    class PostErrorChildOffender extends LightningElement {
                        render() {
                            return altTmpl;
                        }
                    }

                    const altTmpl = compileTemplate(`
                    <template>
                        <p>recovered</p>
                    </template>
                `);
                    const baseTmpl = compileTemplate(
                        `
                    <template>
                        <pre-error-child-content></pre-error-child-content>
                    </template>
                `,
                        {
                            modules: { 'pre-error-child-content': PreErrorChildContent },
                        }
                    );
                    const recoveryTmpl = compileTemplate(
                        `
                    <template>
                        <post-error-child-content></post-error-child-content>
                    </template>
                `,
                        {
                            modules: { 'post-error-child-content': PostErrorChildOffender },
                        }
                    );
                    class InnerErrorBoundary extends LightningElement {
                        error = null;
                        errorCallback(error) {
                            if (error.message !== this.error) {
                                this.error = error.message;
                            } else {
                                throw error; // propagate errors from fallback view
                            }
                        }
                        render() {
                            return this.error ? recoveryTmpl : baseTmpl;
                        }
                    }
                    InnerErrorBoundary.track = { error: 1 };

                    const elm = createElement('inner-error-boundary', { is: InnerErrorBoundary });
                    document.body.appendChild(elm);
                    Promise.resolve().then(() => {
                        // waiting for the alternative view to kick in
                        const p = elm.shadowRoot
                            .querySelector('post-error-child-content')
                            .shadowRoot.querySelector('p');
                        expect(p).toBeInstanceOf(HTMLElement);
                        expect(p.textContent).toBe(`recovered`);
                    });
                }),
                it('should clean up the content of the failing VM if an error in the renderedCallback occur', () => {
                    class PreErrorChildContent extends LightningElement {
                        render() {
                            return emptyTemplate;
                        }
                        renderedCallback() {
                            throw new Error('Pre-Failure Child Content Throws in renderedCallback');
                        }
                    }
                    const baseTmpl = compileTemplate(
                        `
                    <template>
                        <pre-error-child-content></pre-error-child-content>
                    </template>
                `,
                        {
                            modules: { 'pre-error-child-content': PreErrorChildContent },
                        }
                    );
                    class InnerErrorBoundary extends LightningElement {
                        errorCallback() {
                            // does nothing... which means the offender is just reset
                        }
                        render() {
                            return baseTmpl;
                        }
                    }

                    const HostBoundary = createBoundaryComponent({
                        name: 'inner-error-boundary',
                        ctor: InnerErrorBoundary,
                    });

                    const hostElm = createElement('outer-error-boundary', { is: HostBoundary });
                    document.body.appendChild(hostElm);
                    const preErrorElm = hostElm.shadowRoot
                        .querySelector('inner-error-boundary')
                        .shadowRoot.querySelector('pre-error-child-content');
                    expect(preErrorElm).toBeInstanceOf(HTMLElement);
                    expect(preErrorElm.shadowRoot.querySelectorAll('*')).toHaveLength(0);
                }),
                it('should clean up the content of the failing VM if an error in the connectedCallback occur', () => {
                    class PreErrorChildContent extends LightningElement {
                        render() {
                            return emptyTemplate;
                        }
                        connectedCallback() {
                            throw new Error(
                                'Pre-Failure Child Content Throws in connectedCallback'
                            );
                        }
                    }
                    const baseTmpl = compileTemplate(
                        `
                    <template>
                        <pre-error-child-content></pre-error-child-content>
                    </template>
                `,
                        {
                            modules: { 'pre-error-child-content': PreErrorChildContent },
                        }
                    );
                    class InnerErrorBoundary extends LightningElement {
                        errorCallback() {
                            // does nothing... which means the offender is just reset
                        }
                        render() {
                            return baseTmpl;
                        }
                    }

                    const HostBoundary = createBoundaryComponent({
                        name: 'inner-error-boundary',
                        ctor: InnerErrorBoundary,
                    });

                    const hostElm = createElement('outer-error-boundary', { is: HostBoundary });
                    document.body.appendChild(hostElm);
                    const preErrorElm = hostElm.shadowRoot
                        .querySelector('inner-error-boundary')
                        .shadowRoot.querySelector('pre-error-child-content');
                    expect(preErrorElm).toBeInstanceOf(HTMLElement);
                    expect(preErrorElm.shadowRoot.querySelectorAll('*')).toHaveLength(0);
                }),
                it('should clean up content of the failing vm if an error in an event handler occur', () => {
                    class PreErrorChildContent extends LightningElement {
                        render() {
                            return buttonTmpl;
                        }
                        handleClick() {
                            throw new Error('Pre-Failure Child Content Throws in handler');
                        }
                        renderedCallback() {
                            // simulating that the click happens at some point in the future, just
                            // to make sure that the error is not because of the renderedCallback protection
                            return Promise.resolve().then(() => {
                                this.template.querySelector('a').click();
                            });
                        }
                    }
                    const buttonTmpl = compileTemplate(`
                    <template>
                        <a href="#" onclick={handleClick}>click here</a>
                    </template>
                `);
                    const baseTmpl = compileTemplate(
                        `
                    <template>
                        <pre-error-child-content></pre-error-child-content>
                    </template>
                `,
                        {
                            modules: { 'pre-error-child-content': PreErrorChildContent },
                        }
                    );
                    class InnerErrorBoundary extends LightningElement {
                        errorCallback() {
                            // does nothing... which means the offender is just reset
                        }
                        render() {
                            return baseTmpl;
                        }
                    }

                    const HostBoundary = createBoundaryComponent({
                        name: 'inner-error-boundary',
                        ctor: InnerErrorBoundary,
                    });

                    const hostElm = createElement('outer-error-boundary', { is: HostBoundary });
                    document.body.appendChild(hostElm);
                    // the inner boundary should be getting this because it is the inner component the one providing an invalid handler
                    const preErrorElm = hostElm.shadowRoot
                        .querySelector('inner-error-boundary')
                        .shadowRoot.querySelector('pre-error-child-content');
                    expect(preErrorElm).toBeInstanceOf(HTMLElement);
                    return Promise.resolve().then(() => {
                        // waiting for the next tick to validate that the state is still the same...
                        expect(preErrorElm).toBeInstanceOf(HTMLElement);
                        expect(preErrorElm.shadowRoot.querySelectorAll('*')).toHaveLength(0);
                    });
                }),
                it('should clean up the content of the inner error boundary if an error in a setter occur', () => {
                    class PreErrorChildContent extends LightningElement {
                        render() {
                            return emptyTemplate;
                        }
                        set foo(v) {
                            throw new Error('Pre-Failure Child Content Throws in setter');
                        }
                        get foo() {
                            return null;
                        }
                    }
                    PreErrorChildContent.publicProps = {
                        foo: {
                            config: 1,
                        },
                    };
                    const baseTmpl = compileTemplate(
                        `
                    <template>
                        <pre-error-child-content foo="1"></pre-error-child-content>
                    </template>
                `,
                        {
                            modules: { 'pre-error-child-content': PreErrorChildContent },
                        }
                    );
                    class InnerErrorBoundary extends LightningElement {
                        errorCallback() {
                            // does nothing... which means the offender is just reset
                        }
                        render() {
                            return baseTmpl;
                        }
                    }

                    const HostBoundary = createBoundaryComponent({
                        name: 'inner-error-boundary',
                        ctor: InnerErrorBoundary,
                    });

                    const hostElm = createElement('outer-error-boundary', { is: HostBoundary });
                    document.body.appendChild(hostElm);
                    // the outer boundary should be getting this because it is the inner boundary the one providing an invalid data
                    expect(
                        hostElm.shadowRoot
                            .querySelector('inner-error-boundary')
                            .shadowRoot.querySelectorAll('*')
                    ).toHaveLength(0);
                }),
                it('should clean up the content of the inner error boundary if an error in a constructor occur', () => {
                    class PreErrorChildContent extends LightningElement {
                        constructor() {
                            super();
                            throw new Error('Pre-Failure Child Content Throws in C');
                        }
                    }
                    const baseTmpl = compileTemplate(
                        `
                    <template>
                        <p>before</p>
                        <pre-error-child-content></pre-error-child-content>
                        <p>after</p>
                    </template>
                `,
                        {
                            modules: { 'pre-error-child-content': PreErrorChildContent },
                        }
                    );
                    class InnerErrorBoundary extends LightningElement {
                        errorCallback() {
                            // does nothing... which means the offender is just reset
                        }
                        render() {
                            return baseTmpl;
                        }
                    }

                    const HostBoundary = createBoundaryComponent({
                        name: 'inner-error-boundary',
                        ctor: InnerErrorBoundary,
                    });

                    const hostElm = createElement('outer-error-boundary', { is: HostBoundary });
                    document.body.appendChild(hostElm);

                    // the outer boundary should be getting this because it is the inner boundary the one invoking the faulty constructor
                    expect(
                        hostElm.shadowRoot
                            .querySelector('inner-error-boundary')
                            .shadowRoot.querySelectorAll('*')
                    ).toHaveLength(0);
                });
        });
    });
});
