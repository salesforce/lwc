import { IS_SYNTHETIC_SHADOW_LOADED } from '../../../helpers/constants.js';

// From @lwc/shared/src/keys.ts
const KEY__SHADOW_RESOLVER = '$shadowResolver$';
const KEY__SHADOW_STATIC = '$shadowStaticNode$';

describe.runIf(IS_SYNTHETIC_SHADOW_LOADED)('sets shadow resolver correctly on static trees', () => {
    const fragments = [
        '<div></div>',
        '<div>hello</div>',
        '<div><!-- foo --></div>',
        '<section><div></div><div></div></section>',
        '<section><div>hello</div><div></div></section>',
        '<section><div></div><div>hello</div></section>',
        '<section><div>hello</div><div>hello</div></section>',
        '<section><div><!-- foo --></div><div></div></section>',
        '<section><div></div><div><!-- foo --></div></section>',
        '<section><div><!-- foo --></div><div><!-- foo --></div></section>',
        '<section><div>hello</div><div><!-- foo --></div></section>',
    ];

    const scenarios = [
        {},
        {
            withParent: true,
        },
        {
            withParent: true,
            withRightSibling: true,
        },
        {
            withParent: true,
            withLeftSibling: true,
        },
        {
            withParent: true,
            withLeftSibling: true,
            withRightSibling: true,
        },
    ];

    fragments.forEach((fragment) => {
        scenarios.forEach(({ withParent, withRightSibling, withLeftSibling }) => {
            describe(`${withParent ? 'with parent' : 'without parent'}${
                withLeftSibling ? ' and left sibling' : ''
            }${withRightSibling ? ' and right sibling' : ''}`, () => {
                it(fragment, () => {
                    const parent = document.createElement('div');
                    parent.innerHTML = fragment;
                    const root = parent.firstChild;

                    if (!withParent) {
                        parent.removeChild(root);
                    }
                    const leftSibling = document.createElement('div');
                    if (withLeftSibling) {
                        parent.insertBefore(leftSibling, root);
                    }
                    const rightSibling = document.createElement('div');
                    if (withRightSibling) {
                        parent.appendChild(rightSibling);
                    }

                    const resolver = () => {};
                    root[KEY__SHADOW_RESOLVER] = resolver;
                    root[KEY__SHADOW_STATIC] = true;

                    // ensure the shadow resolver is set on all nodes in the tree
                    const expectShadowResolver = (node) => {
                        expect(node[KEY__SHADOW_RESOLVER]).toBe(resolver);
                        for (const childNode of Array.from(node.childNodes)) {
                            expectShadowResolver(childNode);
                        }
                    };
                    expectShadowResolver(root);

                    // ensure we don't traverse up past the root
                    for (const node of [parent, leftSibling, rightSibling]) {
                        expect(node[KEY__SHADOW_RESOLVER]).toBeUndefined();
                    }
                });
            });
        });
    });
});
