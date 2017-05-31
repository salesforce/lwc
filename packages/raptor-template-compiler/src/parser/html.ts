import * as parse5 from 'parse5';

type VisitorFn = (element: parse5.AST.Node) => void;

interface NodeVisitor {
    enter?: VisitorFn;
    exit?: VisitorFn;
}

interface Visitor {
    [type: string]: NodeVisitor;
}

export const treeAdapter = parse5.treeAdapters.default;

export function parseHTML(source: string): parse5.AST.Default.DocumentFragment {
    return parse5.parseFragment(source, {
        locationInfo: true,
    }) as parse5.AST.Default.DocumentFragment;
}

export function traverseHTML(
    node: parse5.AST.Default.Node,
    visitor: Visitor,
): void {
    let nodeVisitor: NodeVisitor;
    switch (node.nodeName) {
        case '#documentType':
            nodeVisitor = visitor.DocumentType;
            break;

        case '#comment':
            nodeVisitor = visitor.Comment;
            break;

        case '#text':
            nodeVisitor = visitor.Text;
            break;

        default:
            nodeVisitor = visitor.Element;
    }

    if (nodeVisitor && nodeVisitor.enter) {
        nodeVisitor.enter(node);
    }

    const children = (
        treeAdapter.getTagName(node) === 'template' ?
            treeAdapter.getChildNodes(treeAdapter.getTemplateContent(node)) :
            treeAdapter.getChildNodes(node)
    ) || [];

    for (const child of children) {
        traverseHTML(child as parse5.AST.Default.Node, visitor);
    }

    if (nodeVisitor && nodeVisitor.exit) {
        nodeVisitor.exit(node);
    }
}

export function getSource(source: string, location: parse5.MarkupData.Location): string {
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
