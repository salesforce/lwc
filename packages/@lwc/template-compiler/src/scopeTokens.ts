/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';

// The reason this hash code implementation [1] is chosen is because:
// 1. It has a very low hash collision rate - testing a list of 466,551 English words [2], it generates no collisions
// 2. It is fast - it can hash those 466k words in 70ms (Node 16, 2020 MacBook Pro)
// 3. The output size is reasonable (32-bit - this can be base-32 encoded at 10-11 characters)
//
// Also note that the reason we're hashing rather than generating a random number is because
// we want the output to be predictable given the input, which helps with caching.
//
// [1]: https://stackoverflow.com/a/52171480
// [2]: https://github.com/dwyl/english-words/blob/a77cb15f4f5beb59c15b945f2415328a6b33c3b0/words.txt
function generateHashCode(str: string) {
    const seed = 0;
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function escapeScopeToken(input: string) {
    // Minimal escape for strings containing the "@" and "#" characters, which are disallowed
    // in certain cases in attribute names
    return input.replace(/@/g, '___at___').replace(/#/g, '___hash___');
}

export type scopeTokens = {
    scopeToken: string;
    legacyScopeToken: string;
    cssScopeTokens: string[];
};

/**
 * Generate the scope tokens for a given component. Note that this API is NOT stable and should be
 * considered internal to the LWC framework.
 * @param filename - full filename, e.g. `path/to/x/foo/foo.js`
 * @param namespace - namespace, e.g. 'x' for `x/foo/foo.js`
 * @param componentName - component name, e.g. 'foo' for `x/foo/foo.js`
 */
export function generateScopeTokens(
    filename: string,
    namespace: string | undefined,
    componentName: string | undefined
): scopeTokens {
    const uniqueToken = `${namespace}-${componentName}_${path.basename(filename, path.extname(filename))}`;

    // This scope token is all lowercase so that it works correctly in case-sensitive namespaces (e.g. SVG).
    // It is deliberately designed to discourage people from relying on it by appearing somewhat random.
    // (But not totally random, because it's nice to have stable scope tokens for our own tests.)
    // Base-32 is chosen because it is not case-sensitive (0-v), and generates short strings with the given hash
    // code implementation (10-11 characters).
    const hashCode = generateHashCode(uniqueToken);
    const scopeToken = `lwc-${hashCode.toString(32)}`;

    // TODO [#3733]: remove support for legacy scope tokens
    // This scope token is based on the namespace and name, and contains a mix of uppercase/lowercase chars
    const legacyScopeToken = escapeScopeToken(uniqueToken);

    const cssScopeTokens = [
        scopeToken,
        `${scopeToken}-host`, // implicit scope token created by `makeHostToken()` in `@lwc/engine-core`
        // The legacy tokens must be returned as well since we technically don't know what we're going to render
        // This is not strictly required since this is only used for Jest serialization (as of this writing),
        // and people are unlikely to set runtime flags in Jest, but it is technically correct to include this.
        legacyScopeToken,
        `${legacyScopeToken}-host`,
    ];

    return {
        scopeToken,
        legacyScopeToken,
        cssScopeTokens,
    };
}
