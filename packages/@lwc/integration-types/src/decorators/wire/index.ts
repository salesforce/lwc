import { LightningElement, wire } from 'lwc';
import { TestAdapter, type TestValue } from './types';

// @ts-expect-error bare decorator cannot be used
wire(FakeWireAdapter, { config: 'config' })();

// @ts-expect-error decorator cannot be used on classes
@wire(FakeWireAdapter, { config: 'config' })
export class InvalidUsage extends LightningElement {}

/** Ensure that components extending other components correctly use the hosting component's props */
export class BaseComponent extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
}

export class ExtensionComponent extends BaseComponent {
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    basic?: TestValue;
    @wire(TestAdapter, { config: '$configProp' })
    simpleReactive?: TestValue;
    @wire(TestAdapter, { config: '$nested.prop' })
    nestedReactive?: TestValue;

    // --- INVALID --- //
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' } as const)
    nonExistentReactiveProp?: TestValue;
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$number' } as const)
    numberReactiveProp?: TestValue;
}
