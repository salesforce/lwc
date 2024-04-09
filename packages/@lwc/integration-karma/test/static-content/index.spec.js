import { createElement } from 'lwc';
import { extractDataIds, LOWERCASE_SCOPE_TOKENS } from 'test-utils';
import Container from 'x/container';
import Escape from 'x/escape';
import MultipleStyles from 'x/multipleStyles';
import SvgNs from 'x/svgNs';
import Table from 'x/table';
import SvgPath from 'x/svgPath';
import SvgPathInDiv from 'x/svgPathInDiv';
import SvgPathInG from 'x/svgPathInG';
import StaticUnsafeTopLevel from 'x/staticUnsafeTopLevel';
import OnlyEventListener from 'x/onlyEventListener';
import OnlyEventListenerChild from 'x/onlyEventListenerChild';
import OnlyEventListenerGrandchild from 'x/onlyEventListenerGrandchild';
import ListenerStaticWithUpdates from 'x/listenerStaticWithUpdates';
import DeepListener from 'x/deepListener';
import Comments from 'x/comments';
import PreserveComments from 'x/preserveComments';
import Attribute from 'x/attribute';
import DeepAttribute from 'x/deepAttribute';
import IframeOnload from 'x/iframeOnload';
import WithKey from 'x/withKey';
import Text from 'x/text';
import TableWithExpression from 'x/tableWithExpressions';

if (!process.env.NATIVE_SHADOW) {
    describe('Mixed mode for static content', () => {
        ['native', 'synthetic'].forEach((firstRenderMode) => {
            it(`should set the tokens for synthetic shadow when it renders first in ${firstRenderMode}`, () => {
                const elm = createElement('x-container', { is: Container });
                elm.syntheticFirst = firstRenderMode === 'synthetic';
                document.body.appendChild(elm);

                const syntheticMode = elm.shadowRoot
                    .querySelector('x-component')
                    .shadowRoot.querySelector('div');
                const nativeMode = elm.shadowRoot
                    .querySelector('x-native')
                    .shadowRoot.querySelector('x-component')
                    .shadowRoot.querySelector('div');

                const token = LOWERCASE_SCOPE_TOKENS ? 'lwc-6a8uqob2ku4' : 'x-component_component';
                expect(syntheticMode.hasAttribute(token)).toBe(true);
                expect(nativeMode.hasAttribute(token)).toBe(false);
            });
        });
    });
}

describe('static content when stylesheets change', () => {
    it('should reflect correct token for scoped styles', () => {
        const elm = createElement('x-container', { is: MultipleStyles });

        const stylesheetsWarning =
            /Mutating the "stylesheets" property on a template is deprecated and will be removed in a future version of LWC/;

        expect(() => {
            elm.updateTemplate({
                name: 'a',
                useScopedCss: false,
            });
        }).toLogWarningDev(stylesheetsWarning);

        window.__lwcResetAlreadyLoggedMessages();

        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe('foo');

        // atm, we need to switch templates.
        expect(() => {
            elm.updateTemplate({
                name: 'b',
                useScopedCss: true,
            });
        }).toLogWarningDev(stylesheetsWarning);

        window.__lwcResetAlreadyLoggedMessages();

        return Promise.resolve()
            .then(() => {
                const classList = Array.from(elm.shadowRoot.querySelector('div').classList).sort();
                expect(classList).toEqual([
                    'foo',
                    LOWERCASE_SCOPE_TOKENS ? 'lwc-6fpm08fjoch' : 'x-multipleStyles_b',
                ]);

                expect(() => {
                    elm.updateTemplate({
                        name: 'a',
                        useScopedCss: false,
                    });
                }).toLogWarningDev(stylesheetsWarning);
            })
            .then(() => {
                const classList = Array.from(elm.shadowRoot.querySelector('div').classList).sort();
                expect(classList).toEqual(['foo']);
            });
    });
});

