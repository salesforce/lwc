import { compileTemplate } from 'test-utils';
import { createElement } from '../main';
import { LightningElement } from '../html-element';

describe('accessibility', () => {
    describe('focus()', () => {
        describe('for delegatesFocus=true', () => {
            it('should place the focus on the first focusable child', () => {
                const html = compileTemplate(`
                    <template>
                        <input />
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(elm.shadowRoot.querySelector('input'));
                });
            });

            it('should place the focus on the first focusable child even if it is multiple levels down', () => {
                const childHTML = compileTemplate(`
                    <template>
                        <input />
                    </template>
                `);
                class Child extends LightningElement {
                    render() {
                        return childHTML;
                    }
                }
                const parentHTML = compileTemplate(`
                    <template>
                        <x-child></x-child>
                    </template>
                `, {
                    modules: {
                        'x-child': Child
                    }
                });
                class Parent extends LightningElement {
                    render() {
                        return parentHTML;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Parent });
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(elm.shadowRoot.querySelector('x-child'));
                    expect(elm.shadowRoot.activeElement.shadowRoot.activeElement).toBe(elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('input'));
                });
            });

            it('should do nothing if it already have a activeElement selected', () => {
                const html = compileTemplate(`
                    <template>
                        <input class="uno" />
                        <input class="dos" />
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                const dos = elm.shadowRoot.querySelector('input.dos');
                // focussing on the second input before attempting to set the focus on the host
                dos.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    elm.focus();
                    return Promise.resolve(() => {
                        // jsdom has some timing issues with the manual focusing process
                        expect(elm.shadowRoot.activeElement).toBe(dos);
                    });
                });
            });

            it('should blur the activeElement child', () => {
                const html = compileTemplate(`
                    <template>
                        <input />
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                const input = elm.shadowRoot.querySelector('input');
                // focussing on the input before attempting to blur the host
                input.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    elm.blur();
                    return Promise.resolve(() => {
                        // jsdom has some timing issues with the manual focusing process
                        expect(elm.shadowRoot.activeElement).toBe(null);
                    });
                });
            });
            it('should do nothing when tabindex is -1 and the focus is set programmatically', () => {
                const html = compileTemplate(`
                    <template>
                        <input />
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                elm.tabIndex = -1;
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.tabIndex).toBe(-1);
                    expect(elm.shadowRoot.activeElement).toBe(null);
                });
            });
            it('should focus on itself when there is no focusable child', () => {
                const html = compileTemplate(`
                    <template>
                        <div></div>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(null);
                    expect(document.activeElement).toBe(elm);
                });
            });
            it('should return tabIndex=0 as the default value for custom element', () => {
                const html = compileTemplate(`
                    <template>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                expect(elm.tabIndex).toBe(0);
            });
        });

        describe('for delegatesFocus=false', () => {
            it('should not delegate the focus to the first focusable child', () => {
                const html = compileTemplate(`
                    <template>
                        <input />
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    // static delegatesFocus = false;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(null);
                });
            });
            it('should return tabIndex=-1 as the default value for custom element', () => {
                const html = compileTemplate(`
                    <template>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                expect(elm.tabIndex).toBe(-1);
            });
        });
    });

    describe('Aria Properties', () => {
        describe('#role property on components', () => {
            it('should return correct value from getter', () => {
                class MyComponent extends LightningElement {}
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                element.role = 'tab';
                expect(element.role).toBe('tab');
            });

            it('should return correct value when nothing has been set', () => {
                class MyComponent extends LightningElement {}
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                expect(element.role).toBe(null);
            });

            it('should reflect on element when this.internals.role value is set', () => {
                class MyComponent extends LightningElement {
                    connectedCallback() {
                        this.internals.role = 'tab';
                    }
                }
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                expect(element.role).toBe('tab');
            });

            it('should call setter when defined', () => {
                let called = 0;
                class MyComponent extends LightningElement {
                    get role() {}
                    set role(value) {
                        called += 1;
                    }
                }
                MyComponent.publicProps = {
                    role: {
                        config: 3,
                    }
                };
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                element.role = 'tab';
                expect(called).toBe(1);
            });

            it('should not overwrite role attribute when setter does nothing', () => {
                class MyComponent extends LightningElement {
                    connectedCallback() {
                        this.internals.role = 'tab';
                    }
                    get role() {}
                    set role(value) {}
                }
                MyComponent.publicProps = {
                    role: {
                        config: 3,
                    }
                };
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                element.role = 'nottab';
            });
        });

        describe('#ariaChecked', () => {
            it('should return correct value from getter', () => {
                class MyComponent extends LightningElement {}
                const element = createElement('prop-getter-aria-checked', { is: MyComponent });
                element.ariaChecked = 'true';
                expect(element.ariaChecked).toBe('true');
            });

            it('should return correct value when nothing has been set', () => {
                class MyComponent extends LightningElement {}
                const element = createElement('prop-getter-aria-checked', { is: MyComponent });
                expect(element.ariaChecked).toBe(null);
            });

            it('internals reflect default value when aria-checked has been removed', () => {
                class MyComponent extends LightningElement {
                    connectedCallback() {
                        this.internals.ariaChecked = 'true';
                        this.setAttribute('aria-checked', 'false');
                        this.removeAttribute('aria-checked');
                    }
                }
                const element = createElement('prop-get-attribute-null-aria-checked', { is: MyComponent });
                document.body.appendChild(element);
                expect(element.ariaChecked).toBe('true');
            });

            it('external getAttribute reflect default value when aria-checked has been removed', () => {
                class MyComponent extends LightningElement {
                    connectedCallback() {
                        this.internals.ariaChecked = 'true';
                    }
                }
                const element = createElement('prop-get-attribute-null-aria-checked', { is: MyComponent });
                document.body.appendChild(element);
                element.setAttribute('aria-checked', 'false');
                element.removeAttribute('aria-checked');
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
            });
        });
    });
});
