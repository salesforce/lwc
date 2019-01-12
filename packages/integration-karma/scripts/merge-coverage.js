'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const istanbul = require('istanbul-api');

const COVERAGE_DIR = path.resolve(__dirname, '../coverage');
const COMBINED_COVERAGE_DIR = 'combined';

const coverageFiles = glob.sync('**/coverage-*.json', {
    absolute: true,
    cwd: COVERAGE_DIR,
    ignore: COMBINED_COVERAGE_DIR,
});

const coverageMap = istanbul.libCoverage.createCoverageMap();

for (const coverageFile of coverageFiles) {
    const report = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
    coverageMap.merge(report);
}

const config = istanbul.config.loadObject({
    reporting: {
        dir: path.resolve(COVERAGE_DIR, COMBINED_COVERAGE_DIR),
    },
});

const reporter = istanbul.createReporter(config);
reporter.addAll(['html', 'json', 'text']);

reporter.write(coverageMap);
