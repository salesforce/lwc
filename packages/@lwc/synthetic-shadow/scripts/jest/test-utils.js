/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { compileToFunction } = require('@lwc/template-compiler');
const TEMPLATE_CACHE = Object.create(null);
const { registerTemplate } = require('@lwc/engine');
/**
 * Compiles a template string and returns the instantiated function.
 *
 * @param {string} source The template string
 * @param {object=} config The template configuration
 * @param {object=} config.modules The map of the modules used in the template
 * @returns {function}
 */
function compileTemplate(source, config = {}) {
    const { modules = {} } = config;

    // Check if the same template has already been compiled
    if (!(source in TEMPLATE_CACHE)) {
        TEMPLATE_CACHE[source] = compileToFunction(source);
    }

    const templateFactory = TEMPLATE_CACHE[source];
    return registerTemplate(templateFactory(modules));
}

module.exports = {
    compileTemplate,
};
