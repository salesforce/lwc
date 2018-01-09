const api = require('./api');
const wire = require('./wire');
const track = require('./track');
const { getImportSpecifiers } = require('../utils');
const { LWC_PACKAGE_ALIAS } = require('../constants');

const DECORATOR_TRANSFORMS = [
    api,
    wire,
    track
];

function isLwcDecoratorName(name) {
    return DECORATOR_TRANSFORMS.some(transform => transform.name === name);
}

/** Returns a list of all the refences to an identifier */
function getReferences(identifier) {
    return identifier.scope.getBinding(identifier.node.name).referencePaths;
}

/** Returns a list of all the LWC decorators usages */
function getLwcDecorators(importSpecifiers) {
    return importSpecifiers.reduce((acc, { name, path }) => {
        // Get a list of all the  local references
        const local = path.get('imported');
        const references = getReferences(local).map(reference => ({
            type: name,
            reference
        }))

        return [...acc, ...references];
    }, []).map(({ type, reference }) => {
        // Get the decorator from the identifier
        // If the the decorator is:
        //   - an indentifier @track : the decorator is the parent of the indentifier
        //   - a call expression @wire("foo") : the decorator is the grand-parent of the identifier
        let decorator = reference.parentPath.isDecorator() ?
            reference.parentPath:
            reference.parentPath.parentPath;

        if (!decorator.isDecorator()) {
            throw decorator.buildCodeFrameError(`"${type}" can only be used as a class decorator`);
        }

        const propertyOrMethod = decorator.parentPath;
        if (!propertyOrMethod.isClassProperty() && !propertyOrMethod.isClassMethod()) {
            throw propertyOrMethod.buildCodeFrameError(`"@${type}" can only be applied on class properties`);
        }

        return {
            type,
            path: decorator,
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
        }
    }
}
