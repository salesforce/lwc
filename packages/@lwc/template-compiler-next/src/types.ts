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

export interface ASTText {
    type: 'text';
    value: string | ASTExpression;
}

export interface ASTComment {
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

export interface ASTElement {
    type: 'element';
    name: string;
    namespace?: string;
    attributes: ASTAttribute[];
    listeners: ASTEventListener[];
    children: ASTChildNode[];
}

export interface ASTComponent {
    type: 'component';
    name: string;
    listeners: ASTEventListener[];
    slottedContent: Record<string, ASTChildNode[]>;
}

export interface ASTIfBlock {
    type: 'if-block';
    modifier: 'true' | 'false';
    condition: ASTExpression;
    children: ASTChildNode[];
}

export interface ASTForBlock {
    type: 'for-block';
    expression: ASTExpression;
    item?: ASTIdentifier;
    index?: ASTIdentifier;
    children: ASTChildNode[];
}

export type ASTChildNode =
    | ASTText
    | ASTComment
    | ASTElement
    | ASTComponent
    | ASTIfBlock
    | ASTForBlock;

export interface ASTRoot {
    type: 'root';
    children: ASTChildNode[];
}

export interface CompilerConfig {
    preserveWhitespaces?: boolean;
}

export interface CompilerOutput {
    code: string,
    ast: ASTRoot,
    warnings: any[]
}
