/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

var TestUtils = (function (lwc) {
    function createElement(name, config) {
        config = Object.assign({}, config, {
            fallback: false
        });

        return lwc.createElement(name, config);
    }

    return {
        createElement: createElement,
        nativeShadow: true,
    };
})(Engine);

