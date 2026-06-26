#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { globSync } from 'glob';
import { parse } from '@babel/parser';
import { analyzeFile } from './analyzer.mjs';
import { transformSource } from './transformer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

// --- CLI flags ----------------------------------------------------------------------------
// --extensions=ts,js,mjs,cjs   which source extensions to transform (default: all)
// --verify                     run yarn build/test/test:wtr after transforming
// --skip-wtr                   when verifying, skip yarn test:wtr (sandbox port issues)
// --checkpoint=<ref>           git ref to `git reset --hard` to if verification fails
const args = process.argv.slice(2);
function flag(name) {
    return args.includes(`--${name}`);
}
function option(name, fallback) {
    const hit = args.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
}

const EXTENSIONS = option('extensions', 'ts,js,mjs,cjs')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
const VERIFY = flag('verify');
const SKIP_WTR = flag('skip-wtr');
const CHECKPOINT = option('checkpoint', null);

// Babel parser plugins. The `typescript` plugin is only valid for .ts sources; applying it to
// plain JS would reject otherwise-legal syntax.
function parserConfig(ext) {
    const plugins = [
        'decorators-legacy',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
    ];
    if (ext === 'ts') {
        plugins.unshift('typescript');
    }
    return {
        // .cjs files may be scripts rather than modules; let Babel decide.
        sourceType: ext === 'cjs' ? 'unambiguous' : 'module',
        plugins,
    };
}

function discoverFiles() {
    log('\n📁 Discovering source files...', 'cyan');

    const brace = EXTENSIONS.length === 1 ? EXTENSIONS[0] : `{${EXTENSIONS.join(',')}}`;
    const pattern = `packages/@lwc/*/src/**/*.${brace}`;
    const files = globSync(pattern, {
        cwd: ROOT,
        ignore: [
            '**/__tests__/**',
            '**/__mocks__/**',
            '**/fixtures/**',
            '**/dist/**',
            '**/.rollup.cache/**',
            '**/node_modules/**',
            '**/*.snap',
            '**/*.spec.*',
            '**/*.test.*',
            '**/*.d.ts',
        ],
        absolute: true,
    });

    // Exclude any JS/TS with a colocated .html template — its identifiers are bound to the
    // template by string name and cannot be renamed independently.
    const filtered = files.filter((file) => {
        const html = file.replace(/\.(ts|js|mjs|cjs)$/, '.html');
        return !existsSync(html);
    });

    log(`   Found ${filtered.length} files (extensions: ${EXTENSIONS.join(', ')})`, 'blue');
    return filtered;
}

function extOf(filePath) {
    const m = filePath.match(/\.([^.]+)$/);
    return m ? m[1] : '';
}

function processFile(filePath) {
    const source = readFileSync(filePath, 'utf-8');
    let ast;
    try {
        ast = parse(source, parserConfig(extOf(filePath)));
    } catch (err) {
        log(
            `   ⚠ Skipping (parse error) ${filePath.replace(ROOT + '/', '')}: ${err.message}`,
            'yellow'
        );
        return false;
    }

    const analysis = analyzeFile(ast);
    const transformed = transformSource(ast, source, analysis);

    if (transformed !== source) {
        writeFileSync(filePath, transformed, 'utf-8');
        return true;
    }
    return false;
}

function runCommand(cmd, cmdArgs) {
    try {
        log(`\n▶ Running: ${cmd} ${cmdArgs.join(' ')}`, 'cyan');
        execFileSync(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit' });
        return true;
    } catch (err) {
        log(`   ❌ Command failed with exit code ${err.status}`, 'red');
        return false;
    }
}

function rollback() {
    if (!CHECKPOINT) {
        log(
            '   ⚠ No --checkpoint ref given; leaving working tree as-is for manual fixing.',
            'yellow'
        );
        return;
    }
    log(`   ↩ Rolling back to ${CHECKPOINT}...`, 'yellow');
    runCommand('git', ['reset', '--hard', CHECKPOINT]);
}

async function main() {
    log('🔄 Starting confusable character transformation...', 'cyan');

    const files = discoverFiles();

    log('\n🔨 Transforming files...', 'cyan');
    let transformed = 0;
    for (const file of files) {
        if (processFile(file)) {
            transformed++;
            log(`   ✓ ${file.replace(ROOT + '/', '')}`, 'green');
        }
    }
    log(`\n✓ Transformed ${transformed} of ${files.length} files`, 'green');

    log('\n📝 Running yarn format...', 'cyan');
    if (!runCommand('yarn', ['format'])) {
        log('   ❌ Format failed', 'red');
        rollback();
        process.exit(1);
    }

    if (!VERIFY) {
        log(
            '\n✓ Transform complete (verification skipped; pass --verify to gate on build/test).',
            'green'
        );
        return;
    }

    log('\n🔧 Verifying: yarn build...', 'cyan');
    if (!runCommand('yarn', ['build'])) {
        rollback();
        process.exit(1);
    }

    log('\n🧪 Verifying: yarn test...', 'cyan');
    if (!runCommand('yarn', ['test', '--run'])) {
        rollback();
        process.exit(1);
    }

    if (SKIP_WTR) {
        log('\n⚠️  Skipping yarn test:wtr (--skip-wtr).', 'yellow');
    } else {
        log('\n🌐 Verifying: yarn test:wtr...', 'cyan');
        if (!runCommand('yarn', ['test:wtr'])) {
            rollback();
            process.exit(1);
        }
    }

    log('\n🎉 Transformation completed and verified!', 'green');
}

main().catch((err) => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    console.error(err.stack);
    process.exit(1);
});
