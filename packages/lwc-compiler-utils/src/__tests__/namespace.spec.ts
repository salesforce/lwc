import { applyNamespaceAliasingToModule, applyNamespaceAliasingToTypedResource, applyNamespaceAliasingToScopedResource } from '../namespace-utils';

const DEFAULT_NAMESPACE_MAPPING = { c: 'nsC' };

describe('namespace', () => {

    describe('invalid invocation', () => {
        test('should not namespace alias resource if namespace mapping is not provided', () => {
            const expected = 'x/foo';
            const actual = applyNamespaceAliasingToTypedResource('x/foo', undefined, undefined);
            expect(actual).toBe(expected);
        });

        test('should not namespace alias scoped resource if mapping is missing', () => {
            const expected = '@salesforce/label/c.label';

            const actual = applyNamespaceAliasingToScopedResource('@salesforce/label/c.label', undefined);
            expect(actual).toBe(expected);
        });

        test('should not namespace alias scoped resource if id is missing', () => {
            const expected = '@salesforce/label/nsC.label';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/label/c.label', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });
    });

    describe('namespace resource', () => {
        test('should namespace alias unscoped resource', () => {
            const expected = 'nsC/foo';
            const actual = applyNamespaceAliasingToTypedResource('c/foo', undefined, DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should namespace alias standard module', () => {
            const expected = 'nsC/foo';
            const actual = applyNamespaceAliasingToModule('c/foo', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should not replace references if it does not match fully', () => {
           const expected = 'abc-utils';
           const actual = applyNamespaceAliasingToTypedResource('abc-utils', undefined, DEFAULT_NAMESPACE_MAPPING);
           expect(actual).toBe(expected);
        });
        test('should not replace import the namespace if it is not at the beginning of the module name', () => {
            const expected = './module/c-inner/property';
            const actual = applyNamespaceAliasingToTypedResource('./module/c-inner/property', undefined, DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
         });
    });

    describe('namespace scoped resource', () => {

        test('should replace default namespace', () => {
            const expected = '@salesforce/label/nsC.label';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/label/c.label', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should replace default namespace', () => {
            const expected = '@salesforce/label/nsC.label';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/label/c.label', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should keep original namespace untouched', () => {
            const expected = '@salesforce/label/othernamespace.label';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/label/othernamespace.label', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });
    });

    describe('namespace resourceUrl resource', () => {
        test('should add namespace if not present', () => {
            const expected = '@salesforce/resourceUrl/nsC__resource';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/resourceUrl/resource', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should ignore import if namespace if already present', () => {
            const expected = '@salesforce/resource-url/anotherNs__resource'
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/resource-url/anotherNs__resource', { c: 'anotherNs' });
            expect(actual).toBe(expected);
        });
    });

    describe('namespace apex resource', () => {
        test('should add namespace if not present', () => {
            const expected = '@salesforce/apex/nsC.MyClass.methodA';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/apex/MyClass.methodA', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should ignore import if namespace if already present', () => {
            const expected = '@salesforce/apex/anotherNamespace.MyClass.methodA';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/apex/anotherNamespace.MyClass.methodA', { c: 'anotherNs' });
            expect(actual).toBe(expected);
        });
    });

    describe('namespace schema resource', () => {
        test('should add namespace if not present', () => {
            const expected = '@salesforce/schema/nsC__CustomObject__c';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/CustomObject__c', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should add namespace on custom fields on standard objects', () => {
            const expected = '@salesforce/schema/Account.nsC__CustomField__c';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/Account.CustomField__c', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should add namespace on custom relationships on standard object', () => {
            const expected = '@salesforce/schema/Account.nsC__Relation__r.Name';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/Account.Relation__r.Name', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should ignore standard object and relationships', () => {
            const expected = '@salesforce/schema/Contact.Account.Name';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/Contact.Account.Name', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should handle mixed standard and custom relationships', () => {
            const expected = '@salesforce/schema/nsC__CustomObject__c.nsC__parentContact__r.Account.Name';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/CustomObject__c.parentContact__r.Account.Name', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should not add a namespace to a custom object with an existing namespace', () => {
            const expected = '@salesforce/schema/ns__CustomObject__c';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/ns__CustomObject__c', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should not add a namespace to a custom field with an existing namespace', () => {
            const expected = '@salesforce/schema/Account.ns__CustomField__c';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/Account.ns__CustomField__c', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });

        test('should not add a namespace to a custom relationship with an existing namespace', () => {
            const expected = '@salesforce/schema/Account.ns__Relation__r.Name';
            const actual = applyNamespaceAliasingToScopedResource('@salesforce/schema/Account.ns__Relation__r.Name', DEFAULT_NAMESPACE_MAPPING);
            expect(actual).toBe(expected);
        });
    });
});
