import { ClassList } from "../class-list";
import assert from 'power-assert';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';
import { createElement } from '../upgrade';

describe('class-list', () => {
    describe('#constructor()', () => {

        it('should throw for invalid vm reference', () => {
            assert.throws(() => new ClassList(), 'prevent creation of such objects in user-land');
        });

    });

    describe('integration', () => {

        it('should support outer className', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should support outer classMap', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            vnode = api.c('x-foo', def, { classMap: { foo: 1 } });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should combine inner classes first and then data.className', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'bar  baz' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo bar baz');
        });

        it('should not allow deleting outer classes from within', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.remove('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should dedupe all classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo   foo' });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should combine outer classMap and inner classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { classMap: { bar: 1 } });
            patch(elm, vnode);
            assert.equal(elm.className, 'foo bar');
        });

        it('should support toggle', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    this.classList.toggle('foo');
                    this.classList.toggle('bar');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.equal(elm.className, 'bar');
        });

        it('should support toggle with force', () => {
            let vnode;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.toggle('foo', true);
                    this.classList.toggle('bar', false);
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.equal(elm.className, 'foo');
        });

        it('should support contains', () => {
            let vnode, a, b;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    a = this.classList.contains('foo');
                    b = this.classList.contains('bar');
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual(true, a);
            assert.strictEqual(false, b);
        });

        it('should support item', () => {
            let vnode, a, b;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    a = this.classList.item(0);
                    b = this.classList.item(1);
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual('foo', a);
            assert.strictEqual(null, b);
        });

        // FLAPPER TODO: Fix it
        it('should update on the next tick when dirty', () => {
            class MyComponent extends Element {
                state = { x: 1 };
                constructor() {
                    super();
                    this.classList.add('foo');
                }
                addAnotherClass() {
                    this.classList.add('bar');
                }
                addOtherClass() {
                    this.classList.add('baz');
                }
                render() {
                    this.state.x;
                }
            }
            MyComponent.publicProps = { x: true };
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { props: { x: 1 } });
            patch(elm, vnode);
            assert.strictEqual('foo', elm.className);
            vnode.vm.component.addAnotherClass(); // add when not dirty
            vnode.vm.component.state.x = 2; // dirty trigger
            vnode.vm.component.addOtherClass(); // adding after dirty
            assert.strictEqual(true, vnode.vm.isDirty, 'should be dirty');
            return Promise.resolve().then(() => {
                assert.strictEqual('foo bar baz', elm.className);
            });
        });

        it('should support adding new values to classList via attributeChangedCallback', ()=> {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('classFromConstructor');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.add('classFromAttibuteChangedCb');
                }
            }

            def.observedAttributes = ['title'];
            const elm = createElement('x-foo', { is: def })
            elm.setAttribute('title', 'title');
            expect(elm.className).toBe('classFromConstructor classFromAttibuteChangedCb');
        })

        it('should support removing values from classList via attributeChangedCallback', ()=> {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('theOnlyClassThatShouldRemain');
                    this.classList.add('classToRemoveDuringAttributeChangedCb');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.remove('classToRemoveDuringAttributeChangedCb');
                }
            }

            def.observedAttributes = ['title'];
            const elm = createElement('x-foo', { is: def });
            elm.setAttribute('title', 'title');
            expect(elm.className).toBe('theOnlyClassThatShouldRemain');
        })

        it('should support adding new values to classList via connectedCallback', ()=> {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('classFromConstructor');
                }

                connectedCallback() {
                    this.classList.add('classFromConnectedCallback');
                }
            }

            const elm = createElement('x-foo', { is: def });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => { expect(elm.className).toBe('classFromConstructor classFromConnectedCallback');})

        })

        it('should support removing values from classList via connectedCallback', ()=> {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('theOnlyClassThatShouldRemain');
                    this.classList.add('classToRemoveDuringConnectedCb');
                }

                connectedCallback() {
                    this.classList.remove('classToRemoveDuringConnectedCb');
                }
            }

            const elm = createElement('x-foo', { is: def });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => { expect(elm.className).toBe('theOnlyClassThatShouldRemain');})
        })

        it('should support adding new values to classList via both attributeChangedCallback and classFromAttibuteChangedCb', ()=> {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('classFromConstructor');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.add('classFromAttibuteChangedCb');
                }

                connectedCallback() {
                    this.classList.add('classFromConnectedCallback');
                }
            }

            def.observedAttributes = ['title'];
            const elm = createElement('x-foo', { is: def });
            elm.setAttribute('title', 'title');
            document.body.appendChild(elm);

            return Promise.resolve().then(() => { expect(elm.className).toBe('classFromConstructor classFromAttibuteChangedCb classFromConnectedCallback');})
        })

        it('should support removing values from classList via both attributeChangedCallback and classFromAttibuteChangedCb', ()=> {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('theOnlyClassThatShouldRemain');
                    this.classList.add('classToRemoveDuringConnectedCb');
                    this.classList.add('classToRemoveDuringAttributeChangedCb');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.remove('classToRemoveDuringAttributeChangedCb');
                }

                connectedCallback() {
                    this.classList.remove('classToRemoveDuringConnectedCb');
                }
            }

            def.observedAttributes = ['title'];
            const elm = createElement('x-foo', { is: def });
            elm.setAttribute('title', 'title');
            document.body.appendChild(elm);

            return Promise.resolve().then(() => { expect(elm.className).toBe('theOnlyClassThatShouldRemain');})
        })

    });

});
