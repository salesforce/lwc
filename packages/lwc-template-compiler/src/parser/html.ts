import {
    parseFragment,
    DefaultTreeElement,
    DefaultTreeNode,
    DefaultTreeTextNode,
    Location,
    DefaultTreeDocumentFragment,
    DefaultTreeCommentNode,
} from 'parse5';
import * as he from 'he';

export interface NodeVisitor<T> {
    enter: (element: T) => void;
    exit?: (element: T) => void;
}

export interface Visitor {
    Element: NodeVisitor<DefaultTreeNode>;
    Text?: NodeVisitor<DefaultTreeTextNode>;
    Comment?: NodeVisitor<DefaultTreeCommentNode>;
}

export function parseHTML(source: string) {
    const fragment = parseFragment(source, {
        sourceCodeLocationInfo: true,
    }) as DefaultTreeDocumentFragment;

    return {
        fragment,
        errors: [],
    };
}

export function traverseHTML(
    node: DefaultTreeNode,
    visitor: Visitor,
): void {
    let nodeVisitor: NodeVisitor<any> | undefined;
    let children: DefaultTreeNode[] = [];

    if (isElementNode(node)) {
        nodeVisitor = visitor.Element;
            // Node children are accessed differently depending on the node type:
            //  - standard elements have their children associated on the node itself
            //  - while the template node children are present on the content property.
        children = (node as any).content ? (node as any).content.childNodes : node.childNodes;
    } else if (isTextNode(node)) {
        nodeVisitor = visitor.Text;
    } else if (isCommentNode(node)) {
        nodeVisitor = visitor.Comment;
    }

    // enter
    if (nodeVisitor && nodeVisitor.enter) {
        nodeVisitor.enter(node);
        }

    // traverse childen
    for (const child of children) {
        traverseHTML(child, visitor);
    }

    // exit
    if (nodeVisitor && nodeVisitor.exit) {
        nodeVisitor.exit(node);
    }
        }

export function isElementNode(node: any): node is DefaultTreeElement {
    return !!node.tagName;
    }

export function isTextNode(node: any): node is DefaultTreeTextNode {
    return node.nodeName === '#text';
}

export function isCommentNode(node: any): node is DefaultTreeCommentNode {
    return node.nodeName === '#comment';
}

export function getTextNodeContent(node: DefaultTreeTextNode): string {
    return node.value;
    }

export function getTagName(element: DefaultTreeElement): string {
    return element.tagName;
}

export function getParentNode(node: DefaultTreeElement): DefaultTreeElement {
    return node.parentNode as DefaultTreeElement;
}

export function getSource(
    source: string,
    location: Location,
): string {
    const { startOffset, endOffset } = location;
    return source.slice(startOffset, endOffset);
}

// https://github.com/babel/babel/blob/d33d02359474296402b1577ef53f20d94e9085c4/packages/babel-types/src/react.js#L9-L55
export function cleanTextNode(value: string): string {
    const lines = value.split(/\r\n|\n|\r/);
    let lastNonEmptyLine = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/[^ \t]/)) {
            lastNonEmptyLine = i;
        }
    }

    let str = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isFirstLine = i === 0;
        const isLastLine = i === lines.length - 1;
        const isLastNonEmptyLine = i === lastNonEmptyLine;

        let trimmedLine = line.replace(/\t/g, ' ');

        if (!isFirstLine) {
            trimmedLine = trimmedLine.replace(/^[ ]+/, '');
        }

        if (!isLastLine) {
            trimmedLine = trimmedLine.replace(/[ ]+$/, '');
        }

        if (trimmedLine) {
            if (!isLastNonEmptyLine) {
                trimmedLine += ' ';
            }

            str += trimmedLine;
        }
    }

    return str;
}

export function decodeTextContent(source: string): string {
    return he.decode(source);
}
