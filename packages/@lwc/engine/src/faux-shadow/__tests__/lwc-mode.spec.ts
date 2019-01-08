/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../../framework/main';
import { compileTemplate } from 'test-utils';
import { getRootNodeGetter } from '../traverse';

describe('lwc:dom', () => {
    it('lwc:dom="manual" should allow insertion', () => {
        const p = document.createElement('p');
        const html = compileTemplate(`
            <template>
                <div class="manual" lwc:dom="manual"></div>
            </template>
        `);

        class Cmp extends LightningElement {
            renderedCallback() {
                this.template.querySelector('.manual').appendChild(p);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Cmp });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('p')).toBe(p);
        });
    });

    it('lwc:dom="manual" inserted elements should resolve to correct shadowroot', () => {
        const p = document.createElement('p');
        const html = compileTemplate(`
            <template>
                <div class="manual" lwc:dom="manual"></div>
            </template>
        `)
        class Cmp extends LightningElement {
            renderedCallback() {
                this.template.querySelector('.manual').appendChild(p);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Cmp });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(getRootNodeGetter.call(elm.shadowRoot.querySelector('p'))).toBe(elm.shadowRoot);
        });
    });

    it('lwc:dom="manual" inserted elements should remove elements correctly', () => {
        const p = document.createElement('p');
        const html = compileTemplate(`
            <template>
                <div class="manual" lwc:dom="manual"></div>
            </template>
        `);
        class Cmp extends LightningElement {
            renderedCallback() {
                this.template.querySelector('.manual').appendChild(p);
                this.template.querySelector('.manual').removeChild(p);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Cmp });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('p')).toBe(null);
        });
    });

    it('lwc:dom="manual" inserted elements should insertBefore correctly', () => {
        const p = document.createElement('p');
        const html = compileTemplate(`
            <template>
                <div class="manual" lwc:dom="manual"></div>
            </template>
        `)
        class Cmp extends LightningElement {
            renderedCallback() {
                this.template.querySelector('.manual').appendChild(p);
                this.template.querySelector('.manual').insertBefore(document.createElement('span'), p)
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Cmp });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('p').previousElementSibling).toBe(elm.shadowRoot.querySelector('span'));
        });
    });

    it('lwc:dom="manual" inserted elements should insertBefore correctly', () => {
        const p = document.createElement('p');
        const html = compileTemplate(`
            <template>
                <div class="manual" lwc:dom="manual"></div>
            </template>
        `)
        class Cmp extends LightningElement {
            renderedCallback() {
                this.template.querySelector('.manual').appendChild(p);
                this.template.querySelector('.manual').replaceChild(document.createElement('span'), p)
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Cmp });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('p')).toBe(null);
            expect(elm.shadowRoot.querySelector('span')).not.toBe(null);
        });
    });


    it('lwc:dom="manual" inserted elements should resolve to correct shadowroot for deep elements', () => {
        const p = document.createElement('p');
        const header = document.createElement('header');
        header.appendChild(p);
        const html = compileTemplate(`
            <template>
                <div class="manual" lwc:dom="manual"></div>
            </template>
        `)
        class Cmp extends LightningElement {
            renderedCallback() {
                this.template.querySelector('.manual').appendChild(header);
            }
            render() {
                return html;
            }
        }

        const elm = createElement('x-foo', { is: Cmp });
        document.body.appendChild(elm);
        return Promise.resolve().then(() => {
            expect(getRootNodeGetter.call(elm.shadowRoot.querySelector('p'))).toBe(elm.shadowRoot);
        });
    });

    describe('should throw on modifying node without lwc:dom="manual"', () => {
        it('missing lwc:dom="manual" should throw when appending', () => {
            expect.assertions(1);
            const p = document.createElement('p');
            const html = compileTemplate(`
                <template>
                    <div class="manual"></div>
                </template>
            `);
    
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        this.template.querySelector('.manual').appendChild(p);
                    }).toThrow('appendChild is disallowed in Node unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
        });
    
        it('missing lwc:dom="manual" should throw on insertBefore', () => {
            expect.assertions(1);
            const html = compileTemplate(`
                <template>
                    <div class="manual">
                        <p></p>
                    </div>
                </template>
            `);
    
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        const p = this.template.querySelector('p');
                        this.template.querySelector('.manual').insertBefore(document.createElement('span', p));
                    }).toThrow('insertBefore is disallowed in Node unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
        });
    
        it('missing lwc:dom="manual" should throw on removeChild', () => {
            expect.assertions(1);
            const html = compileTemplate(`
                <template>
                    <div class="manual">
                        <p></p>
                    </div>
                </template>
            `);
    
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        const p = this.template.querySelector('p')
                        this.template.querySelector('.manual').removeChild(p);
                    }).toThrow('removeChild is disallowed in Node unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
        });
    
        it('missing lwc:dom="manual" should throw on setting textContent', () => {
            expect.assertions(1);
            const html = compileTemplate(`
                <template>
                    <div class="manual">
                        <p></p>
                    </div>
                </template>
            `);
    
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        this.template.querySelector('.manual').textContent = 'foo';
                    }).toThrow('setting textContent is disallowed in Node unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
        });
    
        it('missing lwc:dom="manual" should throw on setting nodeValue', () => {
            expect.assertions(1);
            const html = compileTemplate(`
                <template>
                    <div class="manual">
                        <p></p>
                    </div>
                </template>
            `);
    
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        this.template.querySelector('.manual').nodeValue = 'foo';
                    }).toThrow('setting nodeValue is disallowed in Node unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
        });
    
        it('missing lwc:dom="manual" should throw on replaceChild', () => {
            const html = compileTemplate(`
                <template>
                    <div class="manual">
                        <p></p>
                    </div>
                </template>
            `);
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        const p = this.template.querySelector('p');
                        this.template.querySelector('.manual').replaceChild(document.createElement('span'), p);
                    }).toThrow('replaceChild is disallowed in Node unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('p')).not.toBe(null);
                expect(elm.shadowRoot.querySelector('span')).toBe(null);
            });
        });

        it('missing lwc:dom="manual" should throw on setting innerHTML', () => {
            expect.assertions(1);
            const html = compileTemplate(`
                <template>
                    <div class="manual">
                        <p></p>
                    </div>
                </template>
            `);
    
            class Cmp extends LightningElement {
                renderedCallback() {
                    expect(() => {
                        this.template.querySelector('.manual').innerHTML = '<span></span>';
                    }).toThrow('setting innerHTML is disallowed in Element unless `lwc:dom="manual"` directive is used in the template.')
                }
                render() {
                    return html;
                }
            }
    
            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
        });
    });
});
