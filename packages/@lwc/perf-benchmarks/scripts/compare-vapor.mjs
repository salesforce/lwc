/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Vapor-vs-classic performance comparison driver.
 *
 * Runs the SAME `engine-dom` `@best` benchmarks twice — once against the classic VDOM runtime
 * (`@lwc/engine-dom`) and once against Vapor (`@lwc/engine-vapor`) — then joins the two result
 * sets and emits a Markdown + JSON comparison report.
 *
 * How the two runs are kept separate:
 *   - Component output: `perf-benchmarks-components` is built with `PERF_ENGINES=dom,vapor`, producing
 *     both `dist/dom/**` and `dist/vapor/**`.
 *   - Benchmark bundling: `best.config.js` reads `PERF_ENGINE`. For `vapor` it rewrites the benchmark
 *     source imports (`@lwc/engine-dom` -> `@lwc/engine-vapor`, `dist/dom/` -> `dist/vapor/`) at bundle
 *     time and uses the `lwc-vapor` project name, so results are written to a separate folder.
 *
 * Usage (from repo root):
 *   yarn test:performance:compare:vapor        # build + run both + report
 *   node scripts/compare-vapor.mjs             # same (from the perf-benchmarks package dir)
 *
 * Env knobs:
 *   COMPARE_ITERATIONS   number of Best iterations per benchmark (default 60; lower = faster/noisier)
 *   COMPARE_SKIP_BUILD   if set, skip rebuilding the component dist (assumes dom+vapor already built)
 *   COMPARE_SKIP_RUN     if set, skip running Best; only (re)generate the report from existing results
 *   COMPARE_GREP         only run benchmark files whose path matches this substring (passed to Best)
 *   COMPARE_ENGINES      comma-separated subset of engines to (re)run, e.g. `vapor` to re-run only the
 *                        vapor pass and keep the already-persisted classic results. Default: both.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

class BestRunError extends Error {}

const packageDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = path.resolve(packageDir, '../../..');
const resultsRoot = path.join(packageDir, '__benchmarks_results__');
const reportDir = path.join(packageDir, '__vapor_comparison__');
const bestBin = path.join(repoRoot, 'node_modules/.bin/best');
const nxBin = path.join(repoRoot, 'node_modules/.bin/nx');
const domBenchmarks = 'src/__benchmarks__/engine-dom';

const iterations = process.env.COMPARE_ITERATIONS ?? '60';
const grep = process.env.COMPARE_GREP;

const ALL_ENGINES = [
    { engine: 'dom', label: 'classic (VDOM)', project: 'lwc' },
    { engine: 'vapor', label: 'vapor', project: 'lwc-vapor' },
];

// Optionally restrict which engines are (re)run this invocation. Re-running only `vapor` keeps the
// already-persisted classic results, so a fixed vapor run can be re-measured without re-running the
// (slow, unchanged) classic pass. The report is always built from whatever is on disk for BOTH.
const selectedEngines = process.env.COMPARE_ENGINES
    ? process.env.COMPARE_ENGINES.split(',')
          .map((e) => e.trim())
          .filter(Boolean)
    : ALL_ENGINES.map((e) => e.engine);
const ENGINES = ALL_ENGINES.filter((e) => selectedEngines.includes(e.engine));

/**
 * Run a binary with an explicit argument array (no shell), inheriting stdio. Using `execFileSync`
 * rather than a shell string avoids any command-injection surface from env-derived values.
 * When `fatal` is false, a non-zero exit is rethrown as a `BestRunError` for the caller to record
 * rather than aborting the whole comparison (so a report is still produced from partial results).
 */
function run(file, args, extraEnv = {}, { fatal = true } = {}) {
    console.log(`\n$ ${file} ${args.join(' ')}`);
    try {
        execFileSync(file, args, {
            stdio: 'inherit',
            cwd: packageDir,
            env: { ...process.env, ...extraEnv },
        });
    } catch (err) {
        if (fatal) throw err;
        throw new BestRunError(`\`${file}\` exited ${err.status ?? '(signal)'}`);
    }
}

