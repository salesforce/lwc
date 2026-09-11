import { writeFileSync, appendFileSync } from 'node:fs';
import vaporConfig from './vapor.js';

const OUT = '/tmp/vapor-tally.json';
const LOG = '/tmp/vapor-tally-progress.log';

// Accumulate per-file results as they complete (reportTestFileResults fires once
// per test file), then write a single JSON tally at stop(). This gives one
// trustworthy full-suite number; the default text reporter doesn't aggregate
// cleanly when piped to a file.
function tallyReporter() {
    const totals = { passed: 0, failed: 0, skipped: 0, files: 0, failedFiles: [] };
    writeFileSync(LOG, 'start\n');
    return {
        reportTestFileResults({ sessionsForTestFile, testFile }) {
            totals.files++;
            let fileFailed = false;
            for (const session of sessionsForTestFile ?? []) {
                const results = session.testResults;
                if (!results) {
                    fileFailed = true;
                    continue;
                }
                const walk = (suite) => {
                    for (const t of suite.tests ?? []) {
                        if (t.skipped) totals.skipped++;
                        else if (t.passed) totals.passed++;
                        else {
                            totals.failed++;
                            fileFailed = true;
                        }
                    }
                    for (const s of suite.suites ?? []) walk(s);
                };
                walk(results);
            }
            if (fileFailed) totals.failedFiles.push(testFile);
            appendFileSync(
                LOG,
                `${totals.files}: ${testFile} P=${totals.passed} F=${totals.failed}\n`
            );
            // Write incrementally so we still get a tally even if the run hangs later.
            writeFileSync(OUT, JSON.stringify(totals, null, 2));
        },
        stop() {
            writeFileSync(OUT, JSON.stringify(totals, null, 2));
        },
    };
}

export default {
    ...vaporConfig,
    reporters: [tallyReporter()],
};
