import type { WireAdapterConstructor } from 'lwc';

export interface TestConfig {
    config: 'config';
}
export interface TestValue {
    value: 'value';
}
export interface TestContext {
    context: 'context';
}
export interface DeepConfig {
    deep: { config: number };
}

export declare const testConfig: TestConfig;
export declare const testValue: TestValue;
export declare const TestAdapter: WireAdapterConstructor<TestConfig, TestValue, TestContext>;
export declare const TestAdapterNoConfig: WireAdapterConstructor<never, TestValue, TestContext>;
export declare const TestAdapterWithImperative: {
    (config: TestConfig): TestValue;
    adapter: WireAdapterConstructor<TestConfig, TestValue, TestContext>;
};
export declare const AnyAdapter: any;
export declare const InvalidAdapter: object;
export declare const DeepConfigAdapter: WireAdapterConstructor<DeepConfig, TestValue>;