/**
 * Remove any prior results for the two projects this comparison writes to. Best appends a new
 * `<benchmark>_<sha|local_sig>` folder per run and never prunes old ones, so a previous (possibly
 * partial or differently-scoped, e.g. ssr/server) run would otherwise leak stale benchmarks into
 * the joined report. Clearing first makes the report reflect exactly this invocation.
 */
function clearPriorResults() {
    if (process.env.COMPARE_SKIP_RUN) {
        // Reusing existing results on purpose — don't wipe them.
        return;
    }
    for (const { project } of ENGINES) {
        const dir = path.join(resultsRoot, project);
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`Cleared prior results: ${dir}`);
        }
    }
}

/** Build the component dist for BOTH engines in a single rollup invocation. */
function buildComponents() {
    if (process.env.COMPARE_SKIP_BUILD) {
        console.log('COMPARE_SKIP_BUILD set — skipping component build.');
        return;
    }
    // Build only what this comparison needs (dom + vapor), bypassing the nx cache so a prior
    // dom-only build doesn't mask the vapor output.
    run(nxBin, ['build', '@lwc/perf-benchmarks-components', '--skip-nx-cache'], {
        PERF_ENGINES: 'dom,vapor',
    });
}

/**
 * Run Best for a single engine over the engine-dom benchmarks. Returns an error message string if
 * the Best process exited non-zero (e.g. a single benchmark threw), or null on success. The error
 * is non-fatal: the comparison still proceeds to build a report from whatever results persisted.
 *
 * NOTE: `best` only writes each benchmark's `stats.json` at the very END of the whole invocation, so
 * if it aborts on an errored benchmark, ALL of that engine's measurements for the run are discarded.
 * That's why we exclude known-throwing benchmarks in `best.config.js` rather than tolerating them.
 */
function runEngine({ engine }) {
    if (process.env.COMPARE_SKIP_RUN) {
        console.log(`COMPARE_SKIP_RUN set — skipping Best run for engine "${engine}".`);
        return null;
    }
    const args = [domBenchmarks];
    if (grep) {
        args.push(grep);
    }
    args.push(`--iterations=${iterations}`);
    try {
        run(bestBin, args, { PERF_ENGINE: engine }, { fatal: false });
        return null;
    } catch (err) {
        if (err instanceof BestRunError) {
            console.error(`\n⚠️  Best run for engine "${engine}" failed: ${err.message}`);
            console.error('   Continuing to build a report from any results that persisted.');
            return err.message;
        }
        throw err;
    }
}

/**
 * Collect the newest `stats.json` per benchmark for a project. Because the working tree may be
 * dirty, Best writes `<benchmarkName>_local_<sig>` folders; multiple can accumulate, so we keep
 * the most recently modified one per benchmark and return a map keyed by the benchmark result name.
 */
