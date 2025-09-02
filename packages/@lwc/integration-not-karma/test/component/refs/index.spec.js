import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';
import Basic from 'x/basic';
import BasicDynamic from 'x/basicDynamic';
import None from 'x/none';
import NoneActive from 'x/noneActive';
import Multi from 'x/multi';
import MultiNoRefsInOne from 'x/multiNoRefsInOne';
import MultiParent from 'x/multiParent';
import Overwrite from 'x/overwrite';
import Conflict from 'x/conflict';
import ConflictDynamic from 'x/conflictDynamic';
import ConflictFullyStatic from 'x/conflictFullyStatic';
import Parent from 'x/parent';
import Light from 'x/light';
import Dynamic from 'x/dynamic';
import LwcDynamic from 'x/lwcDynamic';
import Conditional from 'x/conditional';
import Construct from 'x/construct';
import Connect from 'x/connect';
import Rendered from 'x/rendered';
import Disconnect from 'x/disconnect';
import Render from 'x/render';
import Expando from 'x/expando';
import ExpandoCheck from 'x/expandoCheck';
import Slotter from 'x/slotter';
import AccessDuringRender from 'x/accessDuringRender';
import RerenderElement from 'x/rerenderElement';
import RerenderComponent from 'x/rerenderComponent';
import RerenderElementStaticRef from 'x/rerenderElementStaticRef';

