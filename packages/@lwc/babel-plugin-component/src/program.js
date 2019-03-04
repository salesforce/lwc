/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const classProperty = require('@babel/plugin-proposal-class-properties')['default'];
const { invalidDecorators } = require('./decorators');
const { transform: postProcess } = require('./post-process');

function exit(api) {
    return {
        Program: {
            exit(path, state) {
                const visitors = api.traverse.visitors.merge([
                    postProcess(api),
                    classProperty(api, { loose: true }).visitor,

                    // Decorator usage validation is done on a program exit because by the time program exits,
                    // all the decorators are suppose to be transformed and removed from the class.
                    // Any remaining decorators mean they were not detected and therefore misused.
                    invalidDecorators(api),
                ]);

                path.traverse(visitors, state);
            },
        },
    };
}

module.exports = { exit };
