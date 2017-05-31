import * as babelTypes from 'babel-types';
import * as parse5 from 'parse5';

export type TemplateIdentifier = babelTypes.Identifier;
export type TemplateExpression =
    | babelTypes.MemberExpression
    | babelTypes.Literal
    | babelTypes.Identifier;

export type HTMLText = parse5.AST.TextNode;
export type HTMLElement = parse5.AST.Element;
export type HTMLNode =
    | HTMLElement
    | HTMLText;

export interface IRElement {
    type: 'element';
    tag: string;

    attrsList: parse5.AST.Default.Attribute[];

    parent?: IRElement;
    children: IRNode[];

    __original: HTMLElement;

    component?: string;

    className?: TemplateExpression;
    classMap?: { [name: string]: true };

    on?: { [name: string]: TemplateExpression };

    style?: { [name: string]: string | number };

    attrs?: { [name: string]: TemplateExpression | string };
    props?: { [name: string]: TemplateExpression | string };

    if?: TemplateExpression;
    ifModifier?: string;

    for?: TemplateExpression;
    forItem?: TemplateIdentifier;
    forIterator?: TemplateIdentifier;
    forKey?: TemplateExpression;

    slotName?: string;
    slotSet?: { [key: string]: IRNode[] };
}

export interface IRText {
    type: 'text';
    value: string | TemplateExpression;

    parent?: IRElement;

    __original: HTMLText;
}

export type IRNode =
    | IRElement
    | IRText;

interface IRBaseAttribute {
    name: string;
    location: parse5.MarkupData.Location;
}

export interface IRStringAttribute extends IRBaseAttribute {
    type: 'string';
    value: string;
}

export interface IRExpressionAttribute extends IRBaseAttribute {
    type: 'expression';
    value: TemplateExpression;
}

export type IRAttribute =
    | IRStringAttribute
    | IRExpressionAttribute;

export type WarningLevel = 'info' | 'warning' | 'error';

export interface CompilationWarning {
    message: string;
    start: number;
    length: number;
    level: WarningLevel;
}

export interface CompilationMetdata {
    usedIds: Set<string>;
    definedSlots: Set<string>;
    componentDependency: Set<string>;
}

export interface CompilationOutput {
    code: string;
    ast: babelTypes.Node;
}