describe('svg and static content', () => {
    it('should use correct namespace', () => {
        const elm = createElement('x-svg-ns', { is: SvgNs });
        document.body.appendChild(elm);

        const allStaticNodes = elm.querySelectorAll('.static');

        allStaticNodes.forEach((node) => {
            expect(node.namespaceURI).toBe('http://www.w3.org/2000/svg');
        });
    });

    function getDomStructure(elm) {
        const tagName = elm.tagName.toLowerCase();
        const result = { tagName };
        for (let i = 0; i < elm.children.length; i++) {
            const child = elm.children[i];
            result.children = result.children || [];
            result.children.push(getDomStructure(child));
        }
        return result;
    }

    it('should correctly parse <path>', () => {
        const elm = createElement('x-svg-path', { is: SvgPath });
        document.body.appendChild(elm);

        expect(getDomStructure(elm.shadowRoot.firstChild)).toEqual({
            tagName: 'svg',
            children: [
                {
                    tagName: 'path',
                },
                {
                    tagName: 'path',
                },
            ],
        });
    });

    it('should correctly parse <path> in div', () => {
        const elm = createElement('x-svg-path-in-div', { is: SvgPathInDiv });
        document.body.appendChild(elm);

        expect(getDomStructure(elm.shadowRoot.firstChild)).toEqual({
            tagName: 'div',
            children: [
                {
                    tagName: 'svg',
                    children: [
                        {
                            tagName: 'path',
                        },
                        {
                            tagName: 'path',
                        },
                    ],
                },
            ],
        });
    });

    it('should correctly parse <path> in <g>', () => {
        const elm = createElement('x-svg-path-in-g', { is: SvgPathInG });
        document.body.appendChild(elm);

        expect(getDomStructure(elm.shadowRoot.firstChild)).toEqual({
            tagName: 'svg',
            children: [
                {
                    tagName: 'g',
                    children: [
                        {
                            tagName: 'path',
                        },
                        {
                            tagName: 'path',
                        },
                    ],
                },
            ],
        });
    });
});

describe('elements that cannot be parsed as top-level', () => {
    it('should work with a static <td>', () => {
        const elm = createElement('x-table', { is: Table });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelectorAll('td').length).toEqual(0);

        elm.addRow();

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelectorAll('td').length).toEqual(1);
            expect(elm.shadowRoot.querySelector('td').textContent).toEqual('');
        });
    });

    it('works for all elements that cannot be safely parsed as top-level', () => {
        const elm = createElement('x-static-unsafe-top-level', { is: StaticUnsafeTopLevel });
        document.body.appendChild(elm);

        const getChildrenTagNames = () => {
            const result = [];
            const { children } = elm.shadowRoot;
            for (let i = 0; i < children.length; i++) {
                result.push(children[i].tagName.toLowerCase());
            }
            return result;
        };

        const expectedChildren = [
            'caption',
            'col',
            'colgroup',
            'tbody',
            'td',
            'tfoot',
            'th',
            'thead',
            'tr',
        ];

        expect(getChildrenTagNames()).toEqual([]);
        elm.doRender = true;
        return Promise.resolve()
            .then(() => {
                expect(getChildrenTagNames()).toEqual(expectedChildren);
                elm.doRender = false;
            })
            .then(() => {
                expect(getChildrenTagNames()).toEqual([]);
                elm.doRender = true;
            })
            .then(() => {
                expect(getChildrenTagNames()).toEqual(expectedChildren);
            });
    });
});

describe('template literal escaping', () => {
    it('should properly render escaped content', () => {
        const elm = createElement('x-escape', { is: Escape });
        document.body.appendChild(elm);

        // "`"
        [
            () => elm.shadowRoot.querySelector('.backtick-text').textContent,
            () => elm.shadowRoot.querySelector('.backtick-comment').firstChild.textContent,
            () => elm.shadowRoot.querySelector('.backtick-attr').getAttribute('data-message'),
        ].forEach((selector) => {
            expect(selector()).toBe('Escape `me`');
        });

        // "\`"
        [
            () => elm.shadowRoot.querySelector('.backtick-escape-text').textContent,
            () => elm.shadowRoot.querySelector('.backtick-escape-comment').firstChild.textContent,
            () =>
                elm.shadowRoot.querySelector('.backtick-escape-attr').getAttribute('data-message'),
        ].forEach((selector) => {
            expect(selector()).toBe('Escape \\`me`');
        });

        // "${"
        expect(elm.shadowRoot.querySelector('.dollar-attr').getAttribute('data-message')).toBe(
            'Escape ${me}'
        );

        // "\${"
        expect(
            elm.shadowRoot.querySelector('.dollar-escape-attr').getAttribute('data-message')
        ).toBe('Escape \\${me}');
    });
});

