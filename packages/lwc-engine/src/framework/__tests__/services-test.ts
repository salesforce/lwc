import * as target from '../services';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';
import { createElement } from '../upgrade';

function resetServices() {
    Object.keys(target.Services).forEach((name) => {
        delete target.Services[name];
    });
}

describe('services', () => {

    describe('register()', () => {

        beforeEach(function() {
            resetServices();
        });

        it('should throw for invalid service', () => {
            expect(() => target.register()).toThrow();
        });

        it('should support single hooks', () => {
            expect(target.Services.rendered).toBeUndefined();
            target.register({
                rendered: function () {},
            });
            expect(target.Services.rendered).toHaveLength(1);
        });

        it('should support multiple hook', () => {
            expect(target.Services.rendered).toBeUndefined();
            target.register({
                rendered: function () {},
                connected: function () {}
            });
            expect(target.Services.rendered).toHaveLength(1);
            expect(target.Services.connected).toHaveLength(1);
        });

        it('should allow multiple services to register the same hook', () => {
            expect(target.Services.rendered).toBeUndefined();
            target.register({
                rendered: function () {}
            });
            target.register({
                rendered: function () {}
            });
            expect(target.Services.rendered).toHaveLength(2);
        });

    });

    describe('integration', () => {
        it('should invoke all hooks', () => {
            let r = 0, c = 0, d = 0;
            target.register({
                rendered: function () {
                    r++;
                },
                connected: function () {
                    c++;
                },
                disconnected: function () {
                    d++;
                }
            });
            class MyComponent extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            // insertion
            patch(elm, api.c('x-foo', MyComponent, {}));
            // removal
            patch(elm, api.h('div', {}, []));

            return Promise.resolve(() => {
                expect(r).toBe(1);
                expect(c).toBe(1);
                expect(d).toBe(1);
            });
        });

        it('should invoke before component lifecycle hooks', () => {
            let lifecycleLog: string[] = [];
            target.register({
                connected: function() {
                    lifecycleLog.push('service connected callback');
                },
                rendered: function() {
                    lifecycleLog.push('service rendered callback');
                },
                disconnected: function() {
                    lifecycleLog.push('service disconnected callback');
                }
            });
            class MyComponent extends Element {
                connectedCallback() {
                    lifecycleLog.push('component connected callback');
                }

                renderedCallback() {
                    lifecycleLog.push('component rendered callback');
                }

                disconnectedCallback() {
                    lifecycleLog.push('component disconnected callback');
                }

                render() {
                    lifecycleLog.push('component render method');
                    return function tmpl($api, $cmp, $slotset, $ctx) {
                        return [];
                    };
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            document.body.removeChild(elm);

            expect(lifecycleLog).toEqual([
                'service connected callback',
                'component connected callback',
                'component render method',
                'service rendered callback',
                'component rendered callback',
                'service disconnected callback',
                'component disconnected callback'
            ]);
        });
    })

});
