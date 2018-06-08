const commentParser = require('comment-parser');
const { isComponentClass, isDefaultExport } = require('./utils');
const { LWC_PACKAGE_EXPORTS: { API_DECORATOR, TRACK_DECORATOR, WIRE_DECORATOR } } = require('./constants');

module.exports = function ({ types: t }) {
    return {
        Class(path, state) {
            if (isComponentClass(path, state.componentBaseClassImports) && isDefaultExport(path)) {
                const declaration = path.parentPath.node;
                const comment = extractComment(declaration);
                if (comment) {
                    state.file.metadata.doc = comment;
                }
                state.file.metadata.declarationLoc = extractLoc(declaration.loc);

                state.file.metadata.classMembers = [];
                path.get('body').get('body').forEach(path => {
                    if (!isSynthetic(path) && (isProperty(path) || isMethod(path))) {
                        const name = path.node.key.name;
                        if (!isPrivate(name)) {
                            const metadata = {
                                type: isProperty(path)? 'property': 'method',
                                name,
                                loc: extractLoc(path.node.loc)
                            }
                            const comment = extractComment(path.node);
                            if (comment) {
                                metadata.doc = comment;
                            }
                            const decorator = extractLWCDecorator(path.node);
                            if (decorator) {
                                metadata.decorator = decorator;
                            }
                            state.file.metadata.classMembers.push(metadata);
                        }
                    }
                });
            }
        }
    };

    function extractLWCDecorator(node) {
        if (node.decorators) {
            for (const decorator of node.decorators) {
                if (isLWCDecorator(decorator.callee.name)) {
                    return decorator.callee.name;
                }
            }
        }
        return undefined;
    }

    function isLWCDecorator(name) {
        return name === API_DECORATOR || name === TRACK_DECORATOR || name === WIRE_DECORATOR;
    }

    function extractComment(node) {
        if (node.leadingComments) {
            const lastComment = node.leadingComments[node.leadingComments.length - 1].value;
            return sanitizeComment(lastComment);
        }
        return undefined;
    }

    function extractLoc(loc) {
        return { start: { line: loc.start.line, column: loc.start.column }, end: { line: loc.end.line, column: loc.end.column } };
    }

    function isProperty(path) {
        if (path.isClassProperty()) {
            return true;
        }
        if (path.isClassMethod() && path.node.kind === 'get') {
            return true;
        }
        return false;
    }

    function isMethod(path) {
        return path.isClassMethod() && path.node.kind === 'method';
    }

    function isSynthetic(path) {
        return !path.node.loc;
    }

    function isPrivate(name) {
        return name.startsWith('_');
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
