const SALESFORCE_IMPORT_PREFIX = '@salesforce/';
const DEFAULT_SALESFORCE_NAMESPACE = 'c';

function getSalesforceNamespacedModule(moduleName, namespaceMapping) {
    // Escape early if no namespace mapping is provided
    const targetSalesforceNamespace =
        namespaceMapping[DEFAULT_SALESFORCE_NAMESPACE];
    if (targetSalesforceNamespace === undefined) {
        return moduleName;
    }

    const [prefix, type, value] = moduleName.split('/');

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

        // @salesforce/resource-url/resource1 -> @salesforce/resource-url/namespace__resource1
        case 'resource-url':
            // Only prefix with the namespace if no other namespace is provided
            if (!value.includes('__')) {
                updatedValue = `${targetSalesforceNamespace}__${value}`;
            }
            break;

        // @salesforce/apex/MyClass.methodA -> @salesforce/apex/acme.MyClass.methodA
        // TODO: Can an inner class be referenced? For example: @salesforce/apex/MyClass.MyInnerClass.myMethod
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
    }

    return [prefix, type, updatedValue].join('/');
}

function getStandardNamespacedModule(moduleName, namespaceMapping) {
    for (let [original, target] of Object.entries(namespaceMapping)) {
        if (moduleName.startsWith(`${original}-`)) {
            return moduleName.replace(`${original}-`, `${target}-`);
        }
    }

    // If namespace remapping is not needed return the original module name.
    return moduleName;
}

module.exports = function namespaceReplaceVisitor({ types: t }, config) {
    const { namespaceMapping = {} } = config;

    // Return an empty visitor if namespace don't need to be mapped
    if (!Object.keys(namespaceMapping).length) {
        return {};
    }

    return {
        ImportDeclaration(path) {
            const moduleName = path.node.source.value;

            let updatedModuleName = moduleName;
            if (moduleName.startsWith(SALESFORCE_IMPORT_PREFIX)) {
                updatedModuleName = getSalesforceNamespacedModule(
                    moduleName,
                    namespaceMapping,
                );
            } else {
                updatedModuleName = getStandardNamespacedModule(
                    moduleName,
                    namespaceMapping,
                );
            }

            if (moduleName !== updatedModuleName) {
                path
                    .get('source')
                    .replaceWith(t.stringLiteral(updatedModuleName));
            }
        },
    };
};
