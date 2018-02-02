const api = require('./api');
const wire = require('./wire');
const track = require('./track');

const { LWC_PACKAGE_ALIAS, DECORATOR_TYPES } = require('../constants');
const { getImportSpecifiers, isClassMethod, isSetterClassMethod, isGetterClassMethod } = require('../utils');

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

/** Returns the type of decorator depdending on the property or method if get applied to */
function getDecoratorType(propertyOrMethod) {
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
    return DECORATOR_TRANSFORMS.reduce((metadata, { transform }) => (
        Object.assign(metadata, transform(t, klass, decorators))
    ), {});
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

module.exports = function decoratorVisitor({ types: t }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getImportSpecifiers(path, LWC_PACKAGE_ALIAS);
            const decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) => (
                isLwcDecoratorName(name)
            ));

            const decorators = getLwcDecorators(decoratorImportSpecifiers);

            state.file.metadata = Object.assign({}, state.metadata, {
                apiProperties: [],
                apiMethods: []
            });

            const grouped = groupDecorator(decorators);
            for (let [klass, decorators] of grouped) {
                validate(klass, decorators);

                // Note: In the (extremely rare) case of multiple classes in the same file, only the metadata about the
                // last class will be returned
                const metadata = transform(t, klass, decorators);
                state.file.metadata = Object.assign({}, state.metadata, metadata);
            }

            removeDecorators(decorators);
            removeImportSpecifiers(decoratorImportSpecifiers);
        },

        Decorator(path) {
            const AVAILABLE_DECORATORS = DECORATOR_TRANSFORMS.map(transform => transform.name);

            throw path.parentPath.buildCodeFrameError(
                `Invalid decorator usage. Supported decorators (${AVAILABLE_DECORATORS.join(', ')}) should be imported from "${LWC_PACKAGE_ALIAS}"`,
            );
        }
    }
}
