#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { globSync } from 'glob';
import { parse } from '@babel/parser';
import { analyzeFile } from './analyzer.mjs';
import { transformSource } from './transformer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

// Colors for terminal output
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

function checkGitStatus() {
    try {
        const status = execFileSync('git', ['status', '--porcelain'], {
            cwd: ROOT,
            encoding: 'utf-8',
        });
        return status.trim().length === 0;
    } catch (err) {
        log(`Error checking git status: ${err.message}`, 'red');
        return false;
    }
}

function discoverFiles() {
    log('\n📁 Discovering TypeScript files...', 'cyan');

    const pattern = 'packages/@lwc/*/src/**/*.ts';
    const files = globSync(pattern, {
        cwd: ROOT,
        ignore: [
            '**/__tests__/**',
            '**/*.test.ts',
            '**/*.spec.ts',
            '**/dist/**',
            '**/node_modules/**',
            // Exclude packages with TypeScript strict mode or type inference issues:
            // These trigger implicit 'any' errors or type resolution failures when transformed
            'packages/@lwc/errors/**',
            'packages/@lwc/shared/**',
            'packages/@lwc/template-compiler/**',
            'packages/@lwc/babel-plugin-component/**',
            'packages/@lwc/style-compiler/**',
            'packages/@lwc/engine-core/**',
            'packages/@lwc/synthetic-shadow/**',
        ],
        absolute: true,
    });

    log(`   Found ${files.length} files`, 'blue');
    return files;
}

function processFile(filePath) {
    try {
        // Read source
        const source = readFileSync(filePath, 'utf-8');

        // Parse with Babel
        const ast = parse(source, {
            sourceType: 'module',
            plugins: [
                'typescript',
                'decorators-legacy',
                'classProperties',
                'classPrivateProperties',
                'classPrivateMethods',
            ],
        });

        // Analyze to identify public/private identifiers
        const analysis = analyzeFile(ast);

        // Transform identifiers
        const transformed = transformSource(ast, source, analysis);

        // Write back if changed
        if (transformed !== source) {
            writeFileSync(filePath, transformed, 'utf-8');
            return true;
        }

        return false;
    } catch (err) {
        log(`   ❌ Error processing ${filePath}: ${err.message}`, 'red');
        if (err.stack) {
            console.error(err.stack);
        }
        return false;
    }
}

function runCommand(cmd, args) {
    try {
        log(`\n▶ Running: ${cmd} ${args.join(' ')}`, 'cyan');
        execFileSync(cmd, args, {
            cwd: ROOT,
            stdio: 'inherit',
        });
        return true;
    } catch (err) {
        log(`   ❌ Command failed with exit code ${err.status}`, 'red');
        return false;
    }
}

async function main() {
    log('🔄 Starting confusable character transformation...', 'cyan');

    // Check git status
    log('\n📋 Checking git status...', 'cyan');
    const isClean = checkGitStatus();
    if (!isClean) {
        log('   ❌ Working tree is not clean. Commit changes first.', 'red');
        process.exit(1);
    }
    log('   ✓ Working tree is clean', 'green');

    // Create checkpoint
    log('\n💾 Creating git checkpoint...', 'cyan');
    if (!runCommand('git', ['add', '-A'])) {
        process.exit(1);
    }
    if (!runCommand('git', ['commit', '-m', 'Pre-confusable-transformation checkpoint'])) {
        log('   ⚠ No changes to commit (already at checkpoint?)', 'yellow');
    }

    // Discover files
    const files = discoverFiles();

    // Process each file
    log('\n🔨 Transforming files...', 'cyan');
    let transformed = 0;
    for (const file of files) {
        const changed = processFile(file);
        if (changed) {
            transformed++;
            log(`   ✓ ${file.replace(ROOT + '/', '')}`, 'green');
        }
    }

    log(`\n✓ Transformed ${transformed} of ${files.length} files`, 'green');

    // Format
    log('\n📝 Running yarn format...', 'cyan');
    if (!runCommand('yarn', ['format'])) {
        log('   ❌ Format failed, rolling back...', 'red');
        runCommand('git', ['reset', '--hard', 'HEAD']);
        process.exit(1);
    }

    // Verify: build
    log('\n🔧 Verifying: yarn build...', 'cyan');
    if (!runCommand('yarn', ['build'])) {
        log('   ❌ Build failed, rolling back...', 'red');
        runCommand('git', ['reset', '--hard', 'HEAD']);
        process.exit(1);
    }

    // Verify: tests
    log('\n🧪 Verifying: yarn test...', 'cyan');
    if (!runCommand('yarn', ['test'])) {
        log('   ❌ Tests failed, rolling back...', 'red');
        runCommand('git', ['reset', '--hard', 'HEAD']);
        process.exit(1);
    }

    // Skip test:wtr due to permission issues in this environment
    log('\n⚠️  Skipping yarn test:wtr (permission issues with port binding)', 'yellow');
    log('   Run manually after transformation if needed', 'yellow');

    log('\n🎉 Transformation completed successfully!', 'green');
    log('\nNext steps:', 'cyan');
    log('  - Review changes with: git diff HEAD~1', 'blue');
    log('  - Commit changes if satisfied', 'blue');
    log('  - Or rollback with: git reset --hard HEAD~1', 'blue');
}

main().catch((err) => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    console.error(err.stack);
    process.exit(1);
});
