/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { transform } from '../../transformers/transformer';

const transformEntry: any = transform;

it('should validate presence of src', () => {
    expect(() => transformEntry()).toThrow(/Expect a string for source. Received undefined/);
});

it('should validate presence of id', () => {
    expect(() => transformEntry(`console.log('Hello')`)).toThrow(
        /Expect a string for id. Received undefined/,
    );
});
