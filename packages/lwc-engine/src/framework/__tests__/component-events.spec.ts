import { Element } from "../html-element";
import { createElement } from "./../upgrade";
import { ViewModelReflection } from "../def";

describe('Events on Custom Elements', () => {
    let elm, vnode0;

    beforeEach(function() {
        elm = document.createElement('x-foo');
        vnode0 = elm;
    });

    it('attaches click event handler to custom element from within (wc-compat)', function() {
        const result = [];
        function clicked(ev) { result.push(ev); }
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        let cmp;
        class Foo extends Element {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked);
            }
            render() {
                return html;
            }
        }
        elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.template.querySelector('div').click();
        expect(result).toHaveLength(1);
    });

    it('should dispatch internal listeners first', function() {
        const result = [];
        function clicked1() { result.push(1); }
        function clicked2() { result.push(2); }
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        let cmp;
        class Foo extends Element {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked1);
            }
            render() {
                return html;
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.addEventListener('click', clicked2);
        document.body.appendChild(elm);
        cmp.root.querySelector('div').click();
        expect(result).toEqual([1, 2]);
    });

    it('should preserve behavior of stopimmidiatepropagation() for internal listeners', function() {
        const result = [];
        function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
        function clicked2() { throw new Error('should never reach this listener'); }
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        let cmp;
        class Foo extends Element {
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
        elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.root.querySelector('div').click();
        expect(result).toEqual([1]);
    });

    it('should preserve behavior of stopimmidiatepropagation() for external listeners', function() {
        const result = [];
        function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
        function clicked2() { throw new Error('should never reach this listener'); }
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        let cmp;
        class Foo extends Element {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked1);
            }
            render() {
                return html;
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.addEventListener('click', clicked2);
        document.body.appendChild(elm);
        cmp.root.querySelector('div').click();
        expect(result).toEqual([1]);
    });

    it('attaches custom event handler to custom element from within (wc-compat)', function() {
        const result = [];
        function tested(ev) { result.push(ev); }
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        let cmp;
        class Foo extends Element {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('test', tested);
            }
            render() {
                return html;
            }
        }
        elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.root.querySelector('div').dispatchEvent(new CustomEvent('test', { bubbles: true }));  // intentionally without composed: true to see if the root captures can that
        expect(result).toHaveLength(1);
    });

    it('should expose template as context to the event handler when defined from within (wc-compat)', function() {
        const result = [];
        function clicked() { result.push(this); result.push.apply(result, arguments); }
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        let cmp;
        class Foo extends Element {
            constructor() {
                super();
                cmp = this;
                this.template.addEventListener('click', clicked);
            }
            render() {
                return html;
            }
        }
        elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        cmp.root.querySelector('div').click();
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(elm[ViewModelReflection].component.root); // context must be the component
        expect(result[1]).toBeInstanceOf(Event);
    });

    it('should add event listeners in constructor when created via createElement', function() {
        let count = 0;
        function html($api) {
            return [$api.h('div', { key: 0}, [])];
        }
        class MyComponent extends Element {
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
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends Element {
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
        function html1($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyChild extends Element {
            connectedCallback() {
                this.template.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html1;
            }
            run() {
                const div = this.template.querySelector('div');
                div.dispatchEvent(new CustomEvent('c-event', { bubbles: true, composed: true }));
            }
        }
        MyChild.publicMethods = ['run'];
        function html2($api) {
            return [$api.c('x-child', MyChild, {})];
        }
        class MyComponent extends Element {
            render() {
                return html2;
            }
            run() {
                const child = this.template.querySelector('x-child');
                child.run();
            }
        }
        MyComponent.publicMethods = ['run'];
        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const div = elm.querySelector('div') as HTMLElement;
        elm.run();
        expect(count).toBe(1);
    });

    it('should add event listeners in constructor when created via render', function() {
        let count = 0;
        function html1($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyChild extends Element {
            constructor() {
                super();
                this.template.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html1;
            }
            run() {
                const div = this.template.querySelector('div');
                div.dispatchEvent(new CustomEvent('c-event', { bubbles: true, composed: true }));
            }
        }
        MyChild.publicMethods = ['run'];
        function html2($api) {
            return [$api.c('x-child', MyChild, {})];
        }
        class MyComponent extends Element {
            render() {
                return html2;
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
        expect.assertions(2);
        let clickSpy;
        class MyComponent extends Element {
            connectedCallback() {
                clickSpy = jest.fn().mockImplementation((evt) => {
                    expect(evt.target).toBe(this);
                });
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
        class MyComponent extends Element {
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

    it('should call event handler with correct context', () => {
        expect.assertions(1);
        let clickSpy;
        class MyComponent extends Element {
            connectedCallback() {
                const cmp = this;
                clickSpy = jest.fn().mockImplementation(function (evt) {
                    expect(this).toBe(cmp);
                });

                this.addEventListener('click', clickSpy);
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
    });

});
