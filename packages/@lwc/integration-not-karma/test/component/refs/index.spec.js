import { createElement } from 'lwc';
import Basic from 'c/basic';
import BasicDynamic from 'c/basicDynamic';
import None from 'c/none';
import NoneActive from 'c/noneActive';
import Multi from 'c/multi';
import MultiNoRefsInOne from 'c/multiNoRefsInOne';
import MultiParent from 'c/multiParent';
import Overwrite from 'c/overwrite';
import Conflict from 'c/conflict';
import ConflictDynamic from 'c/conflictDynamic';
import ConflictFullyStatic from 'c/conflictFullyStatic';
import Parent from 'c/parent';
import Light from 'c/light';
import Dynamic from 'c/dynamic';
import LwcDynamic from 'c/lwcDynamic';
import Conditional from 'c/conditional';
import Construct from 'c/construct';
import Connect from 'c/connect';
import Rendered from 'c/rendered';
import Disconnect from 'c/disconnect';
import Render from 'c/render';
import Expando from 'c/expando';
import ExpandoCheck from 'c/expandoCheck';
import Slotter from 'c/slotter';
import AccessDuringRender from 'c/accessDuringRender';
import RerenderElement from 'c/rerenderElement';
import RerenderComponent from 'c/rerenderComponent';
import RerenderElementStaticRef from 'c/rerenderElementStaticRef';
import { extractDataIds } from '../../../helpers/utils.js';

