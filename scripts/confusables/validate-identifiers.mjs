#!/usr/bin/env node

import { CONFUSABLES } from './confusables-map.mjs';

console.log('Validating JavaScript identifier compatibility...\n');

const invalid = [];

// JavaScript identifier regex (simplified)
// Start: Unicode letter or $ or _
// Continue: Unicode letter, digit, $ or _
const ID_START_REGEX = /^[\p{L}\p{Nl}$_]/u;
const ID_CONTINUE_REGEX = /^[\p{L}\p{Nl}\p{Nd}\p{Mn}\p{Mc}\p{Pc}$_]/u;

// Test each confusable character
for (const [ascii, alternatives] of Object.entries(CONFUSABLES)) {
    alternatives.forEach((char) => {
        const codePoint = char.codePointAt(0);
        const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');

        // Test as start character
        if (!ID_START_REGEX.test(char)) {
            invalid.push({
                ascii,
                char,
                hex: `U+${hex}`,
                position: 'start',
                issue: 'Not a valid ID_Start character',
            });
        }

        // Test as continue character
        if (!ID_CONTINUE_REGEX.test(char)) {
            invalid.push({
                ascii,
                char,
                hex: `U+${hex}`,
                position: 'continue',
                issue: 'Not a valid ID_Continue character',
            });
        }
    });
}

if (invalid.length === 0) {
    console.log('✅ All confusable characters are valid JavaScript identifiers!');
    console.log(`   Tested ${Object.values(CONFUSABLES).flat().length} characters\n`);
} else {
    console.log(`❌ Found ${invalid.length} invalid characters:\n`);
    const grouped = {};
    invalid.forEach((item) => {
        const key = `${item.ascii} → "${item.char}" (${item.hex})`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(`${item.position}: ${item.issue}`);
    });

    Object.entries(grouped).forEach(([key, issues]) => {
        console.log(`  ${key}`);
        issues.forEach((issue) => console.log(`    ${issue}`));
        console.log();
    });
}

process.exit(invalid.length > 0 ? 1 : 0);
