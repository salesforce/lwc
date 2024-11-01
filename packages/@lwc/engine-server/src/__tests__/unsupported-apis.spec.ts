/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { it, expect } from 'vitest';
import { swapComponent, swapStyle, swapTemplate } from '../index';

it('throws error for swapComponent', () => {
    expect(swapComponent).toThrow(
        /swapComponent is not supported in @lwc\/engine-server, only @lwc\/engine-dom/
    );
});

it('throws error for swapStyle', () => {
    expect(swapStyle).toThrow(
        /swapStyle is not supported in @lwc\/engine-server, only @lwc\/engine-dom/
    );
});

it('throws error for swapTemplate', () => {
    expect(swapTemplate).toThrow(
        /swapTemplate is not supported in @lwc\/engine-server, only @lwc\/engine-dom/
    );
});
