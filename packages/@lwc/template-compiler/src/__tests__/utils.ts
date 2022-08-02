/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Config, normalizeConfig } from '../config';
import State from '../state';
import parse from '../parser';

export const EXPECTED_LOCATION = expect.objectContaining({
    line: expect.any(Number),
    column: expect.any(Number),
    start: expect.any(Number),
    length: expect.any(Number),
});

export function parseTemplate(src: string, cfg: Config = {}): any {
    const config = normalizeConfig(cfg);
    const state = new State(config);

    const res = parse(src, state);
    return {
        ...res,
        state,
    };
}
