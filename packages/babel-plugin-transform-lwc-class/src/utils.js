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

function findClassProperty(path, name, properties = {}) {
    path.assertClassBody();

    return path.get('body').find(path => (
        path.isClassProperty({ static: properties.static }) &&
        path.get('key').isIdentifier({ name })
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

function getImportsStatements(path, sourceName) {
    const programPath = path.isProgram() ?
        path :
        path.findParent(node => node.isProgram());

    return programPath.get('body').filter(node => (
        node.isImportDeclaration() &&
        node.get('source').isStringLiteral({ value: sourceName })
    ));
}

function getImportSpecifiers(path, sourceName) {
    const engineImports = getImportsStatements(path, sourceName);

    return engineImports.reduce((acc, importStatement) => {
        // Flat-map the specifier list for each import statement
        return [...acc, ...importStatement.get('specifiers')];
    }, []).reduce((acc, specifier) => {
        // Get the list of specifiers with their name
        const imported = specifier.get('imported').node.name;
        return [...acc, { name: imported, path: specifier }];
    }, []);
}

module.exports = {
    findClassMethod,
    findClassProperty,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    staticClassProperty,
    getImportSpecifiers,
};