describe('static optimization with event listeners', () => {
    // We test an event listener on the self, child, and grandchild, because we currently
    // cannot optimize event listeners anywhere except at the top level of a static fragment.
    // So we need to ensure that potentially-static parents/grandparents do not result in
    // event listeners not being attached incorrectly.
    const scenarios = [
        {
            name: 'self',
            Component: OnlyEventListener,
        },
        {
            name: 'child',
            Component: OnlyEventListenerChild,
        },
        {
            name: 'grandchild',
            Component: OnlyEventListenerGrandchild,
        },
    ];

    scenarios.forEach(({ name, Component }) => {
        describe(name, () => {
            // CustomEvent is not supported in IE11
            const CE = typeof CustomEvent === 'function' ? CustomEvent : Event;

            let elm;
            let button;

            beforeEach(async () => {
                elm = createElement('x-only-event-listener', { is: Component });
                document.body.appendChild(elm);

                await Promise.resolve();

                button = elm.shadowRoot.querySelector('button');
            });

            it('works with element that is static except for event listener', async () => {
                button.dispatchEvent(new CE('foo'));
                button.dispatchEvent(new CE('bar'));
                expect(elm.counts).toEqual({ foo: 1, bar: 1 });

                // trigger re-render
                elm.dynamic = 'yolo';

                await Promise.resolve();

                button.dispatchEvent(new CE('foo'));
                button.dispatchEvent(new CE('bar'));
                expect(elm.counts).toEqual({ foo: 2, bar: 2 });
            });

            it('can have manual listeners too', async () => {
                const dispatcher = jasmine.createSpy();

                button.addEventListener('baz', dispatcher);
                button.dispatchEvent(new CE('baz'));
                expect(dispatcher.calls.count()).toBe(1);

                // trigger re-render
                elm.dynamic = 'yolo';

                await Promise.resolve();

                button.dispatchEvent(new CE('baz'));
                expect(dispatcher.calls.count()).toBe(2);
            });
        });
    });
});

