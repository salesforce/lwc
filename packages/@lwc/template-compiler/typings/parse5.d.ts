/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import 'parse5-with-errors';

declare module 'parse5-with-errors' {
    export namespace MarkupData {
        export class StartTagLocation {
            startLine: number;
            startCol: number;
        }

        export class Location {
            startLine: number;
            startCol: number;
        }
    }

    export namespace AST {
        export interface TreeAdapter {
            getTemplateContent(
                templateElement: AST.Default.Element
            ): AST.Default.DocumentFragment | undefined;
            getChildNodes(node: AST.Default.ParentNode): AST.Default.Node[];
            isTextNode(node: AST.Default.Node): node is AST.Default.TextNode;
            isCommentNode(node: AST.Default.Node): node is AST.Default.CommentNode;
            isDocumentTypeNode(node: AST.Default.Node): node is AST.Default.DocumentType;
            isElementNode(node: AST.Default.Node): node is AST.Default.Element;
        }
    }
}
