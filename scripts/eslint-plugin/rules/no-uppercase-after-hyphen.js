/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/*
* We prohibit attribute names that contain combination of hyphen and underscores characters.
* We need to ensure that public properties aren't created in this format, as uppercase characters
* will be translated to '-{character}' and users aren't likely to understand or expect this behaviour
* https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.js_props_names
*/

const INVALID_PROPERTY_NAME_REGEX = /_[A-Z]/g;

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow uppercase characters following an underscore in property names'
        }
    },

    create(context) {
        return {
            Identifier(node) {
                if (node.name.match(INVALID_PROPERTY_NAME_REGEX)) {
                    context.report(node, `Avoid uppercase characters following an underscore in property names: "${node.name.match(INVALID_PROPERTY_NAME_REGEX)[0]}"`);
                }
            }
        }
    }
}
