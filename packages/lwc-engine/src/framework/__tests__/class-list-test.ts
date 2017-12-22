import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';
import { createElement } from '../upgrade';

describe('class-list', () => {
    describe('integration', () => {
        it('should support outer className', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            expect(elm.className).toBe('foo');
        });

        it('should support outer classMap', () => {
            let vnode;
            const def = class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            vnode = api.c('x-foo', def, { classMap: { foo: 1 } });
            patch(elm, vnode);
            expect(elm.className).toBe('foo');
        });

        it('should combine data.className first and then inner classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('foo');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'bar  baz' });
            patch(elm, vnode);
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('bar baz foo');
        });

        it('should allow deleting outer classes from within', () => {
            let vnode;
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.remove('foo');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo' });
            patch(elm, vnode);
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('');
        });

        it('should dedupe all classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('foo');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { className: 'foo   foo' });
            patch(elm, vnode);
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('foo');
        });

        it('should combine outer classMap and inner classes', () => {
            let vnode;
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('foo');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, { classMap: { bar: 1 } });
            patch(elm, vnode);
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('bar foo');
        });

        it('should support toggle', () => {
            let vnode;
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('foo');
                    this.classList.toggle('foo');
                    this.classList.toggle('bar');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('bar');
        });

        it('should support toggle with force', () => {
            let vnode;
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.toggle('foo', true);
                    this.classList.toggle('bar', false);
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('foo');
        });

        it('should support contains', () => {
            expect.assertions(2);

            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('foo');

                    expect(this.classList.contains('foo')).toBe(true);
                    expect(this.classList.contains('bar')).toBe(false);
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            elm.initClassNames();
        });

        it('should support item', () => {
            expect.assertions(2);

            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('foo');

                    expect(this.classList.item(0)).toBe('foo');
                    expect(this.classList.item(1)).toBeNull();
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            elm.initClassNames();
        });

        it('should update on the next tick when dirty', () => {
            class MyComponent extends Element {
                state = { x: 1 };
                initClassNames() {
                    this.classList.add('foo');
                }
                addAnotherClass() {
                    this.classList.add('bar');
                }
                addOtherClass() {
                    this.classList.add('baz');
                }
                updateTracked(value) {
                    this.state.x = value;
                }
                render() {
                    this.state.x;
                }
            }
            MyComponent.publicMethods = ['initClassNames', 'updateTracked', 'addAnotherClass', 'addOtherClass'];
            MyComponent.track = { state: 1 }
            MyComponent.publicProps = { x: true };

            const elm = createElement('x-foo', { is: MyComponent });
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('foo');
            elm.addAnotherClass();
            elm.updateTracked(2); // dirty trigger
            elm.addOtherClass();

            return Promise.resolve().then(() => {
                expect(elm.className).toBe('foo bar baz');
            });
        });

        it('should support adding new values to classList via attributeChangedCallback', ()=> {
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('classFromInit');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.add('classFromAttibuteChangedCb');
                }
            }
            def.observedAttributes = ['title'];
            def.publicMethods = ['initClassNames'];
            const elm = createElement('x-foo', { is: def })
            elm.initClassNames();
            elm.setAttribute('title', 'title');
            expect(elm.className).toBe('classFromInit classFromAttibuteChangedCb');
        })

        it('should support removing values from classList via attributeChangedCallback', ()=> {
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('theOnlyClassThatShouldRemain');
                    this.classList.add('classToRemoveDuringAttributeChangedCb');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.remove('classToRemoveDuringAttributeChangedCb');
                }
            }
            def.observedAttributes = ['title'];
            def.publicMethods = ['initClassNames'];
            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            elm.setAttribute('title', 'title');
            expect(elm.className).toBe('theOnlyClassThatShouldRemain');
        })

        it('should support adding new values to classList via connectedCallback', ()=> {
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('classFromInit');
                }

                connectedCallback() {
                    this.classList.add('classFromConnectedCallback');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect(elm.className).toBe('classFromInit classFromConnectedCallback');
            });
        })

        it('should support removing values from classList via connectedCallback', ()=> {
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('theOnlyClassThatShouldRemain');
                    this.classList.add('classToRemoveDuringConnectedCb');
                }

                connectedCallback() {
                    this.classList.remove('classToRemoveDuringConnectedCb');
                }
            }
            def.publicMethods = ['initClassNames'];
            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect(elm.className).toBe('theOnlyClassThatShouldRemain');
            });
        })

        it('should support adding new values to classList via both attributeChangedCallback and classFromAttibuteChangedCb', ()=> {
            const def = class MyComponent extends Element {
                initClassNames() {
                    this.classList.add('classFromInit');
                }

                attributeChangedCallback(attributeName, oldValue, newValue) {
                    this.classList.add('classFromAttibuteChangedCb');
                }

                connectedCallback() {
                    this.classList.add('classFromConnectedCallback');
                }
            }
            def.observedAttributes = ['title'];
            def.publicMethods = ['initClassNames'];
            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            elm.setAttribute('title', 'title');
            document.body.appendChild(elm);

            expect(elm.className).toBe('classFromInit classFromAttibuteChangedCb classFromConnectedCallback');
        })

        it('should support removing values from classList via both attributeChangedCallback and classFromAttibuteChangedCb', ()=> {
            const def = class MyComponent extends Element {
                initClassNames() {
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
            def.publicMethods = ['initClassNames'];
            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            elm.setAttribute('title', 'title');
            document.body.appendChild(elm);

            expect(elm.className).toBe('theOnlyClassThatShouldRemain');
        });
    });
});
