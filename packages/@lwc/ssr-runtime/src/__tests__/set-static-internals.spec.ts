import { describe, test, expect, beforeEach } from 'vitest';
import { setStaticInternals } from '../set-static-internals';
import {
    LightningElement,
    SYMBOL__GENERATE_MARKUP,
    SYMBOL__DEFAULT_TEMPLATE,
} from '../lightning-element';

describe('setStaticInternals', () => {
    beforeEach(() => {
        if (!(globalThis as any).lwcRuntimeFlags) {
            (globalThis as any).lwcRuntimeFlags = {};
        }
    });

    test('sets __lwcPublicProperties__ on component', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(
            TestComponent as any,
            'x-test',
            ['prop1', 'prop2'],
            [],
            'sync',
            undefined
        );

        expect((TestComponent as any).__lwcPublicProperties__).toBeInstanceOf(Set);
        expect([...(TestComponent as any).__lwcPublicProperties__]).toContain('prop1');
        expect([...(TestComponent as any).__lwcPublicProperties__]).toContain('prop2');
    });

    test('merges public props from superclass', () => {
        class BaseComponent extends LightningElement {}
        setStaticInternals(BaseComponent as any, 'x-base', ['baseProp'], [], 'sync', undefined);

        class ChildComponent extends BaseComponent {}
        setStaticInternals(ChildComponent as any, 'x-child', ['childProp'], [], 'sync', undefined);

        const props = [...(ChildComponent as any).__lwcPublicProperties__];
        expect(props).toContain('baseProp');
        expect(props).toContain('childProp');
    });

    test('sets SYMBOL__GENERATE_MARKUP for sync mode', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', undefined);

        expect((TestComponent as any)[SYMBOL__GENERATE_MARKUP]).toBeInstanceOf(Function);
    });

    test('sets SYMBOL__GENERATE_MARKUP for asyncYield mode', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'asyncYield', undefined);

        expect((TestComponent as any)[SYMBOL__GENERATE_MARKUP]).toBeInstanceOf(Function);
    });

    test('sets SYMBOL__DEFAULT_TEMPLATE when provided', () => {
        class TestComponent extends LightningElement {}
        const mockTemplate = () => 'test';

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', mockTemplate as any);

        expect((TestComponent as any)[SYMBOL__DEFAULT_TEMPLATE]).toBe(mockTemplate);
    });

    test('does not set SYMBOL__DEFAULT_TEMPLATE when undefined', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', undefined);

        expect((TestComponent as any)[SYMBOL__DEFAULT_TEMPLATE]).toBeUndefined();
    });

    test('generated markup function handles null props and attrs', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, null, null, undefined, null, {});

        expect(result).toContain('<x-test');
        expect(result).toContain('</x-test>');
    });

    test('generated markup function uses default tag name when tagName is null', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-custom-default', [], [], 'sync', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('<x-custom-default');
        expect(result).toContain('</x-custom-default>');
    });

    test('generated markup function uses provided tag name over default', () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-default', [], [], 'sync', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup('x-override', {}, {}, undefined, null, {});

        expect(result).toContain('<x-override');
        expect(result).toContain('</x-override>');
    });

    test('component with connectedCallback executes it during markup generation', () => {
        let callbackExecuted = false;

        class TestComponent extends LightningElement {
            connectedCallback() {
                callbackExecuted = true;
            }
        }

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        generateMarkup(null, {}, {}, undefined, null, {});

        expect(callbackExecuted).toBe(true);
    });

    test('component with render function uses custom template', () => {
        class TestComponent extends LightningElement {
            render() {
                return () => 'custom-content';
            }
        }

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('custom-content');
    });

    test('component uses default template when no render function', () => {
        class TestComponent extends LightningElement {}

        const defaultTemplate = () => 'default-template-content';

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'sync', defaultTemplate as any);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('default-template-content');
    });

    test('asyncYield mode generates async markup', async () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'asyncYield', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const generator = generateMarkup(null, null, null, undefined, null, {});

        const chunks: string[] = [];
        for await (const chunk of generator) {
            chunks.push(chunk);
        }

        const result = chunks.join('');
        expect(result).toContain('<x-test');
        expect(result).toContain('</x-test>');
    });

    test('asyncYield mode with custom tagName', async () => {
        class TestComponent extends LightningElement {}

        setStaticInternals(TestComponent as any, 'x-default', [], [], 'asyncYield', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const generator = generateMarkup('x-custom', {}, {}, undefined, null, {});

        const chunks: string[] = [];
        for await (const chunk of generator) {
            chunks.push(chunk);
        }

        const result = chunks.join('');
        expect(result).toContain('<x-custom');
        expect(result).toContain('</x-custom>');
    });

    test('asyncYield mode executes connectedCallback', async () => {
        let callbackExecuted = false;

        class TestComponent extends LightningElement {
            connectedCallback() {
                callbackExecuted = true;
            }
        }

        setStaticInternals(TestComponent as any, 'x-test', [], [], 'asyncYield', undefined);

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const generator = generateMarkup(null, {}, {}, undefined, null, {});

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of generator) {
            // consume generator
        }

        expect(callbackExecuted).toBe(true);
    });

    test('component with wire adapter - callable adapter format', () => {
        class MockWireAdapter {
            constructor(public dataCallback: (value: unknown) => void) {}
            connect() {}
            update(_config: object, _context: unknown) {}
        }

        const wireAdapters = [
            {
                adapter: { adapter: MockWireAdapter },
                dataCallback: (_cmp: LightningElement) => (_value: unknown) => {},
                config: (_cmp: LightningElement) => ({}),
            },
        ];

        class TestComponent extends LightningElement {}

        setStaticInternals(
            TestComponent as any,
            'x-test',
            [],
            wireAdapters as any,
            'sync',
            undefined
        );

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('<x-test');
    });

    test('component with wire adapter - direct constructor format', () => {
        class MockWireAdapter {
            constructor(public dataCallback: (value: unknown) => void) {}
            connect() {}
            update(_config: object, _context: unknown) {}
        }

        const wireAdapters = [
            {
                adapter: MockWireAdapter,
                dataCallback: (_cmp: LightningElement) => (_value: unknown) => {},
                config: (_cmp: LightningElement) => ({}),
            },
        ];

        class TestComponent extends LightningElement {}

        setStaticInternals(
            TestComponent as any,
            'x-test',
            [],
            wireAdapters as any,
            'sync',
            undefined
        );

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('<x-test');
    });

    test('component with wire adapter without connect method', () => {
        class MockWireAdapter {
            constructor(public dataCallback: (value: unknown) => void) {}
            update(_config: object, _context: unknown) {}
        }

        const wireAdapters = [
            {
                adapter: MockWireAdapter,
                dataCallback: (_cmp: LightningElement) => (_value: unknown) => {},
                config: (_cmp: LightningElement) => ({}),
            },
        ];

        class TestComponent extends LightningElement {}

        setStaticInternals(
            TestComponent as any,
            'x-test',
            [],
            wireAdapters as any,
            'sync',
            undefined
        );

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('<x-test');
    });

    test('component with wire adapter without update method', () => {
        class MockWireAdapter {
            constructor(public dataCallback: (value: unknown) => void) {}
            connect() {}
        }

        const wireAdapters = [
            {
                adapter: MockWireAdapter,
                dataCallback: (_cmp: LightningElement) => (_value: unknown) => {},
                config: (_cmp: LightningElement) => ({}),
            },
        ];

        class TestComponent extends LightningElement {}

        setStaticInternals(
            TestComponent as any,
            'x-test',
            [],
            wireAdapters as any,
            'sync',
            undefined
        );

        const generateMarkup = (TestComponent as any)[SYMBOL__GENERATE_MARKUP];
        const result = generateMarkup(null, {}, {}, undefined, null, {});

        expect(result).toContain('<x-test');
    });
});
