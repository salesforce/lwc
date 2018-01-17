const { basename } = require('path');
const commentParser = require('comment-parser');
const { findClassMethod, findClassProperty, staticClassProperty, getImportSpecifiers } = require('./utils');
const { LWC_PACKAGE_ALIAS, LWC_PACKAGE_EXPORTS, LWC_COMPONENT_PROPERTIES } = require('./constants');

module.exports = function ({ types: t, }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getImportSpecifiers(path, LWC_PACKAGE_ALIAS);

            // Store on state local identifiers referencing engine base component
            state.componentBaseClassImports = engineImportSpecifiers.filter(({ name }) => (
                name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT
            )).map(({ path }) => (
                path.get('local')
            ));
        },
        Class(path, state) {
            const isComponent = isComponentClass(path, state.componentBaseClassImports);

            if (isComponent) {
                const classRef = path.node.id;
                if (!classRef) {
                    throw path.buildCodeFrameError(
                        `LWC component class can't be an anonymous.`
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
                    if (!findClassMethod(classBody, LWC_COMPONENT_PROPERTIES.RENDER)) {
                        wireTemplateToClass(state, classBody);
                    }
                }
            }
        },
    };

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

        const labelProperty = findClassProperty(classBody, LWC_COMPONENT_PROPERTIES.LABELS, { static: true });
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
            LWC_COMPONENT_PROPERTIES.STYLE,
            t.memberExpression(templateIdentifier, t.identifier(LWC_COMPONENT_PROPERTIES.STYLE)),
        );

        const renderMethod = t.classMethod(
            'method',
            t.identifier(LWC_COMPONENT_PROPERTIES.RENDER),
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
            const parsed = commentParser('/*' + comment + '*/');
            return (parsed && parsed.length > 0) ? parsed[0].source : null;
        }
        return null; // ignoring non-JSDoc comments
    }
}
