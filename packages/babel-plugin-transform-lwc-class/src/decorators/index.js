const track = require('./track');
const { RAPTOR_PACKAGE_ALIAS, RAPTOR_PACKAGE_EXPORTS } = require('../constants');

const DECORATOR_TYPES = [
    RAPTOR_PACKAGE_EXPORTS.API_DECORATOR,
    RAPTOR_PACKAGE_EXPORTS.TRACK_DECORATOR,
    RAPTOR_PACKAGE_EXPORTS.WIRE_DECORATOR,
];

/** Returns the import statement for a specific source */
function getImportsStatements(path, sourceName) {
    const programPath = path.isProgram() ?
        path :
        path.findParent(node => node.isProgram());

    return programPath.get('body').filter(node => (
        node.isImportDeclaration() &&
        node.get('source').isStringLiteral({ value: sourceName })
    ));
}

/** Returns a list of all the decorators import specifiers */
function getLwcDecoratorsImportSpecifiers(path) {
    const engineImports = getImportsStatements(path, RAPTOR_PACKAGE_ALIAS);

    return engineImports.reduce((acc, importStatement) => {
        // Flat-map the specifier list for each import statement
        return [...acc, ...importStatement.get('specifiers')];
    }, []);
}

/** Returns a list of all the refences to an identifier */
function getReferences(identifier) {
    return identifier.scope.getBinding(identifier.node.name).referencePaths;
}

/** Returns a list of all the LWC decorators usages */
function getLwcDecorators(importSpecifiers) {
    return importSpecifiers.reduce((acc, specifier) => {
        // Get the list of decorators import specifiers
        const imported = specifier.get('imported').node.name;
        const isDecoratorImport = DECORATOR_TYPES.includes(imported);

        return isDecoratorImport ?
            [...acc, { type: imported, specifier }] :
            acc;
    }, []).reduce((acc, { type, specifier }) => {
        // Get a list of all the  local references
        const local = specifier.get('imported');
        const references = getReferences(local).map(reference => ({
            type,
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
            throw decorator.buildCodeFrameError(`"${type}" can only be used as a class properties decorator`);
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

function validate(klass, decorators) {
    track.validate(klass, decorators);
}

function transform(t, klass, decorators) {
    track.transform(t, klass, decorators);
}

/** Remove all the decorators */
function removeDecorators(decorators) {
    for (let { path } of decorators) {
        path.remove();
    }
}

/** Remove import specifiers. It also removes the import statement if the specifier list becomes empty */
function removeImportSpecifiers(specifiers) {
    for (let specifier of specifiers) {
        const importStatement = specifier.parentPath;
        specifier.remove();

        if (importStatement.get('specifiers').length === 0) {
            importStatement.remove();
        }
    }
}

module.exports = function apiVisitor({ types: t }) {
    return {
        Program(path, state) {
            const importSpecifiers = getLwcDecoratorsImportSpecifiers(path);
            const decorators = getLwcDecorators(importSpecifiers);

            const grouped = groupDecorator(decorators);
            for (let [klass, decorators] of grouped) {
                validate(klass, decorators);
                transform(t, klass, decorators);
            }

            removeDecorators(decorators);
            removeImportSpecifiers(importSpecifiers);
        }
    }
}
