import * as target from '../services';
import { Element } from "../html-element";
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
                rendered() {},
            });
            expect(target.Services.rendered).toHaveLength(1);
        });

        it('should support multiple hook', () => {
            expect(target.Services.rendered).toBeUndefined();
            target.register({
                rendered() {},
                connected() {}
            });
            expect(target.Services.rendered).toHaveLength(1);
            expect(target.Services.connected).toHaveLength(1);
        });

        it('should allow multiple services to register the same hook', () => {
            expect(target.Services.rendered).toBeUndefined();
            target.register({
                rendered() {}
            });
            target.register({
                rendered() {}
            });
            expect(target.Services.rendered).toHaveLength(2);
        });

    });

    describe('integration', () => {
        it('should invoke all hooks', () => {
            let r = 0, c = 0, d = 0;
            target.register({
                rendered() {
                    r++;
                },
                connected() {
                    c++;
                },
                disconnected() {
                    d++;
                }
            });
            class MyComponent extends Element {}
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            return Promise.resolve(() => {
                expect(r).toBe(1);
                expect(c).toBe(1);
                expect(d).toBe(1);
            });
        });

        it('should invoke before component lifecycle hooks', () => {
            const lifecycleLog: string[] = [];
            target.register({
                connected() {
                    lifecycleLog.push('service connected callback');
                },
                rendered() {
                    lifecycleLog.push('service rendered callback');
                },
                disconnected() {
                    lifecycleLog.push('service disconnected callback');
                }
            });
            function html() {
                return [];
            }
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
                    return html;
                }
            }

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
    });

});