describe('event listeners on static nodes when other nodes are updated', () => {
    it('event listeners work after updates', async () => {
        const elm = createElement('x-listener-static-with-updates', {
            is: ListenerStaticWithUpdates,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        let expectedCount = 0;

        expect(elm.fooEventCount).toBe(expectedCount);
        elm.fireFooEvent();
        expect(elm.fooEventCount).toBe(++expectedCount);

        await Promise.resolve();
        for (let i = 0; i < 3; i++) {
            elm.version = i;
            elm.fireFooEvent();
            expect(elm.fooEventCount).toBe(++expectedCount);
            await Promise.resolve();
            elm.fireFooEvent();
            expect(elm.fooEventCount).toBe(++expectedCount);
        }
    });
});

describe('event listeners on deep paths', () => {
    it('handles events correctly', async () => {
        const elm = createElement('x-deep-listener', {
            is: DeepListener,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        let count = 0;
        expect(elm.counter).toBe(count);

        const childElms = Object.values(extractDataIds(elm));
        expect(childElms.length).toBe(12); // static1, dynamic1, deepStatic1, static2, etc. until 4

        for (const childElm of childElms) {
            childElm.dispatchEvent(new CustomEvent('foo'));
            expect(elm.counter).toBe(++count);
        }
    });
});

describe('static parts applies to comments correctly', () => {
    it('has correct static parts when lwc:preserve-comments is off', async () => {
        const elm = createElement('x-comments', {
            is: Comments,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        const { foo, bar } = extractDataIds(elm);
        const refs = elm.getRefs();

        foo.click();
        expect(elm.fooWasClicked).toBe(true);
        expect(refs.foo).toBe(foo);

        bar.click();
        expect(elm.barWasClicked).toBe(true);
        expect(refs.bar).toBe(bar);
    });

    it('has correct static parts when lwc:preserve-comments is on', async () => {
        const elm = createElement('x-preserve-comments', {
            is: PreserveComments,
        });
        document.body.appendChild(elm);

        await Promise.resolve();

        const { foo, bar } = extractDataIds(elm);
        const refs = elm.getRefs();

        foo.click();
        expect(elm.fooWasClicked).toBe(true);
        expect(refs.foo).toBe(foo);

        bar.click();
        expect(elm.barWasClicked).toBe(true);
        expect(refs.bar).toBe(bar);
    });
});

describe('static content optimization with attribute', () => {
    let nodes = {};
    let elm;

    beforeEach(async () => {
        elm = createElement('x-attributes', { is: Attribute });
        document.body.appendChild(elm);
        await Promise.resolve();
        nodes = extractDataIds(elm);
    });

    const verifyStyleAttributeAppliedCorrectly = ({ cmp, expected }) =>
        expect(cmp.getAttribute('style')).toEqual(expected);

    const verifyAttributeAppliedCorrectly = ({ cmp, expected }) =>
        expect(cmp.getAttribute('data-value')).toEqual(expected);

    const verifyClassAppliedCorrectly = ({ cmp, expected }) =>
        expect(cmp.getAttribute('class')).toEqual(expected);

    it('preserves static values', () => {
        const {
            staticAttr,
            staticStyle,
            staticClass,
            staticAttrNested,
            staticStyleNested,
            staticClassNested,
            staticCombined,
            staticCombinedNested,
        } = nodes;

        // styles
        [
            { cmp: staticStyle, expected: 'color: blue;' },
            { cmp: staticCombined, expected: 'color: red;' },
            { cmp: staticStyleNested, expected: 'color: white;' },
            { cmp: staticCombinedNested, expected: 'color: orange;' },
        ].forEach(verifyStyleAttributeAppliedCorrectly);

        // class
        [
            { cmp: staticClass, expected: 'static class' },
            { cmp: staticCombined, expected: 'combined class' },
            { cmp: staticClassNested, expected: 'static nested class' },
            { cmp: staticCombinedNested, expected: 'static combined nested' },
        ].forEach(verifyClassAppliedCorrectly);

        // attributes
        [
            { cmp: staticAttr, expected: 'static1' },
            { cmp: staticCombined, expected: 'static2' },
            { cmp: staticAttrNested, expected: 'static3' },
            { cmp: staticCombinedNested, expected: 'static4' },
        ].forEach(verifyAttributeAppliedCorrectly);
    });

    it('applies expressions on mount', () => {
        const {
            dynamicAttr,
            dynamicStyle,
            dynamicClass,
            dynamicAttrNested,
            dynamicStyleNested,
            dynamicClassNested,
            dynamicCombined,
            dynamicCombinedNested,
        } = nodes;

        // styles
        [
            { cmp: dynamicStyle, expected: 'color: green;' },
            { cmp: dynamicStyleNested, expected: 'color: violet;' },
            { cmp: dynamicCombined, expected: 'color: orange;' },
            { cmp: dynamicCombinedNested, expected: 'color: black;' },
        ].forEach(verifyStyleAttributeAppliedCorrectly);

        // class
        [
            { cmp: dynamicClass, expected: 'class1' },
            { cmp: dynamicClassNested, expected: 'nestedClass1' },
            { cmp: dynamicCombined, expected: 'combinedClass' },
            { cmp: dynamicCombinedNested, expected: 'combinedClassNested' },
        ].forEach(verifyClassAppliedCorrectly);

        // attributes
        [
            { cmp: dynamicAttr, expected: 'dynamic1' },
            { cmp: dynamicAttrNested, expected: 'dynamic2' },
            { cmp: dynamicCombined, expected: 'dynamic3' },
            { cmp: dynamicCombinedNested, expected: 'dynamic4' },
        ].forEach(verifyAttributeAppliedCorrectly);
    });

    it('updates values when expressions change', async () => {
        const {
            dynamicAttr,
            dynamicStyle,
            dynamicClass,
            dynamicAttrNested,
            dynamicStyleNested,
            dynamicClassNested,
            dynamicCombined,
            dynamicCombinedNested,
        } = nodes;

        // styles

        elm.dynamicStyle = 'color: teal;';
        elm.dynamicStyleNested = 'color: rose;';
        elm.combinedStyle = 'color: purple;';
        elm.combinedStyleNested = 'color: random;';

        await Promise.resolve();

        [
            { cmp: dynamicStyle, expected: 'color: teal;' },
            { cmp: dynamicStyleNested, expected: 'color: rose;' },
            { cmp: dynamicCombined, expected: 'color: purple;' },
            { cmp: dynamicCombinedNested, expected: 'color: random;' },
        ].forEach(verifyStyleAttributeAppliedCorrectly);

        // class
        elm.dynamicClass = 'class2';
        elm.dynamicClassNested = 'nestedClass2';
        elm.combinedClass = 'combinedClassUpdated';
        elm.combinedClassNested = 'combinedClassNestedUpdated';

        await Promise.resolve();

        [
            { cmp: dynamicClass, expected: 'class2' },
            { cmp: dynamicClassNested, expected: 'nestedClass2' },
            { cmp: dynamicCombined, expected: 'combinedClassUpdated' },
            { cmp: dynamicCombinedNested, expected: 'combinedClassNestedUpdated' },
        ].forEach(verifyClassAppliedCorrectly);

        // attributes
        elm.dynamicAttr = 'dynamicUpdated1';
        elm.dynamicAttrNested = 'dynamicUpdated2';
        elm.combinedAttr = 'dynamicUpdated3';
        elm.combinedAttrNested = 'dynamicUpdated4';

        await Promise.resolve();

        [
            { cmp: dynamicAttr, expected: 'dynamicUpdated1' },
            { cmp: dynamicAttrNested, expected: 'dynamicUpdated2' },
            { cmp: dynamicCombined, expected: 'dynamicUpdated3' },
            { cmp: dynamicCombinedNested, expected: 'dynamicUpdated4' },
        ].forEach(verifyAttributeAppliedCorrectly);
    });

    it('applies expression to deeply nested data structure', async () => {
        const elm = createElement('x-deeply-nested', { is: DeepAttribute });
        document.body.appendChild(elm);
        await Promise.resolve();

        nodes = extractDataIds(elm);

        // Test includes 4 levels of depth
        for (let i = 1; i < 5; i++) {
            // style
            [
                { cmp: nodes[`deep${i}Style`], expected: `${i}` },
                { cmp: nodes[`deep${i}StyleNested`], expected: `${i}` },
            ].forEach(verifyStyleAttributeAppliedCorrectly);

            // class
            [
                { cmp: nodes[`deep${i}Class`], expected: `${i}` },
                { cmp: nodes[`deep${i}ClassNested`], expected: `${i}` },
            ].forEach(verifyClassAppliedCorrectly);

            // attribute
            [
                { cmp: nodes[`deep${i}Attr`], expected: `${i}` },
                { cmp: nodes[`deep${i}AttrNested`], expected: `${i}` },
            ].forEach(verifyAttributeAppliedCorrectly);

            // combined
            [
                { cmp: nodes[`deep${i}Combined`], expected: `${i}` },
                { cmp: nodes[`deep${i}CombinedNested`], expected: `${i}` },
            ].forEach(verifyAttributeAppliedCorrectly);
        }
    });
});

describe('iframe onload event listener', () => {
    it('works with iframe onload listener', async () => {
        const elm = createElement('x-iframe-onload', { is: IframeOnload });
        document.body.appendChild(elm);
        // Oddly Firefox requires two macrotasks before the load event fires. Chrome/Safari only require a microtask.
        await new Promise((resolve) => setTimeout(resolve));
        await new Promise((resolve) => setTimeout(resolve));
        expect(elm.loaded).toBeTrue();
    });
});

describe('key directive', () => {
    it('works with a key directive on top-level static content', async () => {
        const elm = createElement('x-with-key', { is: WithKey });
        document.body.appendChild(elm);
        await Promise.resolve();
        const tbody = elm.shadowRoot.querySelector('tbody');
        expect(tbody.children.length).toBe(0);

        // one child
        elm.items = [0];
        await Promise.resolve();
        expect(tbody.children.length).toBe(1);
        const trsA = [...elm.shadowRoot.querySelectorAll('tr')];
        const tdsA = [...elm.shadowRoot.querySelectorAll('td')];
        expect(trsA.length).toBe(1);
        expect(tdsA.length).toBe(1);

        // second child
        elm.items = [0, 1];
        await Promise.resolve();
        expect(tbody.children.length).toBe(2);
        const trsB = [...elm.shadowRoot.querySelectorAll('tr')];
        const tdsB = [...elm.shadowRoot.querySelectorAll('td')];

        expect(trsB.length).toBe(2);
        expect(tdsB.length).toBe(2);
        expect(trsB[0]).toBe(trsA[0]);
        expect(tdsB[0]).toBe(tdsA[0]);

        // switch order
        elm.items = [1, 0];
        await Promise.resolve();
        expect(tbody.children.length).toBe(2);
        const trsC = [...elm.shadowRoot.querySelectorAll('tr')];
        const tdsC = [...elm.shadowRoot.querySelectorAll('td')];

        expect(trsC.length).toBe(2);
        expect(tdsC.length).toBe(2);
        expect(trsC[0]).toBe(trsB[1]);
        expect(tdsC[0]).toBe(tdsB[1]);
        expect(trsC[1]).toBe(trsB[0]);
        expect(tdsC[1]).toBe(tdsB[0]);
    });
});

describe('static content dynamic text', () => {
    it('renders expressions on mount', async () => {
        const elm = createElement('x-text', { is: Text });
        document.body.appendChild(elm);

        await Promise.resolve();

        const { emptyString, concateBeginning, concateEnd, siblings } = extractDataIds(elm);

        expect(emptyString.textContent).toEqual('');
        expect(concateBeginning.textContent).toEqual('default value');
        expect(concateEnd.textContent).toEqual('value default');

        expect(siblings.childNodes.length).toBe(2);
        expect(siblings.childNodes[0].textContent).toEqual('standard text');
        expect(siblings.childNodes[1].textContent).toEqual('second default');
    });

    it('updates expressions on mount', async () => {
        const elm = createElement('x-text', { is: Text });
        document.body.appendChild(elm);

        await Promise.resolve();

        elm.emptyString = 'not empty';
        elm.dynamicText = 'updated';
        elm.siblingDynamicText = 'updated second';

        await Promise.resolve();

        const { emptyString, concateBeginning, concateEnd, siblings } = extractDataIds(elm);

        expect(emptyString.textContent).toEqual('not empty');
        expect(concateBeginning.textContent).toEqual('updated value');
        expect(concateEnd.textContent).toEqual('value updated');

        expect(siblings.childNodes.length).toEqual(2);
        expect(siblings.childNodes[0].textContent).toEqual('standard text');
        expect(siblings.childNodes[1].textContent).toEqual('updated second');
    });
});

describe('table with static content containing expressions', () => {
    it('renders static content correctly', async () => {
        const table = createElement('x-table', { is: TableWithExpression });
        document.body.appendChild(table);

        await Promise.resolve();

        const tbody = table.shadowRoot.querySelector('tbody');
        expect(tbody.children.length).toEqual(3);
        const trs = [...table.shadowRoot.querySelectorAll('tr')];
        const tds = [...table.shadowRoot.querySelectorAll('td')];

        expect(trs.length).toEqual(3);
        expect(tds.length).toEqual(3);

        tds.forEach((td, i) => {
            expect(td.getAttribute('class')).toEqual(`class${i}`);
            expect(td.getAttribute('style')).toEqual(`color: ${i};`);
            expect(td.getAttribute('data-id')).toEqual(`${i}`);
            expect(td.textContent).toEqual(`value${i}`);
        });
    });
});
