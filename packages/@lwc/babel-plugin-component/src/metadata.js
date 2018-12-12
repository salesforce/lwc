/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { extractValueMetadata, isComponentClass, isDefaultExport, getExportedNames } = require('./utils');
const { LWC_PACKAGE_EXPORTS: { API_DECORATOR, TRACK_DECORATOR, WIRE_DECORATOR } } = require('./constants');

module.exports = function () {
    return {
        Program: {
            exit(path, state) {
                state.file.metadata.exports = getExportedNames(path);
            }
        },
        Class(path, state) {
            if (isComponentClass(path, state.componentBaseClassImports) && isDefaultExport(path)) {
                const declaration = path.parentPath.node;
                const comment = extractComment(declaration);
                if (comment) {
                    state.file.metadata.doc = comment;
                }
                state.file.metadata.declarationLoc = extractLoc(declaration.loc);
                const visitedProperties = new Map();

                path.get('body').get('body').forEach(path => {
                    if (!isSynthetic(path) && (isProperty(path) || isMethod(path))) {
                        const name = path.node.key.name;
                        const { value: valueNode } = path.node;
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

                                // only collect value metadata for public static properties
                                if (decorator === 'api' && !path.isClassMethod()) {
                                    metadata.value = extractValueMetadata(valueNode);
                                }

                            }

                            if (!visitedProperties.has(name)) {
                                visitedProperties.set(name, metadata);
                            } else if (decorator && visitedProperties.has(name) && !visitedProperties.get(name).decorator) {
                                visitedProperties.set(name, metadata);
                            }
                        }
                    }
                });
                state.file.metadata.classMembers = Array.from(visitedProperties.values());
            }
        }
    };

    function extractLWCDecorator(node) {
        if (node.decorators) {
            for (const decorator of node.decorators) {
                const name = decorator.expression.name || decorator.expression.callee.name;
                if (isLWCDecorator(name)) {
                    return name;
                }
            }
        }
    }

    function isLWCDecorator(name) {
        return name === API_DECORATOR || name === TRACK_DECORATOR || name === WIRE_DECORATOR;
    }

    function extractComment(node) {
        if (node.leadingComments) {
            const lastComment = node.leadingComments[node.leadingComments.length - 1].value;
            return sanitizeComment(lastComment);
        }
    }

    function extractLoc(loc) {
        return {
            start: { line: loc.start.line, column: loc.start.column },
            end: { line: loc.end.line, column: loc.end.column }
        };
    }

    function isProperty(path) {
        if (path.isClassProperty()) {
            return true;
        }
        if (path.isClassMethod() && (path.node.kind === 'get' || path.node.kind === 'set')) {
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
            return comment;
        }
        return null; // ignoring non-JSDoc comments
    }
}