describe('refs', () => {
    describe('basic refs example', () => {
        const scenarios = [
            {
                name: 'static',
                Ctor: Basic,
                tagName: 'x-basic',
            },
            {
                name: 'dynamic',
                Ctor: BasicDynamic,
                tagName: 'x-basic-dynamic',
            },
        ];

        scenarios.forEach(({ name, Ctor, tagName }) => {
            it(name, () => {
                const elm = createElement(tagName, { is: Ctor });
                document.body.appendChild(elm);

                expect(elm.getRefTextContent('first')).toEqual('first');
                expect(elm.getRefTextContent('second')).toEqual('second');
                expect(elm.getRefTextContent('inner')).toEqual('inner');
                expect(elm.getRefTextContent('deepInner')).toEqual('deepInner');
            });
        });
    });

    it('refs object shape', () => {
        const elm = createElement('x-basic', { is: Basic });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(Object.getPrototypeOf(refs)).toBeNull();
        expect(Object.keys(refs).sort()).toEqual(['deepInner', 'first', 'inner', 'second']);

        expect(Object.isFrozen(refs)).toEqual(true);
    });

    it('no refs', () => {
        const elm = createElement('x-none', { is: None });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(refs).toBeUndefined();
    });

    it('no active refs', () => {
        const elm = createElement('x-none-active', { is: NoneActive });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(Object.getPrototypeOf(refs)).toBeNull();
        expect(Object.keys(refs)).toEqual([]);

        expect(Object.isFrozen(refs)).toEqual(true);
    });

    it('multi templates', () => {
        const elm = createElement('x-multi', { is: Multi });

        document.body.appendChild(elm);

        expect(elm.getRef('a').textContent).toEqual('a');
        expect(elm.getRef('shared').textContent).toEqual('a-shared');
        expect(elm.getRef('deepShared').textContent).toEqual('a-deepShared');
        expect(elm.getRef('b')).toBeUndefined();

        elm.next();
        return Promise.resolve()
            .then(() => {
                expect(elm.getRef('b').textContent).toEqual('b');
                expect(elm.getRef('shared').textContent).toEqual('b-shared');
                expect(elm.getRef('deepShared').textContent).toEqual('b-deepShared');
                expect(elm.getRef('a')).toBeUndefined();
                elm.next();
            })
            .then(() => {
                expect(elm.getRef('a').textContent).toEqual('a');
                expect(elm.getRef('shared').textContent).toEqual('a-shared');
                expect(elm.getRef('deepShared').textContent).toEqual('a-deepShared');
                expect(elm.getRef('b')).toBeUndefined();
            });
    });

    it('multi templates - no refs in one', () => {
        const elm = createElement('x-multi-no-refs-in-one', { is: MultiNoRefsInOne });

        document.body.appendChild(elm);

        expect(elm.getRefs()).toBeUndefined();

        elm.next();
        return Promise.resolve()
            .then(() => {
                expect(elm.getRefs().foo.textContent).toEqual('foo');
                elm.next();
            })
            .then(() => {
                expect(elm.getRefs()).toBeUndefined();
            });
    });

    it('can overwrite refs', () => {
        const elm = createElement('x-overwrite', { is: Overwrite });

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('h1').textContent).toEqual('yolo');
        elm.next();
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('h1').textContent).toEqual('woohoo');
        });
    });

    it('can overwrite refs with an expando', () => {
        const elm = createElement('x-expando', { is: Expando });

        document.body.appendChild(elm);
        elm.setRefs('foo');
        expect(elm.getRefs()).toEqual('foo');
        elm.deleteRefs();
        expect(elm.getRefs()).toEqual(undefined);
        elm.setRefs('bar');
        expect(elm.getRefs()).toEqual('bar');
    });

    it('can overwrite refs with an expando after checking the expando for truthiness', () => {
        const elm = createElement('x-expando-check', { is: ExpandoCheck });

        document.body.appendChild(elm);
        elm.checkAndSet();
        expect(elm.getRefs()).toEqual('foo');
    });

    it('refs not accessible externally', () => {
        const elm = createElement('x-basic', { is: Basic });

        document.body.appendChild(elm);

        expect(elm.refs).toEqual(undefined);
    });

    describe('conflicts between elements with the same ref', () => {
        const scenarios = [
            {
                name: 'Basic',
                tagName: 'x-conflict',
                Ctor: Conflict,
            },
            {
                name: 'Dynamic',
                tagName: 'x-dynamic',
                Ctor: ConflictDynamic,
            },
            {
                name: 'Fully static',
                tagName: 'x-fully-static',
                Ctor: ConflictFullyStatic,
            },
        ];

        scenarios.forEach(({ name, tagName, Ctor }) => {
            it(name, () => {
                const elm = createElement(tagName, { is: Ctor });

                document.body.appendChild(elm);

                expect(elm.getRefTextContent('foo')).toEqual('march');
                expect(elm.getRefTextContent('bar')).toEqual('april');
                expect(elm.getRefTextContent('baz')).toEqual('july');
                expect(elm.getRefTextContent('quux')).toEqual('september');
            });
        });
    });

    it('multiple copies of same component, refs do not collide', () => {
        const elm = createElement('x-multi-parent', { is: MultiParent });

        document.body.appendChild(elm);

        const expectedDivs = [...elm.shadowRoot.children].map((_) => _.shadowRoot.firstChild);
        const actualDivs = elm.getAllRefs();
        expect(expectedDivs.length).toBe(actualDivs.length);
        expect(expectedDivs[0]).toBe(actualDivs[0]);
        expect(expectedDivs[1]).toBe(actualDivs[1]);
        expect(expectedDivs[2]).toBe(actualDivs[2]);
    });

    it('ref on a component', () => {
        const elm = createElement('x-parent', { is: Parent });

        document.body.appendChild(elm);

        const child = elm.getRef('child');
        expect(child.tagName.toLowerCase()).toEqual('x-child');
        expect(child.shadowRoot.querySelector('h1').textContent).toEqual('child');
    });

    it('light dom', () => {
        const elm = createElement('x-light', { is: Light });
        document.body.appendChild(elm);

        expect(elm.getRefTextContent('foo')).toEqual('foo');
    });

    it('ref on a dynamic component - lwc:dynamic', () => {
        const elm = createElement('x-dynamic', { is: LwcDynamic });
        document.body.appendChild(elm);

        // Constructor not set
        expect(elm.getRef('dynamic')).toBeUndefined();

        // Set the constructor
        elm.setDynamicConstructor();

        return Promise.resolve().then(() => {
            const dynamic = elm.getRef('dynamic');
            // Ref is available after constructor set
            expect(dynamic.tagName.toLowerCase()).toEqual('x-dynamic-cmp');
            expect(dynamic.getRefTextContent('first')).toEqual('first');
        });
    });

    it('ref on a dynamic component - <lwc:component lwc:is={}>', () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        // Constructor not set
        expect(elm.getRef('dynamic')).toBeUndefined();

        // Set the constructor
        elm.setDynamicConstructor();

        return Promise.resolve().then(() => {
            const dynamic = elm.getRef('dynamic');
            // Ref is available after constructor set
            expect(dynamic.tagName.toLowerCase()).toEqual('x-basic');
            expect(dynamic.getRefTextContent('first')).toEqual('first');
        });
    });

    it('ref with conditional', () => {
        const elm = createElement('x-conditional', { is: Conditional });
        document.body.appendChild(elm);

        expect(elm.getRef('coinflip').textContent).toEqual('tails');
        expect(elm.getRef('onlyHeads')).toBeUndefined();
        expect(elm.getRef('onlyTails').textContent).toEqual('only tails');
        expect(elm.getRefNames()).toEqual(['coinflip', 'onlyTails']);
        elm.next();
        return Promise.resolve()
            .then(() => {
                expect(elm.getRef('coinflip').textContent).toEqual('heads');
                expect(elm.getRef('onlyTails')).toBeUndefined();
                expect(elm.getRef('onlyHeads').textContent).toEqual('only heads');
                expect(elm.getRefNames()).toEqual(['coinflip', 'onlyHeads']);
                elm.next();
            })
            .then(() => {
                expect(elm.getRef('coinflip').textContent).toEqual('tails');
                expect(elm.getRef('onlyHeads')).toBeUndefined();
                expect(elm.getRef('onlyTails').textContent).toEqual('only tails');
                expect(elm.getRefNames()).toEqual(['coinflip', 'onlyTails']);
            });
    });

    it('ref with slot', () => {
        const elm = createElement('x-slotter', { is: Slotter });
        document.body.appendChild(elm);

        const ids = extractDataIds(elm);

        expect(elm.getRefs().beforeSlottable).toBe(ids.beforeSlottable);
        expect(elm.getRefs().slottable).toBe(ids.slottable);
        expect(elm.getRefs().inSlottable).toBe(ids.inSlottable);
        expect(elm.getRefs().afterSlottable).toBe(ids.afterSlottable);

        expect(ids.slottable.getRefs().beforeSlot).toBe(ids.beforeSlot);
        expect(ids.slottable.getRefs().afterSlot).toBe(ids.afterSlot);
    });

    describe('re-rendering a vnode with a ref', () => {
        it('element', async () => {
            const elm = createElement('x-rerender-element', { is: RerenderElement });
            document.body.appendChild(elm);

            expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('div'));
            for (let i = 0; i < 3; i++) {
                elm.version = i;
                expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('div'));
                await Promise.resolve();
                expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('div'));
            }
        });

        it('component', async () => {
            const elm = createElement('x-rerender-component', { is: RerenderComponent });
            document.body.appendChild(elm);

            expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('x-rerender-element'));
            for (let i = 0; i < 3; i++) {
                elm.version = i;
                expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('x-rerender-element'));
                await Promise.resolve();
                expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('x-rerender-element'));
            }
        });

        it('element with a different static ref', async () => {
            const elm = createElement('x-rerender-element-static-ref', {
                is: RerenderElementStaticRef,
            });
            document.body.appendChild(elm);

            await Promise.resolve();

            const fooDiv = elm.getRef('foo');
            expect(fooDiv).not.toBeUndefined();

            await Promise.resolve();
            for (let i = 0; i < 3; i++) {
                elm.version = i;
                expect(elm.getRef('foo')).toBe(fooDiv);
                await Promise.resolve();
                expect(elm.getRef('foo')).toBe(fooDiv);
            }
        });
    });

    describe('lifecycle', () => {
        it('logs error in constructor', () => {
            let elm;

            expect(() => {
                elm = createElement('x-construct', { is: Construct });
            }).toLogErrorDev(
                /Error: \[LWC error]: this.refs should not be called during the construction of the custom element for <x-construct> because the element is not yet in the DOM or has no children yet\./
            );
            document.body.appendChild(elm);
            expect(elm.result).toBeUndefined();
        });

        it('logs error in connectedCallback', () => {
            const elm = createElement('x-connect', { is: Connect });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                /Error: \[LWC error]: this\.refs is undefined for <x-connect>\. This is either because the attached template has no "lwc:ref" directive, or this.refs was invoked before renderedCallback\(\). Use this\.refs only when the referenced HTML elements have been rendered to the DOM, such as within renderedCallback\(\) or disconnectedCallback\(\)\./
            );
            expect(elm.result).toBeUndefined();
        });

        it('works in renderedCallback', () => {
            const elm = createElement('x-rendered', { is: Rendered });
            document.body.appendChild(elm);
            expect(elm.result).toEqual('foo');
        });

        it('works in disconnectedCallback', () => {
            const elm = createElement('x-disconnect', { is: Disconnect });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(elm.result).toEqual('foo');
        });

        it('works in render', () => {
            const elm = createElement('x-render', { is: Render });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                /Error: \[LWC error]: this\.refs is undefined for <x-render>\. This is either because the attached template has no "lwc:ref" directive, or this.refs was invoked before renderedCallback\(\). Use this\.refs only when the referenced HTML elements have been rendered to the DOM, such as within renderedCallback\(\) or disconnectedCallback\(\)\./
            );
            return Promise.resolve()
                .then(() => {
                    expect(elm.results).toEqual([undefined]);
                    elm.next();
                })
                .then(() => {
                    expect(elm.results).toEqual([undefined, 'foo']);
                });
        });

        it('logs error if this.refs is accessed during render', () => {
            const elm = createElement('x-access-during-render', { is: AccessDuringRender });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                /Error: \[LWC error]: this\.refs should not be called while <x-access-during-render> is rendering\. Use this\.refs only when the DOM is stable, e\.g\. in renderedCallback\(\)\./
            );
            const ids = extractDataIds(elm);

            // this.refs should be undefined during rendering
            expect(ids.refTextContent.textContent).toEqual('refs are undefined');
            return Promise.resolve().then(() => {
                expect(ids.refTextContent.textContent).toEqual('refs are undefined');
                expect(elm.refTextContent).toEqual('content in ref');
            });
        });
    });
});
