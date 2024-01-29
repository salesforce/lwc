/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    createElement,
    LightningElement,
    registerComponent,
    registerTemplate,
    registerDecorators,
} from '@lwc/engine-dom';
import { LOWEST_API_VERSION } from '@lwc/shared';

// it needs to be imported from the window, otherwise the checks for associated vms is done against "@lwc/engine-core"
const LightningElementFormatter = (globalThis as any)['devtoolsFormatters'].find((f: any) => {
    return f.name === 'LightningElementFormatter';
});

class WireAdapter {
    dc: any;

    constructor(dc: any) {
        this.dc = dc;
    }

    update(c: any) {
        this.dc(c);
    }
    connect() {}
    disconnect() {}
}

describe('Lightning Element formatter', () => {
    const { header } = LightningElementFormatter;

    it('should not contain body', () => {
        expect(LightningElementFormatter.hasBody()).toBe(false);
    });

    it('should not format objects without VM', () => {
        expect(header({})).toBeNull();
        expect(header(document.createElement('div'))).toBeNull();
        expect(header(document.createElement('x-foo'))).toBeNull();

        class WordCount extends HTMLParagraphElement {
            constructor() {
                super();
            }
        }
        customElements.define('word-count', WordCount, { extends: 'p' });
        expect(header(document.createElement('word-count'))).toBeNull();
    });

    it('should format LWC custom elements', () => {
        let componentInstance: LightningElement;
        const Foo = registerComponent(
            class Foo extends LightningElement {
                constructor() {
                    super();
                    componentInstance = this;
                }
            },
            { tmpl: registerTemplate(() => []), sel: 'x-foo', apiVersion: LOWEST_API_VERSION }
        );
        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        const result = header(elm);
        expect(result).toHaveLength(4);
        expect(result[0]).toBe('div');

        const obj = result[2];
        expect(obj[0]).toBe('object');
        expect(obj[1].object).toBe(elm);
        expect(obj[1].config.skip).toBe(true);

        const cmp = result[3][3];
        expect(obj[0]).toBe('object');
        expect(cmp[1].object).toBe(componentInstance!);
    });

    it('should not format component instances when there is no debug information', () => {
        let componentInstance: LightningElement;
        const Foo = registerComponent(
            class Foo extends LightningElement {
                constructor() {
                    super();
                    componentInstance = this;
                }
            },
            { tmpl: registerTemplate(() => []), sel: 'x-foo', apiVersion: LOWEST_API_VERSION }
        );
        const elm = createElement('x-foo', { is: Foo });
        document.body.appendChild(elm);

        expect(header(componentInstance!)).toBe(null);
    });

    it('should format component instances when there is debug information', () => {
        // atm only wire information is exposed
        let componentInstance: LightningElement;

        const Component = registerComponent(
            class Foo extends LightningElement {
                foo: any;
                constructor() {
                    super();
                    this.foo = void 0;
                    componentInstance = this;
                }
            },
            { tmpl: registerTemplate(() => []), sel: 'x-foo', apiVersion: LOWEST_API_VERSION }
        );

        registerDecorators(Component, {
            wire: {
                foo: {
                    adapter: WireAdapter,
                    config: function () {
                        return {};
                    },
                },
            },
        });

        const elm = createElement('x-foo', { is: Component });
        document.body.appendChild(elm);

        const result = header(componentInstance!);

        expect(result).toHaveLength(4);
        const obj = result[2];
        expect(obj[0]).toBe('object');
        expect(obj[1].object).toBe(componentInstance!);
        expect(obj[1].config.skip).toBe(true);

        const debugInfo = result[3][3];

        expect(debugInfo[0]).toBe('object');
        // expect(debugInfo[1].object).not.toBeNull();
        expect(debugInfo[1].object).toMatchInlineSnapshot(`
            {
              "@wire": {
                "foo": {
                  "config": {},
                  "context": undefined,
                  "data": {},
                  "wasDataProvisionedForConfig": true,
                },
              },
            }
        `);
    });
});
