export interface ASTIdentifier {
    type: 'identifier';
    name: string;
}

export interface ASTMemberExpression {
    type: 'member-expression';
    object: ASTExpression;
    property: ASTIdentifier;
}

export type ASTExpression = ASTIdentifier | ASTMemberExpression;

export interface ASTBaseParentNode {
    children: ASTChildNode[];
}

export interface ASTBaseNode {
    parent: ASTParentNode;
}

export interface ASTText extends ASTBaseNode {
    type: 'text';
    value: string | ASTExpression;
}

export interface ASTComment extends ASTBaseNode {
    type: 'comment';
    value: string;
}

export interface ASTAttribute {
    type: 'attribute';
    name: string;
    value: string | ASTExpression;
}

export interface ASTEventListener {
    type: 'listener';
    name: string;
    handler: ASTExpression;
}

export interface ASTElement extends ASTBaseNode, ASTBaseParentNode {
    type: 'element';
    name: string;
    namespace?: string;
    attributes: ASTAttribute[];
    listeners: ASTEventListener[];
}

export interface ASTComponent extends ASTBaseNode, ASTBaseParentNode {
    type: 'component';
    name: string;
    listeners: ASTEventListener[];
}

export interface ASTIfBlock extends ASTBaseNode, ASTBaseParentNode {
    type: 'if-block';
    modifier: 'true' | 'false';
    condition: ASTExpression;
}

export interface ASTForBlock extends ASTBaseNode, ASTBaseParentNode {
    type: 'for-block';
    expression: ASTExpression;
    item?: ASTIdentifier;
    index?: ASTIdentifier;
}

export interface ASTRoot extends ASTBaseParentNode {
    type: 'root';
}

export type ASTParentNode = ASTForBlock | ASTIfBlock | ASTElement | ASTComponent | ASTRoot;

export type ASTChildNode =
    | ASTForBlock
    | ASTIfBlock
    | ASTComment
    | ASTElement
    | ASTComponent
    | ASTText;

export type ASTNode = ASTChildNode | ASTRoot;

export interface CompilerConfig {
    preserveWhitespaces?: boolean;
}

export interface CompilerOutput {
    code: string;
    ast: ASTRoot;
    warnings: any[];
}
