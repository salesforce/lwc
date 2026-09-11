/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * A no-op `@best/api-db` adapter used for LOCAL benchmark runs.
 *
 * `@best/cli` unconditionally calls `saveBenchmarkSummaryInDB(...)` at the end of a
 * run (see `@best/cli/build/run_best.js`), which does `loadDbFromConfig(globalConfig)`
 * → `new <adapter>(config)` → `db.migrate()` / `db.saveSnapshots(...)`. When no
 * results database is configured locally, the default `rest/frontend` adapter builds
 * `new URL("undefined/api/v1/...")` (because `BEST_FRONTEND_HOSTNAME` is unset) and
 * throws `TypeError: Invalid URL`, aborting the whole run AFTER the benchmarks have
 * already executed.
 *
 * `loadDbFromConfig` (in `@best/api-db/build/utils.js`) treats any adapter string that
 * is NOT one of its built-in `LOCAL_ADAPTERS` (`sql/postgres`, `sql/sqlite`,
 * `rest/frontend`) as a requirable module: `req(config.adapter)`. `best.config.js`
 * points `apiDatabase.adapter` at the absolute path of THIS file whenever the frontend
 * DB env vars are absent, so local runs simply discard the snapshots instead of
 * crashing. When `BEST_FRONTEND_HOSTNAME` IS set (CI), the real `rest/frontend`
 * adapter is used and results are persisted as before.
 *
 * Must be CommonJS (`.cjs`): `req()` uses `require()`, and this package is
 * `"type": "module"`.
 */
class NoopDbAdapter {
    constructor(config) {
        this.config = config;
    }

    async migrate() {
        /* no-op */
    }

    async saveSnapshots() {
        return true;
    }

    async fetchProjects() {
        return [];
    }

    async fetchSnapshots() {
        return [];
    }

    async updateLastRelease() {
        return true;
    }
}

module.exports = NoopDbAdapter;
