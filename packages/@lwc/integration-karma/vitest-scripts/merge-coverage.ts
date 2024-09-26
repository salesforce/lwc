/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { globSync } from 'glob';

import { create } from 'istanbul-reports';
import { createContext } from 'istanbul-lib-report';
import { createCoverageMap } from 'istanbul-lib-coverage';

const COVERAGE_DIR = resolve(__dirname, '../coverage');
const COMBINED_COVERAGE_DIR = 'combined';
const REPORT_TYPES = ['html', 'json', 'text'] as const;

const coverageFiles = globSync('**/coverage-*.json', {
    absolute: true,
    cwd: COVERAGE_DIR,
    ignore: COMBINED_COVERAGE_DIR,
});

const coverageMap = createCoverageMap();

for (const coverageFile of coverageFiles) {
    const report = JSON.parse(readFileSync(coverageFile, 'utf-8'));
    coverageMap.merge(report);
}

const context = createContext({
    dir: resolve(COVERAGE_DIR, COMBINED_COVERAGE_DIR),
    coverageMap,
});

for (const type of REPORT_TYPES) {
    const report = create(type);
    report.execute(context);
}
