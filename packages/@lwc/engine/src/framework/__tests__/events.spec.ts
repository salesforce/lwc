/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

describe('Composed events', () => {
    it('should be able to consume events from within template', () => {
        let count = 0;

        class Child extends LightningElement {
            triggerFoo() {
                this.dispatchEvent(new CustomEvent('foo'));
            }
        }
        Child.publicMethods = ['triggerFoo'];

        const html = compileTemplate(
            `
            <template>
                <x-custom-event-child onfoo={handleFoo}>
                </x-custom-event-child>
            </template>
        `,
            {
                modules: {
                    'x-custom-event-child': Child,
                },
            }
        );
        class ComposedEvents extends LightningElement {
            triggerChildFoo() {
                this.template.querySelector('x-custom-event-child').triggerFoo();
            }
            handleFoo() {
                count += 1;
            }
            render() {
                return html;
            }
        }
        ComposedEvents.publicMethods = ['triggerChildFoo'];

        const elem = createElement('x-components-events-parent', { is: ComposedEvents });
        document.body.appendChild(elem);
        elem.triggerChildFoo();
        expect(count).toBe(1);
    });
});

describe('Events on Custom Elements', () => {
    it('attaches click event handler to custom element from within (wc-compat)', function() {
        let cmp;
        const result = [];
        function clicked(ev) {
            result.push(ev);
        }

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Foo extends LightningElement {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toHaveLength(1);
    });

    it('should dispatch internal listeners first', function() {
        let cmp;
        const result = [];
        function clicked1() {
            result.push(1);
        }
        function clicked2() {
            result.push(2);
        }

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Foo extends LightningElement {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked1);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        elm.addEventListener('click', clicked2);
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toEqual([1, 2]);
    });

    it('should preserve behavior of stopimmidiatepropagation() for internal listeners', function() {
        let cmp;
        const result = [];
        function clicked1(ev) {
            result.push(1);
            ev.stopImmediatePropagation();
        }
        function clicked2() {
            throw new Error('should never reach this listener');
        }

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Foo extends LightningElement {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked1);
                this.template.addEventListener('click', clicked2);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toEqual([1]);
    });

    it('should preserve behavior of stopimmidiatepropagation() for external listeners', function() {
        let cmp;
        const result = [];
        function clicked1(ev) {
            result.push(1);
            ev.stopImmediatePropagation();
        }
        function clicked2() {
            throw new Error('should never reach this listener');
        }

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Foo extends LightningElement {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked1);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        elm.addEventListener('click', clicked2);
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toEqual([1]);
    });

    it('attaches custom event handler to custom element from within (wc-compat)', function() {
        let cmp;
        const result = [];
        function tested(ev) {
            result.push(ev);
        }

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Foo extends LightningElement {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('test', tested);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').dispatchEvent(new CustomEvent('test', { bubbles: true })); // intentionally without composed: true to see if the root captures can that
        expect(result).toHaveLength(1);
    });

    it('should expose template as context to the event handler when defined from within (wc-compat)', function() {
        let cmp;
        const result = [];
        function clicked() {
            result.push(this);
            result.push.apply(result, arguments);
        }

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Foo extends LightningElement {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(elm.shadowRoot); // context must be the shadow root
        expect(result[1]).toBeInstanceOf(Event);
    });

    it('should not execute native events handlers for events originating on the host', () => {
        const spy = jest.fn();
        const myComponentTmpl = compileTemplate(`
            <template>

            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', spy);
            }
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not execute composed: true events handlers for events originating on the host', () => {
        const spy = jest.fn();
        const myComponentTmpl = compileTemplate(`
            <template>

            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('custom', spy);
            }
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const event = new CustomEvent('custom', {
            bubbles: true,
            composed: true,
        });
        elm.dispatchEvent(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not execute composed: false events handlers for events originating on the host', () => {
        const spy = jest.fn();
        const myComponentTmpl = compileTemplate(`
            <template>

            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('custom', spy);
            }
            render() {
                return myComponentTmpl;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const event = new CustomEvent('custom', {
            bubbles: true,
            composed: false,
        });
        elm.dispatchEvent(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should add event listeners in constructor when created via createElement', function() {
        let count = 0;

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            constructor() {
                super();
                this.template.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html;
            }
            run() {
                const div = this.template.querySelector('div');
                div.dispatchEvent(new CustomEvent('c-event', { bubbles: true, composed: true }));
            }
        }
        MyComponent.publicMethods = ['run'];

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.run();
        expect(count).toBe(1);
    });

    it('should add event listeners in connectedCallback when created via createElement', function() {
        let count = 0;

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html;
            }
            run() {
                const div = this.template.querySelector('div');
                div.dispatchEvent(new CustomEvent('c-event', { bubbles: true, composed: true }));
            }
        }
        MyComponent.publicMethods = ['run'];

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.run();
        expect(count).toBe(1);
    });

    it('should add event listeners in connectedCallback when created via render', function() {
        let count = 0;

        const childTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyChild extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return childTmpl;
            }
            run() {
                const div = this.template.querySelector('div');
                div.dispatchEvent(new CustomEvent('c-event', { bubbles: true, composed: true }));
            }
        }
        MyChild.publicMethods = ['run'];

        const parentTmpl = compileTemplate(
            `
            <template>
                <x-child></x-child>
            </template>
        `,
            {
                modules: { 'x-child': MyChild },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return parentTmpl;
            }
            run() {
                const child = this.template.querySelector('x-child');
                child.run();
            }
        }
        MyComponent.publicMethods = ['run'];

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.run();
        expect(count).toBe(1);
    });

    it('should add event listeners in constructor when created via render', function() {
        let count = 0;

        const childTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyChild extends LightningElement {
            constructor() {
                super();
                this.template.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return childTmpl;
            }
            run() {
                const div = this.template.querySelector('div');
                div.dispatchEvent(new CustomEvent('c-event', { bubbles: true, composed: true }));
            }
        }
        MyChild.publicMethods = ['run'];

        const parentTmpl = compileTemplate(
            `
            <template>
                <x-child></x-child>
            </template>
        `,
            {
                modules: { 'x-child': MyChild },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return parentTmpl;
            }
            run() {
                const child = this.template.querySelector('x-child');
                child.run();
            }
        }
        MyComponent.publicMethods = ['run'];

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.run();
        expect(count).toBe(1);
    });

    it('should add event listeners on component instance', () => {
        const clickSpy = jest.fn();

        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', clickSpy);
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove event listeners from component instance', () => {
        const clickSpy = jest.fn();

        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', clickSpy);
            }

            removeClickListener() {
                this.removeEventListener('click', clickSpy);
            }
        }
        MyComponent.publicMethods = ['removeClickListener'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
        elm.removeClickListener();
        elm.click();
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('should call event handler with undefined context', () => {
        expect.assertions(1);

        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', function() {
                    expect(this).toBe(undefined);
                });
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
    });

    it('it should call event handler correctly when events bubble from template', () => {
        expect.assertions(1);
        const clickSpy = jest.fn();

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', clickSpy);
            }

            clickDiv() {
                const div = this.template.querySelector('div');
                div.click();
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should call event handler with correct context when events bubble', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', function() {
                    expect(this).toBe(undefined);
                });
            }

            clickDiv() {
                const div = this.template.querySelector('div');
                div.click();
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
    });

    it('should call event handler with correct event target', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', function(evt) {
                    expect(evt.target).toBe(elm);
                });
            }

            render() {
                return html;
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
    });

    it('should call event handler with correct event target when event bubble', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', function(evt) {
                    expect(evt.target).toBe(elm);
                });
            }

            clickDiv() {
                const div = this.template.querySelector('div');
                div.click();
            }

            render() {
                return html;
            }
        }

        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
    });

    it('should have correct target when shadow root gets event dispatched from component event', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', () => {
                    const div = this.template.querySelector('div');
                    div.dispatchEvent(new CustomEvent('foo', { bubbles: true, composed: true }));
                });

                this.template.addEventListener('foo', evt => {
                    expect(evt.target).toBe(this.template.querySelector('div'));
                });
            }

            render() {
                return html;
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
    });
});

describe('Slotted element events', () => {
    it('should have correct target when event comes from slotted element', () => {
        expect.assertions(1);

        const childTmpl = compileTemplate(`
            <template>
                <slot name="x"></slot>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <x-slotted-event-target-child>
                    <div slot="x" onclick={handleClick}></div>
                </x-slotted-event-target-child>
            </template>
        `,
            {
                modules: { 'x-slotted-event-target-child': Child },
            }
        );
        class SlottedEventTarget extends LightningElement {
            handleClick(evt) {
                expect(evt.target.tagName.toLowerCase()).toBe('div');
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return parentTmpl;
            }
        }
        SlottedEventTarget.publicMethods = ['clickDiv'];

        const elm = createElement('slotted-event-target', { is: SlottedEventTarget });
        document.body.appendChild(elm);
        elm.clickDiv();
    });
});

describe('Component events', () => {
    it('should have correct target when component event gets dispatched within event handler', () => {
        expect.assertions(1);

        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', () => {
                    this.dispatchEvent(new CustomEvent('foo'));
                });
                this.addEventListener('foo', evt => {
                    expect(evt.target).toBe(elm);
                });
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
    });

    it('should throw with a user friendly message when no event handler is found', () => {
        const html = compileTemplate(`
            <template>
                <button onclick={unknownHandler}></button>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const element = createElement('x-missing-event-listener', { is: MyComponent });
        document.body.appendChild(element);

        // expect().toThrowError() is not enough in the case where an Error is thrown during event
        // dispatching. In the case of event, the only way to catch the error to add an event listener
        // at the page level.
        const errorHandler = jest.fn(evt => evt.preventDefault());
        window.addEventListener('error', errorHandler);

        const buttonEl = element.shadowRoot.querySelector('button');
        buttonEl.click();

        expect(errorHandler.mock.calls).toHaveLength(1);
        expect(errorHandler.mock.calls[0][0].message).toMatch(
            /Invalid event handler for event 'click'/
        );

        window.removeEventListener('error', errorHandler);
    });
});

describe('Shadow Root events', () => {
    it('should call event handler with correct target', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', evt => {
                    expect(evt.target).toBe(this.template.querySelector('div'));
                });
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
    });

    it('should call event handler with correct context', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                const template = this.template;
                this.template.addEventListener('click', function() {
                    expect(this).toBe(template);
                });
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
    });

    it('should call template event handlers before component event handlers', () => {
        const calls = [];

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', () => calls.push('component'));
                this.template.addEventListener('click', () => calls.push('template'));
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
        expect(calls).toEqual(['template', 'component']);
    });

    it('should have correct event target when event originates from child component shadow dom', () => {
        expect.assertions(2);

        const childTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyChild extends LightningElement {
            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return childTmpl;
            }
        }
        MyChild.publicMethods = ['clickDiv'];

        const parentTmpl = compileTemplate(
            `
            <template>
                <correct-nested-root-event-target-child onclick={handleClick}>
                </correct-nested-root-event-target-child>
            </template>
        `,
            {
                modules: { 'correct-nested-root-event-target-child': MyChild },
            }
        );
        class MyComponent extends LightningElement {
            handleClick(evt) {
                expect(evt.target.tagName.toLowerCase()).toBe(
                    'correct-nested-root-event-target-child'
                );
                expect(evt.target).toBe(
                    this.template.querySelector('correct-nested-root-event-target-child')
                );
            }

            clickChildDiv() {
                this.template.querySelector('correct-nested-root-event-target-child').clickDiv();
            }

            render() {
                return parentTmpl;
            }
        }
        MyComponent.publicMethods = ['clickChildDiv'];

        const elm = createElement('correct-nested-root-event-target-parent', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickChildDiv();
    });

    it('should retarget properly event listener attached on non-root components', () => {
        expect.assertions(2);

        class GrandChild extends LightningElement {}

        const childTmpl = compileTemplate(
            `
            <template>
                <x-grand-child></x-grand-child>
            </template>
        `,
            {
                modules: { 'x-grand-child': GrandChild },
            }
        );
        class Child extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', evt => {
                    expect(evt.target.tagName).toBe('X-GRAND-CHILD');
                    expect(evt.currentTarget).toBe(this.template);
                });
            }

            render() {
                return childTmpl;
            }
        }

        const rootTmpl = compileTemplate(
            `
            <template>
                <x-child></x-child>
            </template>
        `,
            {
                modules: { 'x-child': Child },
            }
        );
        class Root extends LightningElement {
            render() {
                return rootTmpl;
            }
        }

        const elm = createElement('x-root', { is: Root });
        document.body.appendChild(elm);

        elm.shadowRoot
            .querySelector('x-child')
            .shadowRoot.querySelector('x-grand-child')
            .click();
    });

    it('should have correct target when native event gets dispatched from within shadow root event handler', () => {
        expect.assertions(1);

        const html = compileTemplate(`
            <template>
                <div onclick={onDivClick}></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            constructor() {
                super();
                this.template.addEventListener('foo', () => {
                    const div = this.template.querySelector('div');
                    div.click();
                });
            }

            onDivClick(evt) {
                expect(evt.target).toBe(this.template.querySelector('div'));
            }

            render() {
                return html;
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.shadowRoot
            .querySelector('div')
            .dispatchEvent(new CustomEvent('foo', { bubbles: true, composed: true }));
    });
});

describe('Removing events from shadowroot', () => {
    it('should remove event correctly', () => {
        const onClick = jest.fn();

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', onClick);
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            removeHandler() {
                this.template.removeEventListener('click', onClick);
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv', 'removeHandler'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
        elm.removeHandler();
        elm.clickDiv();
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should only remove shadow root events', () => {
        const onClick = jest.fn();
        const cmpClick = jest.fn();

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', cmpClick);
                this.template.addEventListener('click', onClick);
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            removeHandler() {
                this.template.removeEventListener('click', onClick);
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv', 'removeHandler'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
        elm.removeHandler();
        elm.clickDiv();
        expect(cmpClick).toHaveBeenCalledTimes(2);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

describe('Removing events from cmp', () => {
    it('should remove event correctly', () => {
        const onClick = jest.fn();

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', onClick);
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            removeHandler() {
                this.removeEventListener('click', onClick);
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv', 'removeHandler'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
        elm.removeHandler();
        elm.clickDiv();
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should only remove shadow root events', () => {
        const onClick = jest.fn();
        const cmpClick = jest.fn();

        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            connectedCallback() {
                this.addEventListener('click', cmpClick);
                this.template.addEventListener('click', onClick);
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            removeHandler() {
                this.removeEventListener('click', cmpClick);
            }

            render() {
                return html;
            }
        }
        MyComponent.publicMethods = ['clickDiv', 'removeHandler'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
        elm.removeHandler();
        elm.clickDiv();
        expect(cmpClick).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledTimes(2);
    });
});
