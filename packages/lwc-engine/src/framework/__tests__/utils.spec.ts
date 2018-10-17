import * as target from '../utils';
import { createElement } from './../upgrade';
import { LightningElement } from './../html-element';
import { compileTemplate } from 'test-utils';

describe('utils', () => {
    describe('#isNodeCreatedByLWC', () => {
        it('should return false when element is created externally', () => {
            expect(target.isNodeCreatedByLWC(document.createElement('div'))).toBe(false);
        });

        it('should return false when text node is created externally', () => {
            expect(target.isNodeCreatedByLWC(document.createTextNode('text'))).toBe(false);
        });

        it('should return true when element is created with LWC', () => {
            class Foo extends LightningElement {

            }
            const elm = createElement('x-foo', { is: Foo });
            expect(target.isNodeCreatedByLWC(elm)).toBe(true);
        });

        it('should return true when element is created within LWC template', () => {
            const template = compileTemplate(`
                <template>
                    <div>inside</div>
                </template>
            `);
            class Foo extends LightningElement {
                render() {
                    return template;
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(target.isNodeCreatedByLWC(elm.shadowRoot.querySelector('div'))).toBe(true);
        });
    });

    describe('#addCallbackToNextTick()', () => {

        it('should throw for non-callable values', () => {
            expect(() => target.addCallbackToNextTick(undefined)).toThrow();
            expect(() => target.addCallbackToNextTick("")).toThrow();
            expect(() => target.addCallbackToNextTick(NaN)).toThrow();
            expect(() => target.addCallbackToNextTick({})).toThrow();
            expect(() => target.addCallbackToNextTick(1)).toThrow();
        });

        it('should call callback asyncronously', () => {
            let flag = false;
            target.addCallbackToNextTick(() => {
                flag = true;
            });
            expect(flag).toBe(false);
            return Promise.resolve().then(() => {
                expect(flag).toBe(true);
            });
        });

        it('should call the callback once', () => {
            let counter = 0;
            target.addCallbackToNextTick(() => {
                counter += 1;
            });
            expect(counter).toBe(0);
            return Promise.resolve().then(() => {
                // wait for another tick
                return Promise.resolve().then(() => {
                    expect(counter).toBe(1);
                });
            });
        });

        it('should preserve the order of the callbacks', () => {
            let chars = 'a';
            target.addCallbackToNextTick(() => {
                chars += 'b';
            });
            target.addCallbackToNextTick(() => {
                chars += 'c';
            });
            expect(chars).toBe('a');
            return Promise.resolve().then(() => {
                expect(chars).toBe('abc');
            });
        });

        it('should release the references after ticking', () => {
            let chars = 'a';
            target.addCallbackToNextTick(() => {
                chars += 'b';
            });
            expect(chars).toBe('a');
            return Promise.resolve().then(() => {
                expect(chars).toBe('ab');
                target.addCallbackToNextTick(() => {
                    chars += 'c';
                });
            }).then(() => {
                expect(chars).toBe('abc');
            });
        });

    });

});
