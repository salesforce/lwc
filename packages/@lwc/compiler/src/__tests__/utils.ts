/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as fs from 'fs';
import * as path from 'path';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

export function fixturePath(location: string): string {
    return path.join(FIXTURE_DIR, location);
}

export function readFixture(location: string): string {
    return fs.readFileSync(fixturePath(location), 'utf-8');
}

export function pretify(str: string): string {
    return str
        .toString()
        .replace(/^\s+|\s+$/, '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length)
        .join('\n');
}
