/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root } from 'postcss';
import { SHADOW_ATTRIBUTE } from '../utils/selectors-scoping';

export default function process(root: Root) {
    const knownNames: Set<string> = new Set();
    root.walkAtRules((atRule) => {
        if (atRule.name === 'keyframes') {
            const { params } = atRule;
            knownNames.add(params);
            atRule.params = `${params}-${SHADOW_ATTRIBUTE}`;
        }
    });
    root.walkRules((rule) => {
        rule.walkDecls((decl) => {
            if (decl.prop === 'animation') {
                // Use a simple heuristic of breaking up the tokens by whitespace. We could use
                // a dedicated animation prop parser (e.g.
                // https://github.com/hookhookun/parse-animation-shorthand) but it's
                // probably overkill.
                const tokens = decl.value
                    .trim()
                    .split(/\s+/g)
                    .map((token) =>
                        knownNames.has(token) ? `${token}-${SHADOW_ATTRIBUTE}` : token
                    );
                decl.value = tokens.join(' ');
            } else if (decl.prop === 'animation-name') {
                if (knownNames.has(decl.value)) {
                    decl.value = `${decl.value}-${SHADOW_ATTRIBUTE}`;
                }
            }
        });
    });
}
