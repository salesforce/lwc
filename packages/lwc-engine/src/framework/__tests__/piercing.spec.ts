import { Element } from "../html-element";
import { pierce } from '../piercing';
import { ViewModelReflection } from "../utils";
import { createElement } from "../upgrade";
import { register } from "./../services";

describe('piercing', function() {
    it('should set property on pierced object successfully', function() {
        function html($api) {
            return [$api.h('div', {
                key: 0,
            }, [])];
        }
        class MyComponent extends Element  {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const replica = pierce(elm);
        expect(() => {
            replica.style.position = 'absolute';
            expect(elm.style.position).toBe('absolute');
        }).not.toThrow();

    });

    it('should delete property on pierced object successfully', function() {
        function html($api) {
            return [$api.h('div', {
                key: 0,
            }, [])];
        }
        class MyComponent extends Element  {
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: MyComponent });
        document.body.appendChild(elm);
        const piercedObject = {
            deleteMe: true
        };
        const replica = pierce(piercedObject);
        expect(() => {
            delete replica.deleteMe;
        }).not.toThrow();
    });

    it('should pierce dispatch event', function() {
        let callCount = 0;
        register({
            piercing: (target, key, value, callback) => {
                if (value === EventTarget.prototype.dispatchEvent) {
                    callCount += 1;
                }
            }
        });
        class Foo extends Element {
            connectedCallback() {
                const event = new CustomEvent('badevent', {
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
            }
        }
        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        expect(callCount).toBe(1);
    });
    it('should use custom function pierced for dispatch event', function() {
        let event;
        let received;
        let piercedThis;
        let count = 0;
        const pierced = function(evt) {
            piercedThis = this;
            received = evt;
            count += 1;
        };
        register({
            piercing: (target, key, value, callback) => {
                if (value === EventTarget.prototype.dispatchEvent) {
                    callback(pierced);
                }
            }
        });
        class Foo extends Element {
            connectedCallback() {
                event = new CustomEvent('secure', {
                    composed: true,
                    bubbles: true
                });
                this.dispatchEvent(event);
            }
        }
        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);
        expect(count).toBe(1);
        expect(piercedThis).toBe(elm);
        expect(received).toBe(event);
    });
});
