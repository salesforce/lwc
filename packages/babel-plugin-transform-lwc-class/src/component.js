const { basename } = require('path');
const commentParser = require('comment-parser');
const moduleImports = require("@babel/helper-module-imports");
const { findClassMethod, findClassProperty, staticClassProperty, getEngineImportSpecifiers } = require('./utils');
const { GLOBAL_ATTRIBUTE_MAP, LWC_PACKAGE_EXPORTS, LWC_COMPONENT_PROPERTIES } = require('./constants');

const CLASS_PROPERTY_OBSERVED_ATTRIBUTES = 'observedAttributes';

module.exports = function ({ types: t }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getEngineImportSpecifiers(path);

            // Store on state local identifiers referencing engine base component
            state.componentBaseClassImports = engineImportSpecifiers.filter(({ name }) => (
                name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT
            )).map(({ path }) => (
                path.get('local')
            ));
        },
        ClassProperty(path, state) {
            if (isObservedAttributesStaticProperty(path)) {
                const observedAttributeNames = path.node.value.elements.map((elem) => {
                    const { value } = elem;
                    const { propName = value } = (GLOBAL_ATTRIBUTE_MAP.get(value) || {});
                    return `"${propName}"`;
                });
                throw path.buildCodeFrameError(
                    `Invalid static property "observedAttributes". "observedAttributes" cannot be used to track attribute changes. Define setters for ${observedAttributeNames.join(', ')} instead.`
                );
            }
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
                        wireTemplateToClass(path, state, classBody);
                    }
                }
            }
        },
    };

    function isObservedAttributesStaticProperty(classPropertyPath) {
        const { static: isStaticProperty, key: { name: propertyName } } = classPropertyPath.node;
        return (isStaticProperty && propertyName === CLASS_PROPERTY_OBSERVED_ATTRIBUTES);
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

    function getBaseName({ file }) {
        const classPath = file.opts.filename;
        return basename(classPath, '.js');
    }

    function importDefaultTemplate(path, state) {
        const componentName = getBaseName(state);
        return moduleImports.addDefault(path,`./${componentName}.html`, { nameHint: 'tmpl' })
    }

    function wireTemplateToClass(path, state, classBody) {
        const templateIdentifier = importDefaultTemplate(path, state);

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
