import { LightningElement, wire } from 'lwc';
import { AnyAdapter, ImperativeAdapter, TestAdapter, type TestValue } from './types';

// @ts-expect-error bare decorator cannot be used
wire(AnyAdapter, { config: 'config' })();

// @ts-expect-error decorator cannot be used on classes
@wire(AnyAdapter, { config: 'config' })
export class InvalidUsage extends LightningElement {}

// Imperative adapters *can* be used directly
ImperativeAdapter({ config: 'config' }) satisfies TestValue;
// @ts-expect-error no reactive props
ImperativeAdapter({ config: '$configProp' });
// @ts-expect-error extra config prop
ImperativeAdapter({ config: 'config', extra: 'val' });
// @ts-expect-error missing config prop
ImperativeAdapter({});
// @ts-expect-error missing param
ImperativeAdapter();

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
