/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
declare module 'cssnano-preset-default' {
    import { OldPlugin } from 'postcss';

    const preset: (
        config: any
    ) => {
        plugins: [[OldPlugin<any>, undefined | { exclude?: boolean }]];
    };
    export default preset;
}
