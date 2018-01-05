const { basename } = require('path');
const { findClassMethod, staticClassProperty } = require('./utils');
const { RAPTOR_PACKAGE_ALIAS, RAPTOR_PACKAGE_EXPORTS, RAPTOR_COMPONENT_PROPERTIES } = require('./constants');

module.exports = function ({ types: t, }) {
    return {
        ImportDeclaration(path, state) {
            // Check if importing engine
            const isRaptorImport = path.get('source').isStringLiteral({
                value: RAPTOR_PACKAGE_ALIAS
            });

            if (!isRaptorImport) {
                return;
            }

            // Find the Element identifier from the imported identifier
            const baseComponentClassImport = path.get('specifiers').find(path => (
                 path.get('imported').isIdentifier({
                    name: RAPTOR_PACKAGE_EXPORTS.BASE_COMPONENT
                })
            ));

            if (baseComponentClassImport) {
                state.raptorBaseClassImport = baseComponentClassImport.get('local');
            }
        },
        Class(path, state) {
            const isRaptorComponent = state.raptorBaseClassImport &&
            isClassRaptorComponentClass(path, state.raptorBaseClassImport);

            if (isRaptorComponent) {
                const classRef = path.node.id;
                if (!classRef) {
                    throw path.buildCodeFrameError(
                        `Raptor component class can't be an anonymous.`
                    );
                }

                const classBody = path.get('body');
                // Import and wire template to the component if the class has no render method
                if(
                    isDefaultExport(path)
                    && !findClassMethod(classBody, RAPTOR_COMPONENT_PROPERTIES.RENDER)
                ) {
                    wireTemplateToClass(state, classBody);
                }
            }
        },
    };

    function isClassRaptorComponentClass(classPath, raptorBaseClassImport) {
        const superClass = classPath.get('superClass');

        return superClass.isIdentifier()
            && classPath.scope.bindingIdentifierEquals(
                superClass.node.name,
                raptorBaseClassImport.node
            );
    }

    function isDefaultExport(path) {
        return path.parentPath.isExportDefaultDeclaration();
    }

    function getBaseName({ file }) {
        const classPath = file.opts.filename;
        return basename(classPath, '.js');
    }

    function importDefaultTemplate(state) {
        const componentName = getBaseName(state);
        return state.file.addImport(`./${componentName}.html`, 'default', 'tmpl');
    }

    function wireTemplateToClass(state, classBody) {
        const templateIdentifier = importDefaultTemplate(state);

        const styleProperty = staticClassProperty(
            t,
            RAPTOR_COMPONENT_PROPERTIES.STYLE,
            t.memberExpression(templateIdentifier, t.identifier(RAPTOR_COMPONENT_PROPERTIES.STYLE)),
        );

        const renderMethod = t.classMethod(
            'method',
            t.identifier(RAPTOR_COMPONENT_PROPERTIES.RENDER),
            [],
            t.blockStatement([
                t.returnStatement(templateIdentifier),
            ])
        );

        classBody.pushContainer('body', [
            renderMethod,
            styleProperty,
        ]);
    }
}
