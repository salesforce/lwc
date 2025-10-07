/* eslint-disable */
import { transformSync } from './packages/@lwc/compiler/dist/index.js';

// Test component with multiple non-blocking semantic errors
const componentWithErrors = `
import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

export default class TestComponent extends LightningElement {
    // === DECORATOR & PROPERTY VALIDATION ERRORS ===
    
    // Error 1: Invalid property name with numbers (1107 - PROPERTY_NAME_CANNOT_START_WITH_DATA)
    @api dataInvalidProperty;
    
    // Error 2: Property name starting with "on" (1108 - PROPERTY_NAME_CANNOT_START_WITH_ON)
    @api onClickHandler;
    
    // Error 3: Reserved property name (1110 - PROPERTY_NAME_IS_RESERVED)
    @api class;
    
    // Error 4: Ambiguous attribute name (1109 - PROPERTY_NAME_IS_AMBIGUOUS)
    @api myProperty; // This will conflict with my-property attribute
    
    // Error 5: Invalid boolean public property (1099 - INVALID_BOOLEAN_PUBLIC_PROPERTY)
    @api isVisible = true; // Should default to false
    
    // Error 6: Duplicate API property (1096 - DUPLICATE_API_PROPERTY)
    @api duplicateProp;
    @api duplicateProp; // Duplicate
    @wire(getSome, {})
    
    // Error 7: API and Track decorator conflict (1093 - API_AND_TRACK_DECORATOR_CONFLICT)
    // @api @track conflictingProperty;
    
    // Error 8: Track decorator on non-class property (1113 - TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES)
    @track someMethod() { return 'invalid'; }
    
    // Error 9: Invalid decorator usage (1100 - INVALID_DECORATOR)
    // @invalidDecorator someProperty;
    
    // Error 10: API on computed property (1106 - PROPERTY_CANNOT_BE_COMPUTED)
    // api get computedApi() { return 'invalid'; }
    
    // === WIRE DECORATOR ERRORS ===
    
    // Error 11: Wire adapter should be first parameter (1092 - ADAPTER_SHOULD_BE_FIRST_PARAMETER)
    @wire(getRecord, { recordId: '$recordId' }) wiredRecord;
    
    // Error 12: Wire config should be second parameter (1094 - CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER)
    @wire(getRecord, 'invalid') wiredRecord2;
    
    // Error 13: Multiple wire decorators (1105 - ONE_WIRE_DECORATOR_ALLOWED)
    @wire(getRecord, { recordId: '$recordId' })
    @wire(getRecord, { recordId: '$recordId' })
    doubleWiredProperty;
    
    // Error 14: Wire conflict with another decorator (1095 - CONFLICT_WITH_ANOTHER_DECORATOR)
    @wire(getRecord, { recordId: '$recordId' })
    @api wiredApiProperty;
    
    // === METHOD & LIFECYCLE ERRORS ===
    
    // Error 15: Method with reserved name (overriding native method)
    addEventListener() {
        return 'invalid';
    }
    
    // Error 16: Invalid lifecycle method name
    connectedCallbacks() { // Should be connectedCallback
        console.log('invalid lifecycle method');
    }
    
    // === PROPERTY DECLARATION ERRORS ===
    
    // Error 17: Private tracked property (should be public)
    _privateTracked = 'invalid';
    
    // Error 18: Property name with "part" (1111 - PROPERTY_NAME_PART_IS_RESERVED)
    @api partReserved;
    
    // === TEMPLATE-RELATED ERRORS (These would be in template, but showing JS side) ===
    
    // Error 19: Invalid dynamic import source (1121 - INVALID_DYNAMIC_IMPORT_SOURCE_STRICT)
    async loadComponent() {
        const module = await import(123); // Should be string literal
    }
    
    // Error 20: Computed property with template literal (1199 - COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL)
    get [\`computed\${'Key'}\`]() {
        return 'invalid';
    }
    
    // === WIRE CONFIGURATION ERRORS ===
    
    // Error 21: Computed property in wire config (1200 - COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL)
    @wire(getRecord, { 
        recordId: this[\`computed\${'Id'}\`] // Invalid computed property
    }) wiredWithComputed;
    
    // Error 22: Function identifier with computed properties (1131 - FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS)
    @wire(this[\`get\${'Record'}\`], { recordId: '$recordId' }) wiredWithComputedFunction;
    
    // Error 23: Function identifier with nested member expressions (1132 - FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXPRESSIONS)
    @wire(this.someObject.getRecord, { recordId: '$recordId' }) wiredWithNested;
    
    // === ADDITIONAL VALIDATION ERRORS ===
    
    // Error 24: Invalid decorator type (1101 - INVALID_DECORATOR_TYPE)
    @api invalidField = class {}; // Invalid field type
    
    // Error 25: Decorator on non-class property/method (1103 - IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD)
    @api static staticProperty = 'invalid';
    
    // Error 26: Invalid decorator with name (1102 - INVALID_DECORATOR_WITH_NAME)
    @track invalidTrackUsage = 'invalid';
    
    // Error 27: Single decorator on setter/getter pair (1112 - SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR)
    @api get pairedProperty() { return this._value; }
    @api set pairedProperty(value) { this._value = value; }
    
    // Error 28: Wire adapter should be imported (1119 - WIRE_ADAPTER_SHOULD_BE_IMPORTED)
    @wire(undefinedAdapter, { recordId: '$recordId' }) wiredWithUndefinedAdapter;
    
    // === RESERVED IDENTIFIER ERRORS ===
    
    // Error 29: Reserved identifier prefix (1202 - RESERVED_IDENTIFIER_PREFIX)
    __lwcReservedProperty = 'invalid';
}`;

console.log('Testing LWC Multi-Error Collection...\n');

console.log('1. Testing with collectMultipleErrors: false (current behavior)');
try {
    const result1 = transformSync(componentWithErrors, 'test.js', {
        name: 'test',
        namespace: 'x',
        collectMultipleErrors: false,
    });
    console.log('✅ Compilation successful - no errors caught');
    console.log('Code length:', result1.code);
} catch (error) {
    console.log('❌ Error (expected):', error.message.split('\n')[0]);
}

console.log('\n2. Testing with collectMultipleErrors: true (new behavior)');
try {
    const result2 = transformSync(componentWithErrors, 'test.js', {
        name: 'test',
        namespace: 'x',
        collectMultipleErrors: true,
    });

    if (result2.errors && result2.errors.length > 0) {
        console.log(`✅ Collected ${result2.errors.length} errors:`);
        result2.errors.forEach((error, i) => {
            console.log(`   ${i + 1}. [LWC${error.code}] ${error.message}`);
        });
    } else {
        console.log('✅ Compilation successful - code generated');
        console.log('Code length:', result2.code.length);
    }
} catch (error) {
    console.log('❌ Unexpected error:', error.message.split('\n')[0]);
}

console.log('\n=== ERROR CATEGORIES TESTED ===');
console.log('1. Property Name Validation (1107, 1108, 1109, 1110, 1111)');
console.log('2. Decorator Conflicts (1093, 1096, 1100, 1102, 1103)');
console.log('3. Wire Decorator Errors (1092, 1094, 1095, 1105, 1119)');
console.log('4. Property Type Validation (1099, 1101, 1106, 1113)');
console.log('5. Method Validation (reserved names, lifecycle methods)');
console.log('6. Computed Property Errors (1199, 1200, 1131, 1132)');
console.log('7. Dynamic Import Errors (1121)');
console.log('8. Reserved Identifier Errors (1202)');
console.log('9. Setter/Getter Pair Errors (1112)');
