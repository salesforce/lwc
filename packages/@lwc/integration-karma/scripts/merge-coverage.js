/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const reports = require('istanbul-reports');
const libReport = require('istanbul-lib-report');
const libCoverage = require('istanbul-lib-coverage');

const COVERAGE_DIR = path.resolve(__dirname, '../coverage');
const COMBINED_COVERAGE_DIR = 'combined';
const REPORT_TYPES = ['html', 'json', 'text'];

const coverageFiles = globSync('**/coverage-*.json', {
    absolute: true,
    cwd: COVERAGE_DIR,
    ignore: COMBINED_COVERAGE_DIR,
});

const coverageMap = libCoverage.createCoverageMap();

for (const coverageFile of coverageFiles) {
    const report = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
    coverageMap.merge(report);
}

const context = libReport.createContext({
    dir: path.resolve(COVERAGE_DIR, COMBINED_COVERAGE_DIR),
    coverageMap,
});

for (const type of REPORT_TYPES) {
    const report = reports.create(type);
    report.execute(context);
}
