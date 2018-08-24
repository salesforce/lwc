const api = require('./api');
const wire = require('./wire');
const track = require('./track');

const { LWC_PACKAGE_ALIAS, DECORATOR_TYPES } = require('../constants');
const { getEngineImportSpecifiers, isClassMethod, isSetterClassMethod, isGetterClassMethod } = require('../utils');

const DECORATOR_TRANSFORMS = [
    api,
    wire,
    track
];

function isLwcDecoratorName(name) {
    return DECORATOR_TRANSFORMS.some(transform => transform.name === name);
}

/** Returns a list of all the references to an identifier */
function getReferences(identifier) {
    return identifier.scope.getBinding(identifier.node.name).referencePaths;
}

/** Returns the type of decorator depending on the property or method if get applied to */
function getDecoratorType(propertyOrMethod) {
    console.log('-----> decorator: ', propertyOrMethod)
    if (isClassMethod(propertyOrMethod)) {
        return DECORATOR_TYPES.METHOD;
    } else if (isGetterClassMethod(propertyOrMethod)) {
        return DECORATOR_TYPES.GETTER;
    } else if (isSetterClassMethod(propertyOrMethod)) {
        return DECORATOR_TYPES.SETTER;
    } else if (propertyOrMethod.isClassProperty()) {
        return DECORATOR_TYPES.PROPERTY;
    } else {
        throw propertyOrMethod.buildCodeFrameError(`Invalid property of field type`);
    }
}

/** Returns a list of all the LWC decorators usages */
function getLwcDecorators(importSpecifiers) {
    return importSpecifiers.reduce((acc, { name, path }) => {
        // Get a list of all the  local references
        const local = path.get('imported');
        const references = getReferences(local).map(reference => ({
            name,
            reference
        }))

        return [...acc, ...references];
    }, []).map(({ name, reference }) => {
        // Get the decorator from the identifier
        // If the the decorator is:
        //   - an identifier @track : the decorator is the parent of the identifier
        //   - a call expression @wire("foo") : the decorator is the grand-parent of the identifier
        let decorator = reference.parentPath.isDecorator() ?
            reference.parentPath:
            reference.parentPath.parentPath;

        if (!decorator.isDecorator()) {
            throw decorator.buildCodeFrameError(`"${name}" can only be used as a class decorator`);
        }

        const propertyOrMethod = decorator.parentPath;
        if (!propertyOrMethod.isClassProperty() && !propertyOrMethod.isClassMethod()) {
            throw propertyOrMethod.buildCodeFrameError(`"@${name}" can only be applied on class properties`);
        }

        return {
            name,
            path: decorator,
            type: getDecoratorType(propertyOrMethod)
        };
    });
}

/** Group decorator per class */
function groupDecorator(decorators) {
    return decorators.reduce((acc, decorator) => {
        const classPath = decorator.path.findParent(node => node.isClass());

        if (acc.has(classPath)) {
            acc.set(classPath, [...acc.get(classPath), decorator]);
        } else {
            acc.set(classPath, [decorator]);
        }

        return acc;
    }, new Map());
}

/** Validate the usage of decorator by calling each validation function */
function validate(klass, decorators) {
    DECORATOR_TRANSFORMS.forEach(({ validate }) => validate(klass, decorators));
}

/** Transform the decorators and returns the metadata */
function transform(t, klass, decorators) {
    return DECORATOR_TRANSFORMS.reduce((metadata, { transform }) => {
        const decoratorMetadata = transform(t, klass, decorators);

        if (decoratorMetadata) {
            metadata.push(decoratorMetadata);
        }

        return metadata;
    }, []);
}

/** Remove all the decorators */
function removeDecorators(decorators) {
    for (let { path } of decorators) {
        path.remove();
    }
}

/** Remove import specifiers. It also removes the import statement if the specifier list becomes empty */
function removeImportSpecifiers(specifiers) {
    for (let { path } of specifiers) {
        const importStatement = path.parentPath;
        path.remove();

        if (importStatement.get('specifiers').length === 0) {
            importStatement.remove();
        }
    }
}

function getClassBodyDecorators(path) {
    // const body = path.get('body');
    // const decorators = body.node.body[0].decorators;
    // return decorators.map((d) => d.expression.name);
    return ['track'];
}

module.exports = function decoratorVisitor({ types: t }) {
    return {
        Program(path, state) {
            console.log('----> ENTERING PROGRAM')
            const engineImportSpecifiers = getEngineImportSpecifiers(path);

            const decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) => (
                isLwcDecoratorName(name)
            ));



            const decorators = getLwcDecorators(decoratorImportSpecifiers);
            console.log('decorators: ', decorators);
            state.file.metadata = Object.assign({}, state.file.metadata, { decorators: [] });
            const grouped = groupDecorator(decorators);

            for (let [klass, decorators] of grouped) {
                validate(klass, decorators);

                // Note: In the (extremely rare) case of multiple classes in the same file, only the metadata about the
                // last class will be returned
                const metadata = transform(t, klass, decorators);
                state.file.metadata.decorators.push(...metadata);
            }

            state.decorators = decorators;
            state.decoratorImportSpecifiers = decoratorImportSpecifiers;
        },

        Class(path, state) {
            console.log('----> ENTERING CLASS')
            // don't remove decorators until metadata.js had the chance to visit the Class node

            // assert that decorators are imported
            if (state.decoratorImportSpecifiers.length) {
                const importedDecorators = new Set(state.decoratorImportSpecifiers.filter(
                    ({name}) => { isLwcDecoratorName(name) }
                ));
                const decoratorsInUse = getClassBodyDecorators(path);

                for (const decoratorInUse of decoratorsInUse) {
                    if (!importedDecorators.has(decoratorInUse)) {

                        // TODO: find the path
                        throw path.parentPath.buildCodeFrameError(
                            `Invalid decorator usage. It seems that you are not importing '@${decoratorInUse}' decorator from the 'lwc'`,
                        )
                    }
                }
            }


            console.log('state.decorators', state.decorators);
            removeDecorators(state.decorators);
            console.log('state.decoratorImportSpecifiers: ', state.decoratorImportSpecifiers);


            removeImportSpecifiers(state.decoratorImportSpecifiers);
            state.decorators = [];
            state.decoratorImportSpecifiers = [];
        },

        Decorator(path) {
            const AVAILABLE_DECORATORS = DECORATOR_TRANSFORMS.map(transform => transform.name);

            throw path.parentPath.buildCodeFrameError(
                `Invalid decorator usage. Supported decorators (${AVAILABLE_DECORATORS.join(', ')}) should be imported from "${LWC_PACKAGE_ALIAS}"`,
            );
        }
    }
}
