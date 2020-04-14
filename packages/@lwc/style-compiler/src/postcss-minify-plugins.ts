/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import cssnanoPreset from 'cssnano-preset-default';

const CSS_NANO_PRESET_OPTIONS = {
    svgo: {
        // The svgo plugin is async and need to be excluded.
        exclude: true,
    },
};

/**
 * cssnano decided to make its APIs asynchronous with v4. Because the LWC compiler transform API is
 * synchronous we can't use cssnano directly. For now we use the css-nano-preset-default and filter
 * out the plugins that are async.
 * https://github.com/cssnano/cssnano/blob/master/packages/cssnano-preset-default/src/index.js
 *
 * We may switch back to cssnano if/when they decide to go back to a synchronous API:
 * https://github.com/cssnano/cssnano/issues/68
 */
export default function () {
    const { plugins } = cssnanoPreset(CSS_NANO_PRESET_OPTIONS);

    return plugins
        .filter(([_, options]) => !options || !options.exclude)
        .map(([plugin, options]) => plugin(options));
}
