const { LWC_PACKAGE_ALIAS, LWC_PACKAGE_ALIAS_LEGACY, LWC_PACKAGE_EXPORTS } = require('./constants');

function findClassMethod(path, name, properties = {}) {
    path.assertClassBody();

    return path.get('body').find(path => (
        isClassMethod(path, {
            name,
            kind: properties.kind || 'method',
            static: properties.static
        })
    ));
}

function isClassMethod(classMethod, properties = {}) {
    const { kind = 'method', name } = properties;
    return classMethod.isClassMethod({ kind }) &&
           (!name || classMethod.get('key').isIdentifier({ name })) &&
           (properties.static === undefined || classMethod.node.static === properties.static);
}

function isGetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'get',
        name: properties.name,
        static: properties.static
    });
}

function isSetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'set',
        name: properties.name,
        static: properties.static
    });
}

function staticClassProperty(types, name, expression) {
    const classProperty = types.classProperty(types.identifier(name), expression);
    classProperty.static = true;
    return classProperty;
}

function getEngineImportsStatements(path) {
    const programPath = path.isProgram() ? path : path.findParent(node => node.isProgram());

    return programPath.get('body').filter(node => {
        const source = node.get('source');
        return node.isImportDeclaration() && (source.isStringLiteral({ value: LWC_PACKAGE_ALIAS }) || source.isStringLiteral({ value: LWC_PACKAGE_ALIAS_LEGACY }))
    });
}

function getEngineImportSpecifiers(path) {
    const imports = getEngineImportsStatements(path);

    return imports.reduce((acc, importStatement) => {
        // Flat-map the specifier list for each import statement
        return [...acc, ...importStatement.get('specifiers')];
    }, []).reduce((acc, specifier) => {
        // Validate engine import specifier

        if (specifier.isImportNamespaceSpecifier()) {
            throw specifier.buildCodeFrameError(
                `Invalid import. Namespace imports are not allowed on "${LWC_PACKAGE_ALIAS}", instead use named imports "import { ${LWC_PACKAGE_EXPORTS.BASE_COMPONENT} } from '${LWC_PACKAGE_ALIAS}'".`,
            );
        } else if (specifier.isImportDefaultSpecifier()) {
            throw specifier.buildCodeFrameError(
                `Invalid import. "${LWC_PACKAGE_ALIAS}" doesn't have default export.`,
            );
        }

        // Get the list of specifiers with their name
        const imported = specifier.get('imported').node.name;

        return [...acc, { name: imported, path: specifier }];
    }, []);
}

function isComponentClass(classPath, componentBaseClassImports) {
    const superClass = classPath.get('superClass');

    return superClass.isIdentifier()
        && componentBaseClassImports.some(componentBaseClassImport => (
            classPath.scope.bindingIdentifierEquals(
                superClass.node.name,
                componentBaseClassImport.node
            )
        ));
}

function isDefaultExport(path) {
    return path.parentPath.isExportDefaultDeclaration();
}

module.exports = {
    findClassMethod,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    staticClassProperty,
    getEngineImportSpecifiers,
    isComponentClass,
    isDefaultExport,
};
