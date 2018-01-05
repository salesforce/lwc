const { basename } = require('path');
const commentParser = require('comment-parser');
const { findClassMethod, findClassProperty, staticClassProperty, getImportSpecifiers } = require('./utils');
const { RAPTOR_PACKAGE_ALIAS, RAPTOR_PACKAGE_EXPORTS, RAPTOR_COMPONENT_PROPERTIES } = require('./constants');

module.exports = function ({ types: t, }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getImportSpecifiers(path, RAPTOR_PACKAGE_ALIAS);

            // Store on state local identifiers referencing engine base component
            state.raptorBaseClassImports = engineImportSpecifiers.filter(({ name }) => (
                name === RAPTOR_PACKAGE_EXPORTS.BASE_COMPONENT
            )).map(({ path }) => (
                path.get('local')
            ));
        },
        Class(path, state) {
            const isRaptorComponent = isClassRaptorComponentClass(path, state.raptorBaseClassImports);

            if (isRaptorComponent) {
                const classRef = path.node.id;
                if (!classRef) {
                    throw path.buildCodeFrameError(
                        `Raptor component class can't be an anonymous.`
                    );
                }

                const classBody = path.get('body');

                // Deal with component labels
                const labels = getComponentLabels(classBody);
                const existingLabels = state.file.metadata.labels || [];
                state.file.metadata.labels = [...existingLabels, ...labels];

                if (isDefaultExport(path)) {
                    const declaration = path.parentPath.node;
                    if (declaration.leadingComments) {
                        const lastComment = declaration.leadingComments[declaration.leadingComments.length - 1].value;
                        const sanitized = sanitizeComment(lastComment);
                        if (sanitized) {
                            state.file.metadata.doc = sanitized;
                        }
                    }
                    const loc = declaration.loc;
                    state.file.metadata.declarationLoc = { start: { line: loc.start.line, column: loc.start.column }, end: { line: loc.end.line, column: loc.end.column } };

                    // Import and wire template to the component if the class has no render method
                    if (!findClassMethod(classBody, RAPTOR_COMPONENT_PROPERTIES.RENDER)) {
                        wireTemplateToClass(state, classBody);
                    }
                }
            }
        },
    };

    function isClassRaptorComponentClass(classPath, raptorBaseClassImports) {
        const superClass = classPath.get('superClass');

        return superClass.isIdentifier()
            && raptorBaseClassImports.some(raptorBaseClassImport => (
                classPath.scope.bindingIdentifierEquals(
                    superClass.node.name,
                    raptorBaseClassImport.node
                )
            ));
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

    function getComponentLabels(classBody) {
        const labels = [];

        const labelProperty = findClassProperty(classBody, RAPTOR_COMPONENT_PROPERTIES.LABELS, { static: true });
        if (labelProperty) {
            if (!labelProperty.get('value').isArrayExpression()) {
                throw labelProperty.buildCodeFrameError(
                    `"labels" static class property should be an array of string`
                );
            }

            labels.push(
                ...labelProperty.get('value.elements').map(labelValue => {
                    if (!labelValue.isStringLiteral()) {
                        throw labelValue.buildCodeFrameError(
                            `Label is expected to a be string, but found ${labelValue.type}`
                        );
                    }

                    return labelValue.node.value;
                })
            );

            labelProperty.remove();
        }

        return labels;
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

    function sanitizeComment(comment) {
        comment = comment.trim();
        if (comment.length > 0 && comment.charAt(0) === '*') {
            return commentParser('/*' + comment + '*/')[0].source;
        }
        return null; // ignoring non-JSDoc comments
    }
}
