#!/usr/bin/env node
/**
 * Fix all remaining TypeScript errors in engine-core after the confusables transformation.
 *
 * Errors targeted (18 total):
 *   1. circular-module-dependencies.ts(31): __ёṡМөḋυļė → __esModule
 *   2. def.ts(31-32): import ASCII names for renamed functions from circular-module-dependencies
 *   3. freeze-template.ts(57-75,123): param type mismatch (TEMPLATE_PROPS vs ARRAY_MUTATION_METHODS)
 *   4. hydration-utils.ts(12): typo п→ṅ in HydrationError type name
 *   5. wiring/types.ts(100,107): typo у→ү in ReactivePropsOnly type name
 *   6. attr-reflection.ts(105,110): ɩṡFɩṅіţė — isFinite is a global, not an import alias
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');

function fix(relPath, ...replacements) {
    const abs = path.join(ROOT, relPath);
    let src = readFileSync(abs, 'utf8');
    const original = src;
    for (const [from, to] of replacements) {
        if (typeof from === 'string') {
            src = src.replaceAll(from, to);
        } else {
            src = src.replace(from, to);
        }
    }
    if (src === original) {
        console.warn(`  WARNING: no change in ${relPath}`);
    } else {
        writeFileSync(abs, src);
        console.log(`  Fixed: ${relPath}`);
    }
}

// ─── 1. circular-module-dependencies.ts ─────────────────────────────────────
// __ёṡМөḋυļė is a renamed version of __esModule, but the interface declares __esModule.
// Revert just this one property access back to __esModule.
fix('packages/@lwc/engine-core/src/shared/circular-module-dependencies.ts', [
    '__ёṡМөḋυļė',
    '__esModule',
]);

// ─── 2. def.ts ───────────────────────────────────────────────────────────────
// The circular-module-dependencies module exports confusable-named functions.
// def.ts imports them by their original ASCII names, which no longer exist.
// Extract the actual export names and fix the import.
{
    const circSrc = readFileSync(
        path.join(ROOT, 'packages/@lwc/engine-core/src/shared/circular-module-dependencies.ts'),
        'utf8'
    );
    const exports = [...circSrc.matchAll(/^export function ([^\s<(]+)/gm)].map((m) => m[1]);
    // Expected: resolveⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү, isⅭıгⅽսӏαṙМөԁսļеḊёрėņԁėņсү
    const resolveFn = exports.find((e) => e.startsWith('resolve'));
    const isFn = exports.find((e) => e.startsWith('is'));
    if (!resolveFn || !isFn) {
        throw new Error(
            `Could not find expected exports in circular-module-dependencies.ts: ${exports}`
        );
    }

    fix(
        'packages/@lwc/engine-core/src/framework/def.ts',
        ['isCircularModuleDependency', isFn],
        ['resolveCircularModuleDependency', resolveFn]
    );
}

// ─── 3. freeze-template.ts ──────────────────────────────────────────────────
// getOriginalArrayMethod(prop) is typed as (typeof TEMPLATE_PROPS)[number] but
// the switch cases inside use ARRAY_MUTATION_METHODS values. Fix the param type.
{
    const freezeSrc = readFileSync(
        path.join(ROOT, 'packages/@lwc/engine-core/src/framework/freeze-template.ts'),
        'utf8'
    );

    // Extract the confusable name for TEMPLATE_PROPS and ARRAY_MUTATION_METHODS
    const tpMatch = freezeSrc.match(/const ([^\s=]+) = \[[\s\S]*?'renderMode'/);
    const amMatch = freezeSrc.match(/const ([^\s=]+) = \[[\s\S]*?'pop'/);
    if (!tpMatch || !amMatch) {
        throw new Error(
            'Could not find TEMPLATE_PROPS or ARRAY_MUTATION_METHODS const in freeze-template.ts'
        );
    }
    const templatePropsName = tpMatch[1];
    const arrayMutationName = amMatch[1];
    console.log(
        `  freeze-template: TEMPLATE_PROPS=${templatePropsName}, ARRAY_MUTATION_METHODS=${arrayMutationName}`
    );

    // Find the function whose param type uses TEMPLATE_PROPS and fix it to ARRAY_MUTATION_METHODS
    fix('packages/@lwc/engine-core/src/framework/freeze-template.ts', [
        `(typeof ${templatePropsName})[number]`,
        `(typeof ${arrayMutationName})[number]`,
    ]);
}

// ─── 4. hydration-utils.ts ──────────────────────────────────────────────────
// Variable declared as `НẏḋгαṫіөпЕŗṙоŗ[]` but interface is `НẏḋгαṫіөṅЕŗṙоŗ`.
// The typo is п (Cyrillic small en) vs ṅ (n with dot above) — fix by extracting
// the actual interface name from the file's own declaration.
{
    const src = readFileSync(
        path.join(ROOT, 'packages/@lwc/engine-core/src/framework/hydration-utils.ts'),
        'utf8'
    );
    const interfaceMatch = src.match(/^interface ([^\s{]+)/m);
    if (!interfaceMatch)
        throw new Error('Could not find interface declaration in hydration-utils.ts');
    const correctName = interfaceMatch[1];

    // Find the wrong name: whatever is used on the array declaration line that differs
    const varLineMatch = src.match(/let [^\s]+: (\S+)\[\]/);
    if (!varLineMatch)
        throw new Error('Could not find array variable declaration in hydration-utils.ts');
    const wrongName = varLineMatch[1];

    if (wrongName === correctName) {
        console.log('  hydration-utils.ts: names already match, skipping');
    } else {
        fix('packages/@lwc/engine-core/src/framework/hydration-utils.ts', [wrongName, correctName]);
    }
}

// ─── 5. wiring/types.ts ─────────────────────────────────────────────────────
// ReactivePropsOnly is used as ṘеαϲtɩvеṖṙοрşΟпļу but declared as ṘеαϲtɩvеṖṙοрşΟпļү
// (у vs ү — both are Unicode look-alikes). Fix by extracting the declared name.
{
    const src = readFileSync(
        path.join(ROOT, 'packages/@lwc/engine-core/src/framework/wiring/types.ts'),
        'utf8'
    );
    // Find all `type Xxx` declarations
    const allTypeDecls = [...src.matchAll(/^type ([^\s=<(]+)/gm)].map((m) => m[1]);
    console.log('  wiring/types.ts declared types:', allTypeDecls);

    // Find the one that appears in TS "Did you mean" — it's the correctly-declared one
    // TS error says: Cannot find name 'ṘеαϲtɩvеṖṙοрşΟпļу'. Did you mean 'ṘеαϲtɩvеṖṙοрşΟпļү'?
    // So ṘеαϲtɩvеṖṙοрşΟпļу is wrong, ṘеαϲtɩvеṖṙοрşΟпļү is correct
    // Find both in the file
    const usageMatch = src.match(/ṘеαϲtɩvеṖṙοрşΟпļ[уүУҮ]/g);
    if (usageMatch) {
        const unique = [...new Set(usageMatch)];
        console.log(
            '  wiring/types.ts ReactivePropsOnly variants found:',
            unique.map((s) => Buffer.from(s).toString('hex'))
        );
        if (unique.length === 2) {
            // The one in a `type X =` declaration is correct; the other is the typo
            const correctVariant = unique.find((v) => src.includes(`type ${v}`));
            const wrongVariant = unique.find((v) => !src.includes(`type ${v}`));
            if (correctVariant && wrongVariant) {
                fix('packages/@lwc/engine-core/src/framework/wiring/types.ts', [
                    wrongVariant,
                    correctVariant,
                ]);
            }
        } else if (unique.length === 1) {
            // Only the wrong variant exists — the type is declared differently?
            // Find by looking at `type` declarations that start with Ṙ
            const typeDecl = allTypeDecls.find((t) => t.startsWith('Ṙ') && t.includes('рş'));
            if (typeDecl) {
                fix('packages/@lwc/engine-core/src/framework/wiring/types.ts', [
                    unique[0],
                    typeDecl,
                ]);
            }
        }
    }
}

// ─── 6. attr-reflection.ts ──────────────────────────────────────────────────
// isFinite is a global built-in — it was never imported with an alias.
// The transform mistakenly renamed it. Replace ɩṡFɩṅіţė back to global isFinite.
fix('packages/@lwc/engine-core/src/libs/reflection/attr-reflection.ts', ['ɩṡFɩṅіţė', 'isFinite']);

console.log(
    '\nAll fixes applied. Run: yarn tsc --project packages/@lwc/engine-core/tsconfig.json --noEmit'
);