describe('refs', () => {
    describe('basic refs example', () => {
        const scenarios = [
            {
                name: 'static',
                Ctor: Basic,
                tagName: 'c-basic',
            },
            {
                name: 'dynamic',
                Ctor: BasicDynamic,
                tagName: 'c-basic-dynamic',
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
        const elm = createElement('c-basic', { is: Basic });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(Object.getPrototypeOf(refs)).toBeNull();
        expect(Object.keys(refs).sort()).toEqual(['deepInner', 'first', 'inner', 'second']);

        expect(Object.isFrozen(refs)).toEqual(true);
    });

    it('no refs', () => {
        const elm = createElement('c-none', { is: None });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(refs).toBeUndefined();
    });

    it('no active refs', () => {
        const elm = createElement('c-none-active', { is: NoneActive });
        document.body.appendChild(elm);

        const refs = elm.getRefs();

        expect(Object.getPrototypeOf(refs)).toBeNull();
        expect(Object.keys(refs)).toEqual([]);

        expect(Object.isFrozen(refs)).toEqual(true);
    });

    it('multi templates', async () => {
        const elm = createElement('c-multi', { is: Multi });

        document.body.appendChild(elm);

        expect(elm.getRef('a').textContent).toEqual('a');
        expect(elm.getRef('shared').textContent).toEqual('a-shared');
        expect(elm.getRef('deepShared').textContent).toEqual('a-deepShared');
        expect(elm.getRef('b')).toBeUndefined();

        elm.next();
        await Promise.resolve();
        expect(elm.getRef('b').textContent).toEqual('b');
        expect(elm.getRef('shared').textContent).toEqual('b-shared');
        expect(elm.getRef('deepShared').textContent).toEqual('b-deepShared');
        expect(elm.getRef('a')).toBeUndefined();
        elm.next();
        await Promise.resolve();
        expect(elm.getRef('a').textContent).toEqual('a');
        expect(elm.getRef('shared').textContent).toEqual('a-shared');
        expect(elm.getRef('deepShared').textContent).toEqual('a-deepShared');
        expect(elm.getRef('b')).toBeUndefined();
    });

    it('multi templates - no refs in one', async () => {
        const elm = createElement('c-multi-no-refs-in-one', { is: MultiNoRefsInOne });

        document.body.appendChild(elm);

        expect(elm.getRefs()).toBeUndefined();

        elm.next();
        await Promise.resolve();
        expect(elm.getRefs().foo.textContent).toEqual('foo');
        elm.next();
        await Promise.resolve();
        expect(elm.getRefs()).toBeUndefined();
    });

    it('can overwrite refs', async () => {
        const elm = createElement('c-overwrite', { is: Overwrite });

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('h1').textContent).toEqual('yolo');
        elm.next();
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('h1').textContent).toEqual('woohoo');
    });

    it('can overwrite refs with an expando', () => {
        const elm = createElement('c-expando', { is: Expando });

        document.body.appendChild(elm);
        elm.setRefs('foo');
        expect(elm.getRefs()).toEqual('foo');
        elm.deleteRefs();
        expect(elm.getRefs()).toEqual(undefined);
        elm.setRefs('bar');
        expect(elm.getRefs()).toEqual('bar');
    });

    it('can overwrite refs with an expando after checking the expando for truthiness', () => {
        const elm = createElement('c-expando-check', { is: ExpandoCheck });

        document.body.appendChild(elm);
        elm.checkAndSet();
        expect(elm.getRefs()).toEqual('foo');
    });

    it('refs not accessible externally', () => {
        const elm = createElement('c-basic', { is: Basic });

        document.body.appendChild(elm);

        expect(elm.refs).toEqual(undefined);
    });

    describe('conflicts between elements with the same ref', () => {
        const scenarios = [
            {
                name: 'Basic',
                tagName: 'c-conflict',
                Ctor: Conflict,
            },
            {
                name: 'Dynamic',
                tagName: 'c-dynamic',
                Ctor: ConflictDynamic,
            },
            {
                name: 'Fully static',
                tagName: 'c-fully-static',
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
        const elm = createElement('c-multi-parent', { is: MultiParent });

        document.body.appendChild(elm);

        const expectedDivs = [...elm.shadowRoot.children].map((_) => _.shadowRoot.firstChild);
        const actualDivs = elm.getAllRefs();
        expect(expectedDivs.length).toBe(actualDivs.length);
        expect(expectedDivs[0]).toBe(actualDivs[0]);
        expect(expectedDivs[1]).toBe(actualDivs[1]);
        expect(expectedDivs[2]).toBe(actualDivs[2]);
    });

    it('ref on a component', () => {
        const elm = createElement('c-parent', { is: Parent });

        document.body.appendChild(elm);

        const child = elm.getRef('child');
        expect(child.tagName.toLowerCase()).toEqual('c-child');
        expect(child.shadowRoot.querySelector('h1').textContent).toEqual('child');
    });

    it('light dom', () => {
        const elm = createElement('c-light', { is: Light });
        document.body.appendChild(elm);

        expect(elm.getRefTextContent('foo')).toEqual('foo');
    });

    it('ref on a dynamic component - lwc:dynamic', async () => {
        const elm = createElement('c-dynamic', { is: LwcDynamic });
        document.body.appendChild(elm);

        // Constructor not set
        expect(elm.getRef('dynamic')).toBeUndefined();

        // Set the constructor
        elm.setDynamicConstructor();

        await Promise.resolve();
        const dynamic = elm.getRef('dynamic');
        // Ref is available after constructor set
        expect(dynamic.tagName.toLowerCase()).toEqual('c-dynamic-cmp');
        expect(dynamic.getRefTextContent('first')).toEqual('first');
    });

    it('ref on a dynamic component - <lwc:component lwc:is={}>', async () => {
        const elm = createElement('c-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        // Constructor not set
        expect(elm.getRef('dynamic')).toBeUndefined();

        // Set the constructor
        elm.setDynamicConstructor();

        await Promise.resolve();
        const dynamic = elm.getRef('dynamic');
        // Ref is available after constructor set
        expect(dynamic.tagName.toLowerCase()).toEqual('c-basic');
        expect(dynamic.getRefTextContent('first')).toEqual('first');
    });

    it('ref with conditional', async () => {
        const elm = createElement('c-conditional', { is: Conditional });
        document.body.appendChild(elm);

        expect(elm.getRef('coinflip').textContent).toEqual('tails');
        expect(elm.getRef('onlyHeads')).toBeUndefined();
        expect(elm.getRef('onlyTails').textContent).toEqual('only tails');
        expect(elm.getRefNames()).toEqual(['coinflip', 'onlyTails']);
        elm.next();
        await Promise.resolve();
        expect(elm.getRef('coinflip').textContent).toEqual('heads');
        expect(elm.getRef('onlyTails')).toBeUndefined();
        expect(elm.getRef('onlyHeads').textContent).toEqual('only heads');
        expect(elm.getRefNames()).toEqual(['coinflip', 'onlyHeads']);
        elm.next();
        await Promise.resolve();
        expect(elm.getRef('coinflip').textContent).toEqual('tails');
        expect(elm.getRef('onlyHeads')).toBeUndefined();
        expect(elm.getRef('onlyTails').textContent).toEqual('only tails');
        expect(elm.getRefNames()).toEqual(['coinflip', 'onlyTails']);
    });

    it('ref with slot', () => {
        const elm = createElement('c-slotter', { is: Slotter });
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
            const elm = createElement('c-rerender-element', { is: RerenderElement });
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
            const elm = createElement('c-rerender-component', { is: RerenderComponent });
            document.body.appendChild(elm);

            expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('c-rerender-element'));
            for (let i = 0; i < 3; i++) {
                elm.version = i;
                expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('c-rerender-element'));
                await Promise.resolve();
                expect(elm.getRef('foo')).toBe(elm.shadowRoot.querySelector('c-rerender-element'));
            }
        });

        it('element with a different static ref', async () => {
            const elm = createElement('c-rerender-element-static-ref', {
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
                elm = createElement('c-construct', { is: Construct });
            }).toLogErrorDev(
                /Error: \[LWC error]: this.refs should not be called during the construction of the custom element for <c-construct> because the element is not yet in the DOM or has no children yet\./
            );
            document.body.appendChild(elm);
            expect(elm.result).toBeUndefined();
        });

        it('logs error in connectedCallback', () => {
            const elm = createElement('c-connect', { is: Connect });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                /Error: \[LWC error]: this\.refs is undefined for <c-connect>\. This is either because the attached template has no "lwc:ref" directive, or this.refs was invoked before renderedCallback\(\). Use this\.refs only when the referenced HTML elements have been rendered to the DOM, such as within renderedCallback\(\) or disconnectedCallback\(\)\./
            );
            expect(elm.result).toBeUndefined();
        });

        it('works in renderedCallback', () => {
            const elm = createElement('c-rendered', { is: Rendered });
            document.body.appendChild(elm);
            expect(elm.result).toEqual('foo');
        });

        it('works in disconnectedCallback', () => {
            const elm = createElement('c-disconnect', { is: Disconnect });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(elm.result).toEqual('foo');
        });

        it('works in render', async () => {
            const elm = createElement('c-render', { is: Render });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                /Error: \[LWC error]: this\.refs is undefined for <c-render>\. This is either because the attached template has no "lwc:ref" directive, or this.refs was invoked before renderedCallback\(\). Use this\.refs only when the referenced HTML elements have been rendered to the DOM, such as within renderedCallback\(\) or disconnectedCallback\(\)\./
            );
            await Promise.resolve();
            expect(elm.results).toEqual([undefined]);
            elm.next();
            await Promise.resolve();
            expect(elm.results).toEqual([undefined, 'foo']);
        });

        it('logs error if this.refs is accessed during render', async () => {
            const elm = createElement('c-access-during-render', { is: AccessDuringRender });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                /Error: \[LWC error]: this\.refs should not be called while <c-access-during-render> is rendering\. Use this\.refs only when the DOM is stable, e\.g\. in renderedCallback\(\)\./
            );
            const ids = extractDataIds(elm);

            // this.refs should be undefined during rendering
            expect(ids.refTextContent.textContent).toEqual('refs are undefined');
            await Promise.resolve();
            expect(ids.refTextContent.textContent).toEqual('refs are undefined');
            expect(elm.refTextContent).toEqual('content in ref');
        });
    });
});
