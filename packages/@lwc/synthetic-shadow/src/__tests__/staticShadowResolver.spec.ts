/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { KEY__SHADOW_RESOLVER, KEY__SHADOW_STATIC } from '@lwc/shared';

describe('traverseAndSetShadowResolver', () => {
    const fragments = [
        '<div></div>',
        '<div>hello</div>',
        '<section><div></div><div></div></section>',
        '<section><div>hello</div><div></div></section>',
        '<section><div></div><div>hello</div></section>',
        '<section><div>hello</div><div>hello</div></section>',
    ];
    fragments.forEach((fragment) => {
        [false, true].forEach((hasParent) => {
            it(`${fragment} ${hasParent ? 'with parent' : 'without parent'}`, () => {
                const parent = document.createElement('div');
                parent.innerHTML = fragment;
                const root = parent.firstChild;

                if (!hasParent) {
                    parent.removeChild(root!);
                }

                const resolver = () => {};
                (root as any)[KEY__SHADOW_RESOLVER] = resolver;
                (root as any)[KEY__SHADOW_STATIC] = true;

                const walker = document.createTreeWalker(
                    root!,
                    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
                );

                let node: Node | null;
                while ((node = walker.nextNode())) {
                    expect((node as any)[KEY__SHADOW_RESOLVER]).toBe(resolver);
                }
                expect((parent as any)[KEY__SHADOW_RESOLVER]).toBeUndefined();
            });
        });
    });
});
