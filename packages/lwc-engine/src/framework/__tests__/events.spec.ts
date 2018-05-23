import { Element } from "../html-element";
import { createElement } from "./../upgrade";
import { ViewModelReflection } from "../def";
import { unwrap } from "../membrane";

describe('Composed events', () => {
    it('should be able to consume events from within template', () => {
        let count = 0;
        class Child extends Element {
            triggerFoo() {
                this.dispatchEvent(new CustomEvent('foo', {}));
            }
        }
        Child.publicMethods = ['triggerFoo'];

        class ComposedEvents extends Element {
            triggerChildFoo() {
                this.template.querySelector('x-custom-event-child').triggerFoo();
            }
            handleFoo() {
                count += 1;
            }
            render() {
                return ($api, $cmp) => {
                    return [
                        $api.c('x-custom-event-child', Child, {
                            on: {
                                foo: $api.b($cmp.handleFoo),
                            },
                            key: 0,
                        }),
                    ];
                }
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
        expect(result[0]).toBe(undefined); // context must be the component
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
        const clickSpy = jest.fn();
        class MyComponent extends Element {
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

    it('should call event handler with undefined context', () => {
        expect.assertions(1);
        let clickSpy;
        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', function () {
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
        let clickSpy = jest.fn();
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }
        class MyComponent extends Element {
            connectedCallback() {
                const cmp = this;
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
        let clickSpy;
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }

        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', function () {
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
        let clickSpy;
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }

        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', function (evt) {
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
        let clickSpy;
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }

        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', function (evt) {
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
        let clickSpy;
        function html($api) {
            return [$api.h('div', { key: 0 }, [])];
        }

        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', (evt) => {
                    const div = this.template.querySelector('div');
                    div.dispatchEvent(new CustomEvent('foo', { bubbles: true, composed: true }));
                });

                this.template.addEventListener('foo', (evt) => {
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
        function childHTML ($api, $cmp, $slotset) {
            return $slotset.x;
        }

        childHTML.slots = ['x'];
        class Child extends Element {
            render() {
                return childHTML;
            }
        }

        function html($api, $cmp, $slotset) {
            return [$api.c('x-slotted-event-target-child', Child, {
                slotset: {
                    x: [
                        $api.h('div', {
                            on: {
                                click: $api.b($cmp.handleClick),
                            },
                            key: 0,
                        }, [])
                    ]
                }
            })]
        }

        class SlottedEventTarget extends Element {
            handleClick(evt) {
                expect(evt.target.tagName.toLowerCase()).toBe('div');
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return html;
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
        let clickSpy;
        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', (evt) => {
                    this.dispatchEvent(new CustomEvent('foo'));
                });
                this.addEventListener('foo', (evt) => {
                    expect(evt.target).toBe(elm);
                });
            }
        }

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.click();
    });
});

describe('Shadow Root events', () => {
    it('should call event handler with correct target', () => {
        expect.assertions(1);
        let clickSpy;
        class MyComponent extends Element {
            connectedCallback() {
                this.template.addEventListener('click', (evt) => {
                    expect(evt.target).toBe(this.template.querySelector('div'));
                });
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
    });

    it('should call event handler with undefined context', () => {
        expect.assertions(1);
        let clickSpy;
        class MyComponent extends Element {
            connectedCallback() {
                this.template.addEventListener('click', function () {
                    expect(this).toBe(undefined);
                });
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
            }
        }
        MyComponent.publicMethods = ['clickDiv'];

        const elm = createElement('x-add-event-listener', { is: MyComponent });
        document.body.appendChild(elm);
        elm.clickDiv();
    });

    it('should call template event handlers before component event handlers', () => {
        const calls = [];
        class MyComponent extends Element {
            connectedCallback() {
                this.addEventListener('click', () => calls.push('component'));
                this.template.addEventListener('click', () => calls.push('template'));
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
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
        let childTemplate;
        class MyChild extends Element {
            constructor() {
                super();
                childTemplate = this.template;
            }

            clickDiv() {
                this.template.querySelector('div').click();
            }

            render() {
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
            }
        }

        MyChild.publicMethods = ['clickDiv'];

        function html($api, $cmp) {
            return [$api.c('correct-nested-root-event-target-child', MyChild, {
                on: {
                    click: $api.b($cmp.handleClick)
                }
            })];
        }

        class MyComponent extends Element {
            handleClick(evt) {
                expect(evt.target.tagName.toLowerCase()).toBe('correct-nested-root-event-target-child');
                expect(evt.target).toBe(this.template.querySelector('correct-nested-root-event-target-child'));
            }

            clickChildDiv() {
                this.template.querySelector('correct-nested-root-event-target-child').clickDiv();
            }

            render() {
                return html;
            }
        }

        MyComponent.publicMethods = ['clickChildDiv'];

        const elm = createElement('correct-nested-root-event-target-parent', { is: MyComponent });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            elm.clickChildDiv();
        });
    });

    it('should retarget properly event listener attached on non-root components', () => {
        expect.assertions(2);

        class GrandChild extends Element {}

        class Child extends Element {
            connectedCallback() {
                this.template.addEventListener('click', evt => {
                    expect(evt.target.tagName).toBe('X-GRAND-CHILD');
                    expect(evt.currentTarget.tagName).toBe('X-CHILD');
                });
            }

            render() {
                return $api => {
                    return [
                        $api.c('x-grand-child', GrandChild, {})
                    ];
                };
            }
        }

        class Root extends Element {
            render() {
                return $api => {
                    return [
                        $api.c('x-child', Child, {})
                    ];
                };
            }
        }

        const elm = createElement('x-root', { is: Root });
        document.body.appendChild(elm);

        HTMLElement.prototype.querySelector.call(elm, 'x-grand-child').click();
    });
});

describe('Removing events from shadowroot', () => {
    it('should remove event correctly', () => {
        const onClick = jest.fn();
        class MyComponent extends Element {
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
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
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
        class MyComponent extends Element {
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
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
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
    })
});

describe('Removing events from cmp', () => {
    it('should remove event correctly', () => {
        const onClick = jest.fn();
        class MyComponent extends Element {
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
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
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
        class MyComponent extends Element {
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
                return function ($api) {
                    return [$api.h('div', {
                        key: 0,
                    }, [])];
                }
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
    })
});
