const SALESFORCE_IMPORT_PREFIX = '@salesforce/';
const DEFAULT_SALESFORCE_NAMESPACE = 'c';

export function getNamespacedResourceForModule(moduleName: string, namespaceMapping: {[name: string]: string}) {
    return getNamespacedResourceForTypedResource(moduleName, undefined, namespaceMapping);
}

export function getNamespacedResourceForTypedResource(moduleName: string, moduleType: string | undefined, namespaceMapping: {[name: string]: string}) {
    let updatedModuleName = moduleName;

    if (moduleType && moduleType !== 'module') {
        updatedModuleName = getSalesforceNamespacedModule(
            moduleName,
            moduleType,
            namespaceMapping,
        );
    } else {
        updatedModuleName = getStandardNamespacedModule(
            moduleName,
            namespaceMapping,
        );
    }
    return updatedModuleName;
}

export function getNamespacedResourceForScopedResource(moduleName: string, namespaceMapping: {[name: string]: string}) {
    let updatedModuleName = moduleName;
    if (moduleName.startsWith(SALESFORCE_IMPORT_PREFIX)) {
        const [prefix, type, value] = moduleName.split('/');
        const updateModuleId = getSalesforceNamespacedModule(
            value,
            type,
            namespaceMapping,
        );
        updatedModuleName = [prefix, type, updateModuleId].join('/');
    } else {
        updatedModuleName = getStandardNamespacedModule(
            moduleName,
            namespaceMapping,
        );
    }

    return updatedModuleName;
}

function getSalesforceNamespacedModule(value: string, type: string, namespaceMapping: {[name: string]: string}) {

    if (value === undefined || type === undefined || !namespaceMapping) {
        return value;
    }

    const targetSalesforceNamespace = namespaceMapping[DEFAULT_SALESFORCE_NAMESPACE];
    if (targetSalesforceNamespace === undefined) {
        return value;
    }

    let updatedValue = value;
    switch (type) {
        // @salesforce/label/c.label1 -> @salesforce/label/namespace.label1
        case 'label':
            if (value.startsWith(`${DEFAULT_SALESFORCE_NAMESPACE}.`)) {
                updatedValue = value.replace(
                    `${DEFAULT_SALESFORCE_NAMESPACE}.`,
                    `${targetSalesforceNamespace}.`,
                );
            }
            break;

        // @salesforce/resourceUrl/resource1 -> @salesforce/resourceUrl/namespace__resource1
        case 'resourceUrl':
            // Only prefix with the namespace if no other namespace is provided
            if (!value.includes('__')) {
                updatedValue = `${targetSalesforceNamespace}__${value}`;
            }
            break;

        // @salesforce/apex/MyClass.methodA -> @salesforce/apex/acme.MyClass.methodA
        case 'apex':
            // We detect if the apex reference already contains the namespace by checking the number of parts in it's
            // reference. If the namespace is present the value would have the following from <ns>.<class>.<method>
            // otherwise it would be <class>.<method>.
            const parts = value.split('.');
            if (parts.length === 2) {
                updatedValue = `${targetSalesforceNamespace}.${value}`;
            }
            break;

        // @salesforce/schema/CustomObject1__c -> @salesforce/schema/acme__CustomObject1__c
        // @salesforce/schema/Account.CustomField__c -> @salesforce/schema/Account.acme__CustomField__c
        // @salesforce/schema/Account.Relationship__r.CustomField__c -> @salesforce/schema/Account.acme__Relationship__r.acme__CustomField__c
        case 'schema':
            // For each object, field and relationship that is part of the module name, if it is custom and has no
            // namespace, we need to add the target namespace.
            updatedValue = value
                .split('.')
                .map(part => {
                    const isCustom = part.endsWith('__c') || part.endsWith('__r');
                    const isNotNamespaced = part.split('__').length < 3;

                    return isCustom && isNotNamespaced
                        ? `${targetSalesforceNamespace}__${part}`
                        : part;
                })
                .join('.');
            break;

        case 'componentTagName':
            if (value.startsWith(`${DEFAULT_SALESFORCE_NAMESPACE}-`)) {
                updatedValue = value.replace(
                    `${DEFAULT_SALESFORCE_NAMESPACE}`,
                    `${targetSalesforceNamespace}`,
                );
            }
            break;
    }

    return updatedValue;
}

function getStandardNamespacedModule(moduleName: string, namespaceMapping: {[name: string]: string}) {
    if (!name || !namespaceMapping) {
        return moduleName;
    }

    for (const [original, target] of Object.entries(namespaceMapping)) {
        if (moduleName.startsWith(`${original}/`)) {
            return moduleName.replace(`${original}/`, `${target}/`);
        }
    }

    // If namespace remapping is not needed return the original module name.
    return moduleName;
}
