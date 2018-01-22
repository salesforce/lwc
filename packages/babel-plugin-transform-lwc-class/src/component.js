const { basename } = require('path');
const { findClassMethod, findClassProperty, staticClassProperty } = require('./utils');
const commentParser = require('comment-parser');

const RAPTOR_PACKAGE_ALIAS = 'engine';
const BASE_RAPTOR_COMPONENT_CLASS = 'Element';

const LABELS_CLASS_PROPERTY_NAME = 'labels';
const STYLE_CLASS_PROPERTY_NAME = 'style';
const COMPONENT_RENDER_METHOD_NAME = 'render';

const MISSPELLED_LIFECYCLE_METHODS = {
    'renderCallback'     : 'renderedCallback',
    'connectCallback'    : 'connectedCallback',
    'disconnectCallback' : 'disconnectedCallback'
};

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
                    name: BASE_RAPTOR_COMPONENT_CLASS
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
                    if (!findClassMethod(classBody, COMPONENT_RENDER_METHOD_NAME)) {
                        wireTemplateToClass(state, classBody);
                    }
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

    function checkLifecycleMethodMisspell(classBody) {
        for (let misspelledAPI of Object.keys(MISSPELLED_LIFECYCLE_METHODS)) {
            const method = findClassMethod(classBody, misspelledAPI);

            if (method) {
                throw method.buildCodeFrameError(
                    `Wrong lifecycle method name ${misspelledAPI}. You probably meant ${MISSPELLED_LIFECYCLE_METHODS[misspelledAPI]}`
                );
            }
        }
    }

    function isDefaultExport(path) {
        return path.parentPath.isExportDefaultDeclaration();
    }

    function getBaseName({ opts, file }) {
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
            STYLE_CLASS_PROPERTY_NAME,
            t.memberExpression(templateIdentifier, t.identifier(STYLE_CLASS_PROPERTY_NAME)),
        );

        const renderMethod = t.classMethod(
            'method',
            t.identifier(COMPONENT_RENDER_METHOD_NAME),
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
