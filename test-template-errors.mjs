/* eslint-disable */
import { transformSync } from './packages/@lwc/compiler/dist/index.js';

// Test template with multiple errors
const templateWithErrors = `
<template>
    <div lwc:invalid-directive="test"></div>
    <span lwc:another-invalid="test"></span>
    <p lwc:yet-another-invalid="test"></p>
</template>
`;

console.log('Testing Template Multiple Error Collection...\n');

console.log('1. Testing with collectMultipleErrors: false (current behavior)');
try {
    const result1 = transformSync(templateWithErrors, 'test.html', {
        name: 'test',
        namespace: 'x',
        collectMultipleErrors: false,
    });
    console.log('✅ Compilation successful - no errors caught');
    console.log('Code length:', result1.code.length);
} catch (error) {
    console.log('❌ Error (expected):', error.message.split('\n')[0]);
}

console.log('\n2. Testing with collectMultipleErrors: true (new behavior)');
try {
    const result2 = transformSync(templateWithErrors, 'test.html', {
        name: 'test',
        namespace: 'x',
        collectMultipleErrors: true,
    });

    if (result2.errors && result2.errors.length > 0) {
        console.log(`✅ Collected ${result2.errors.length} errors:`);
        result2.errors.forEach((error, i) => {
            console.log(`   ${i + 1}. [LWC${error.code}] ${error.message}`);
        });
        console.log(`   Fatal: ${result2.fatal}`);
        console.log(`   Code generated: ${result2.code.length > 0 ? 'Yes' : 'No'}`);
    } else {
        console.log('✅ Compilation successful - code generated');
        console.log('Code length:', result2.code.length);
    }
} catch (error) {
    console.log('❌ Unexpected error:', error.message.split('\n')[0]);
}

console.log('\n3. Testing backward compatibility (collectMultipleErrors: undefined)');
try {
    const result3 = transformSync(templateWithErrors, 'test.html', {
        name: 'test',
        namespace: 'x',
        // collectMultipleErrors not specified
    });
    console.log('✅ Compilation successful - no errors caught');
    console.log('Code length:', result3.code.length);
} catch (error) {
    console.log('❌ Error (expected):', error.message.split('\n')[0]);
}

console.log('\n4. Testing with valid template (no errors)');
const validTemplate = `
<template>
    <div>Hello World</div>
    <span>This is valid</span>
</template>
`;

try {
    const result4 = transformSync(validTemplate, 'test.html', {
        name: 'test',
        namespace: 'x',
        collectMultipleErrors: true,
    });

    if (result4.errors && result4.errors.length > 0) {
        console.log(`❌ Unexpected errors found: ${result4.errors.length}`);
        result4.errors.forEach((error, i) => {
            console.log(`   ${i + 1}. [LWC${error.code}] ${error.message}`);
        });
    } else {
        console.log('✅ Valid template compiled successfully');
        console.log('Code length:', result4.code.length);
        console.log('Warnings:', result4.warnings ? result4.warnings.length : 0);
    }
} catch (error) {
    console.log('❌ Unexpected error:', error.message.split('\n')[0]);
}

console.log('\n=== TEMPLATE ERROR COLLECTION TEST COMPLETE ===');
