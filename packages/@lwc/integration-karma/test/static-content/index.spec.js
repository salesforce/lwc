import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';
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

                const token =
                    process.env.API_VERSION <= 58 ? 'x-component_component' : 'lwc-6a8uqob2ku4';
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
                    process.env.API_VERSION <= 58 ? 'x-multipleStyles_b' : 'lwc-6fpm08fjoch',
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
