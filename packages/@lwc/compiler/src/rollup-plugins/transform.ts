/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Plugin } from 'rollup';

import { transformFile } from '../transformers/transformer';

import { NormalizedCompilerOptions } from '../compiler/options';

export default function({ options }: { options: NormalizedCompilerOptions }): Plugin {
    return {
        name: 'lwc-file-transform',
        transform(src: string, id: string) {
            return transformFile(src, id, options);
        },
    };
}
