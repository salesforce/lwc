import { Element } from "../html-element";
import { createElement } from "./../upgrade";
import { ViewModelReflection } from "../def";
import { unwrap } from "../membrane";

describe('Events on Custom Elements', () => {
    let elm, vnode0;

    beforeEach(function() {
        elm = document.createElement('x-foo');
        vnode0 = elm;
    });

    it('attaches click event handler to custom element from within (wc-compat)', function() {
        const result = [];
        function clicked(ev) { result.push(ev); }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('click', clicked);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.click();
        expect(result).toHaveLength(1);
    });

    it('should dispatch internal listeners first', function() {
        const result = [];
        function clicked1() { result.push(1); }
        function clicked2() { result.push(2); }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('click', clicked1);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.addEventListener('click', clicked2);
        document.body.appendChild(elm);
        elm.click();
        expect(result).toEqual([1, 2]);
    });

    it('should preserve behavior of stopimmidiatepropagation() for internal listeners', function() {
        const result = [];
        function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
        function clicked2() { throw new Error('should never reach this listener'); }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('click', clicked1);
                this.addEventListener('click', clicked2);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.click();
        expect(result).toEqual([1]);
    });

    it('should preserve behavior of stopimmidiatepropagation() for external listeners', function() {
        const result = [];
        function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
        function clicked2() { throw new Error('should never reach this listener'); }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('click', clicked1);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.addEventListener('click', clicked2);
        elm.click();
        expect(result).toEqual([1]);
    });

    it('attaches custom event handler to custom element from within (wc-compat)', function() {
        const result = [];
        function tested(ev) { result.push(ev); }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('test', tested);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.dispatchEvent(new CustomEvent('test', {}));
        expect(result).toHaveLength(1);
    });

    it('should expose component as context to the event handler when defined from within (wc-compat)', function() {
        const result = [];
        function clicked() { result.push(this); result.push.apply(result, arguments); }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('click', clicked);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.click();
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(elm[ViewModelReflection].component); // context must be the component
        expect(result[1]).toBeInstanceOf(Event);
    });

    it('should not expose the host element via event.target', function() {
        let target: any;
        function clicked(e: Event) { target = e.target; }
        class Foo extends Element {
            constructor() {
                super();
                this.addEventListener('click', clicked);
            }
        }
        elm = createElement('x-foo', { is: Foo });
        elm.click();
        expect(target);
        expect(target).toBe(elm[ViewModelReflection].component);
    });

    it('should add event listeners in constructor when created via createElement', function() {
        let count = 0;
        function html($api) {
            return [$api.h('div', { key: 0}, [])];
        }
        class MyComponent extends Element {
            constructor() {
                super();
                this.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html;
            }
            run() {
                const div = this.root.querySelector('div');
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
                this.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html;
            }
            run() {
                const div = this.root.querySelector('div');
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
                this.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html1;
            }
            run() {
                const div = this.root.querySelector('div');
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
                const child = this.root.querySelector('x-child');
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
                this.addEventListener('c-event', function() {
                    count += 1;
                });
            }
            render() {
                return html1;
            }
            run() {
                const div = this.root.querySelector('div');
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
                const child = this.root.querySelector('x-child');
                child.run();
            }
        }
        MyComponent.publicMethods = ['run'];

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        elm.run();
        expect(count).toBe(1);
    });

    it('should have correct current target when added via template', () => {
        expect.assertions(2);
        let childCmp;
        class Child extends Element {
            constructor() {
                super();
                childCmp = this;
            }
        }

        function html($api, $cmp) {
            return [
                $api.c('current-target-child', Child, {
                    on: {
                        click: $api.b($cmp.onclick)
                    }
                })
            ];
        }

        class Parent extends Element {
            onclick(evt) {
                expect(evt.currentTarget).not.toBe(childCmp);
                expect(evt.currentTarget).toBe(this.root.querySelector('current-target-child'));
            }
            clickChild() {
                this.root.querySelector('current-target-child').click();
            }
            render() {
                return html;
            }
        }

        Parent.publicMethods = ['clickChild'];

        const elm = createElement('x-current-target-parent-foo', { is: Parent });
        document.body.appendChild(elm);
        elm.clickChild();
    });

    it('should have correct target when added via template', () => {
        expect.assertions(2);
        let childCmp;
        class Child extends Element {
            constructor() {
                super();
                childCmp = this;
            }
        }

        function html($api, $cmp) {
            return [
                $api.c('current-target-child', Child, {
                    on: {
                        click: $api.b($cmp.onclick)
                    }
                })
            ];
        }

        class Parent extends Element {
            onclick(evt) {
                expect(evt.target).not.toBe(childCmp);
                expect(evt.target).toBe(this.root.querySelector('current-target-child'));
            }
            clickChild() {
                this.root.querySelector('current-target-child').click();
            }
            render() {
                return html;
            }
        }

        Parent.publicMethods = ['clickChild'];

        const elm = createElement('x-current-target-parent-foo', { is: Parent });
        document.body.appendChild(elm);
        elm.clickChild();
    });

    it('should have correct currentTarget when event bubbles', () => {
        expect.assertions(3);
        let childCmp;
        class Child extends Element {
            constructor() {
                super();
                childCmp = this;
            }
        }

        function html($api, $cmp) {
            return [
                $api.h('div', {
                    key: 0,
                }, [
                    $api.c('current-target-child', Child, {})
                ])
            ];
        }

        class Parent extends Element {
            addChildListener() {
                this.root.querySelector('div').addEventListener('click', (evt) => {
                    expect(evt.target).not.toBe(childCmp);
                    expect(unwrap(evt.currentTarget)).toBe(unwrap(this.root.querySelector('div')));
                    expect(unwrap(evt.target)).toBe(unwrap(this.root.querySelector('current-target-child')));
                });
            }
            clickChild() {
                this.root.querySelector('current-target-child').click();
            }
            render() {
                return html;
            }
        }

        Parent.publicMethods = ['addChildListener', 'clickChild'];

        const elm = createElement('x-current-target-parent-foo', { is: Parent });
        document.body.appendChild(elm);
        elm.addChildListener();
        elm.clickChild();
    });

});
