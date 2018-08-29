const classProperty = require('@babel/plugin-proposal-class-properties')["default"];
const metadata = require('./metadata');
const component = require('./component');
const decorators = require('./decorators');

/**
 * Replace authored generic namespace reference
 *
 * same namespace import ex:
 * From: import { method } from 'c-utils';
 * To:   import { method } from 'namespace-utils'
 *
 * same namespace module import
 */
function namespaceReplaceVisitor(oldNamespace, newNamespace) {
    if (!oldNamespace || !newNamespace || !newNamespace.length) {
        return null;
    }
    return {
        ImportDeclaration(path) {
            if (!path.node || !path.node.source) {
                return;
            }

            const { node: { source } } = path;
            const { value } = source;

            if (!value || !value.length) {
                return;
            }

            // process gvp
            if (value.startsWith('@salesforce/')) {
                const newValue = replaceNamespaceInGvp(value, oldNamespace, newNamespace);
                if (newValue) {
                    source.value = newValue;
                }

            } else {
                const namespaceToReplace = oldNamespace + '-';
                if (value.startsWith(namespaceToReplace)) {
                    const regex = new RegExp(`^(${namespaceToReplace})?`);
                    source.value = value.replace(
                        regex,
                        newNamespace + '-'
                    );
                }
            }
        }
    };
}

function replaceNamespaceInGvp(resource, oldNamespace, newNamespace) {
    if (!resource || !oldNamespace || !newNamespace) {
        return;
    }

    const resourceParts = resource.split('/');
    const resourceType = resourceParts[1];
    const resourceValue = resourceParts[2];

    let replacedValue = resourceValue;

    switch(resourceType) {
        // @salesforce/label/c.label1 -> @salesforce/label/namespace.label1
        case 'label':
            if (resourceValue.startsWith(oldNamespace + '.')) {
                replacedValue = newNamespace + resourceValue.substr(oldNamespace.length);
                break;
            }
        // @salesforce/resource-url/resource1 -> @salesforce/resource-url/namespace__resource1
        case 'resource-url':
            replacedValue = newNamespace + '__' + resourceValue;
            break;

        // @salesforce/apex/MyClass.methodA -> @salesforce/apex/acme.MyClass.methodA
        case 'apex':
            // apex allows @salesforce/apex in which case we don't apply the namespace
            if (resourceValue) {
                replacedValue = newNamespace + '.' + resourceValue;
            }
            break;

        // @salesforce/schema/CustomObject1__c -> @salesforce/schema/acme__CustomObject1__c
        case 'schema':
            replacedValue = newNamespace + '__' + resourceValue;
            break;

        default:
            replacedValue = resourceValue;
    }

    resourceParts[2] = replacedValue;
    return resourceParts.join('/');
}

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api, config) {
    const { merge: mergeVisitors } = api.traverse.visitors;

    const { visitor: classPropertyVisitor } = classProperty(api, {
        loose: true
    });
    const visitors = [
        metadata(api),
        decorators(api),
        component(api),
        {
            Program: {
                exit(path, state) {
                    path.traverse(classPropertyVisitor, state);
                }
            }
        }
    ];

    if (config && config.namespaceMapping) {

        // perform import namespace replacement
        const namespaceMapping = config.namespaceMapping || {};

        Object.entries(namespaceMapping).forEach(([oldNamespace, newNamespace]) => {
            const visitor = namespaceReplaceVisitor(oldNamespace, newNamespace);
            if (visitor) {
                visitors.unshift(visitor);
            }
        });
    }

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('decorators');
            parserOpts.plugins.push('classProperties');
        },
        visitor: mergeVisitors(visitors)
    }
}
