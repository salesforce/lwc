/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root } from 'postcss';
import { SHADOW_ATTRIBUTE } from '../utils/selectors-scoping';

// Subset of prefixes for animation-related names that we expect people might be using.
// The most important is -webkit, which is actually part of the spec now. All -webkit prefixes
// are listed here: https://developer.mozilla.org/en-US/docs/Web/CSS/Webkit_Extensions
// -moz is also still supported as of Firefox 95.
// We could probably get away with just doing -webkit and -moz (since -ms never seems
// to have existed for keyframes/animations, and Opera has used Blink since 2013), but
// covering all the popular ones will at least make the compiled code more consistent
// for developers who are using all the variants.
// List based on a subset from https://github.com/wooorm/vendors/blob/2f489ad/index.js
const VENDOR_PREFIXES = ['moz', 'ms', 'o', 'webkit'];

// create a list like ['animation', '-webkit-animation', ...]
function getAllNames(name: string) {
    return new Set([name, ...VENDOR_PREFIXES.map((prefix) => `-${prefix}-${name}`)]);
}

const ANIMATION = getAllNames('animation');
const ANIMATION_NAME = getAllNames('animation-name');

export default function process(root: Root) {
    const knownNames: Set<string> = new Set();
    root.walkAtRules((atRule) => {
        // Note that @-webkit-keyframes, @-moz-keyframes, etc. are not actually a thing supported
        // in any browser, even though you'll see it on some StackOverflow answers.
        if (atRule.name === 'keyframes') {
            const { params } = atRule;
            knownNames.add(params);
            atRule.params = `${params}-${SHADOW_ATTRIBUTE}`;
        }
    });
    root.walkRules((rule) => {
        rule.walkDecls((decl) => {
            if (ANIMATION.has(decl.prop)) {
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
            } else if (ANIMATION_NAME.has(decl.prop)) {
                if (knownNames.has(decl.value)) {
                    decl.value = `${decl.value}-${SHADOW_ATTRIBUTE}`;
                }
            }
        });
    });
}