function collectResults(project) {
    const projectDir = path.join(resultsRoot, project);
    if (!fs.existsSync(projectDir)) {
        return {};
    }
    // group folders by benchmark base name (strip the trailing _<sha> / _local_<sig>)
    const newestByBenchmark = new Map();
    for (const entry of fs.readdirSync(projectDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const statsPath = path.join(projectDir, entry.name, 'stats.json');
        if (!fs.existsSync(statsPath)) continue;
        const base = entry.name.replace(/_(local_[0-9a-f]+|[0-9a-f]{7,40})$/, '');
        const mtime = fs.statSync(statsPath).mtimeMs;
        const prev = newestByBenchmark.get(base);
        if (!prev || mtime > prev.mtime) {
            newestByBenchmark.set(base, { statsPath, mtime });
        }
    }

    const byName = {};
    for (const { statsPath } of newestByBenchmark.values()) {
        const parsed = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
        for (const result of parsed.results ?? []) {
            const stats = result?.metrics?.script?.stats;
            if (!stats) continue;
            byName[result.name] = {
                median: stats.median,
                mean: stats.mean,
                mad: stats.medianAbsoluteDeviation,
                sampleSize: stats.sampleSize,
            };
        }
    }
    return byName;
}

function fmt(n, digits = 3) {
    return typeof n === 'number' ? n.toFixed(digits) : 'n/a';
}

function buildReport(runErrors = {}) {
    const classic = collectResults('lwc');
    const vapor = collectResults('lwc-vapor');

    // Join on the benchmark result name. The benchmark label string (e.g. "dom/expressions") is NOT
    // rewritten for vapor, so both engines report the same name — that's the join key.
    const names = [...new Set([...Object.keys(classic), ...Object.keys(vapor)])].sort();

    const rows = names.map((name) => {
        const c = classic[name];
        const v = vapor[name];
        // Speedup > 1 means Vapor is faster (lower median time).
        const speedup =
            c?.median != null && v?.median != null && v.median > 0 ? c.median / v.median : null;
        return { name, classic: c, vapor: v, speedup };
    });

    const mdLines = [];
    mdLines.push('# Vapor vs. Classic (VDOM) — `@best` performance comparison');
    mdLines.push('');
    mdLines.push(`- Iterations per benchmark: **${iterations}**`);
    mdLines.push(`- Benchmarks: \`${domBenchmarks}\` (client/DOM benchmarks)`);
    mdLines.push('- Metric: `script` (JS execution time, ms). Lower is better.');
    mdLines.push(
        '- **Speedup** = classic median ÷ vapor median. `>1.00×` = Vapor faster; `<1.00×` = Vapor slower.'
    );
    mdLines.push('');
    mdLines.push(
        '| Benchmark | Classic median (ms) | Vapor median (ms) | Speedup (classic÷vapor) |'
    );
    mdLines.push('| --- | ---: | ---: | ---: |');
    for (const r of rows) {
        const speedupCell = r.speedup != null ? `${r.speedup.toFixed(2)}×` : 'n/a';
        mdLines.push(
            `| ${r.name} | ${fmt(r.classic?.median)} | ${fmt(r.vapor?.median)} | ${speedupCell} |`
        );
    }
    mdLines.push('');

    const comparable = rows.filter((r) => r.speedup != null);
    if (comparable.length) {
        const geomean = Math.exp(
            comparable.reduce((sum, r) => sum + Math.log(r.speedup), 0) / comparable.length
        );
        mdLines.push(
            `**Geometric-mean speedup across ${comparable.length} comparable benchmarks: ${geomean.toFixed(
                2
            )}×** (Vapor vs. classic).`
        );
        mdLines.push('');
    }

    const missingVapor = rows.filter((r) => r.classic && !r.vapor).map((r) => r.name);
    const missingClassic = rows.filter((r) => r.vapor && !r.classic).map((r) => r.name);
    if (missingVapor.length) {
        mdLines.push(`> Ran under classic only (no vapor result): ${missingVapor.join(', ')}`);
    }
    if (missingClassic.length) {
        mdLines.push(`> Ran under vapor only (no classic result): ${missingClassic.join(', ')}`);
    }
    if (Object.keys(runErrors).length) {
        mdLines.push('');
        for (const [engine, message] of Object.entries(runErrors)) {
            mdLines.push(`> ⚠️ The \`${engine}\` Best run reported an error: ${message}`);
        }
    }

    fs.mkdirSync(reportDir, { recursive: true });
    const mdPath = path.join(reportDir, 'vapor-vs-classic.md');
    const jsonPath = path.join(reportDir, 'vapor-vs-classic.json');
    fs.writeFileSync(mdPath, mdLines.join('\n') + '\n', 'utf-8');
    fs.writeFileSync(
        jsonPath,
        JSON.stringify(
            {
                iterations: Number(iterations),
                benchmarks: domBenchmarks,
                metric: 'script',
                rows,
            },
            null,
            2
        ) + '\n',
        'utf-8'
    );

    console.log('\n' + mdLines.join('\n'));
    console.log(`\nWrote:\n  ${mdPath}\n  ${jsonPath}`);
}

function main() {
    clearPriorResults();
    buildComponents();
    const runErrors = {};
    for (const engineConfig of ENGINES) {
        const err = runEngine(engineConfig);
        if (err) {
            runErrors[engineConfig.engine] = err;
        }
    }
    buildReport(runErrors);
    // Surface a non-zero exit if any engine's Best run failed, but only AFTER the report is written.
    if (Object.keys(runErrors).length) {
        process.exitCode = 1;
    }
}

main();
