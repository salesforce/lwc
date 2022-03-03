/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const babel = require('@babel/core');
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

/**
 * Small Rollup plugin that applies the Babel plugin for @lwc/features
 */
module.exports = function lwcFeatures() {
    return {
        id: 'rollup-plugin-lwc-features',
        transform(source, id) {
            if (id.includes('/node_modules/') || !source.includes('@lwc/features')) {
                // Skip 3rd-party files and files that don't mention @lwc/features
                return null;
            }
            return babel.transform(source, {
                plugins: [babelFeaturesPlugin],
            }).code;
        },
    };
};
