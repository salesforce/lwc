declare interface MetaConfig {
    directive?: any;
    directives?: any;
    modifier?: any;
    event?: any;
    scoped?: any;
    isExpression?: boolean;
    applyIfTransform: boolean;
    applyRepeatTransform: boolean;
    expressionContainer?: boolean;
    hasNameAttribute?: boolean;
    maybeSlotNameDef?: boolean;
    slot?: any;
    isSlotAttr?: boolean;
    hasSlot?: boolean;
    inForScope?: Array<any>;
}

declare class PluginState {
    customScope: any;
    file: any;
}

declare class Path {
    get(strPath: string): Path;
    stop(): void;
    find(Function: (path: Path) => boolean) : Path;
    buildCodeFrameError(error: string): Object;
    node: BabelNode;
    pushContainer(container: string, path: Path): void;
    unshiftContainer(container: string, path: Path): void;
    isExpressionStatement(): boolean;
    isProgram(): boolean;
    scope: any;
    replaceWith(path: BabelNode): void;
    parentPath: Path;
};

declare class BabelNodeSourceLocation {
    start: {
        line: number;
        column: number;
    };

    end: {
        line: number;
        column: number;
    };
}

declare class BabelNodeComment {
    value: string;
    start: number;
    end: number;
    loc: BabelNodeSourceLocation;
}


declare class BabelNode {
    leadingComments?: Array<BabelNodeComment>;
    innerComments?: Array<BabelNodeComment>;
    trailingComments?: Array<BabelNodeComment>;
    start?: number;
    name? :string;
    value? : string;
    end?: number;
    loc?: BabelNodeSourceLocation;
}


declare class BabelNodeArrayExpression extends BabelNode {
  type: "ArrayExpression";
  elements?: any;
}

declare class BabelNodeAssignmentExpression extends BabelNode {
  type: "AssignmentExpression";
  operator: string;
  left: BabelNodeLVal;
  right: BabelNodeExpression;
}

declare class BabelNodeBinaryExpression extends BabelNode {
  type: "BinaryExpression";
  operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=";
  left: BabelNodeExpression;
  right: BabelNodeExpression;
}

declare class BabelNodeDirective extends BabelNode {
  type: "Directive";
  value: BabelNodeDirectiveLiteral;
}

declare class BabelNodeDirectiveLiteral extends BabelNode {
  type: "DirectiveLiteral";
  value: string;
}

declare class BabelNodeBlockStatement extends BabelNode {
  type: "BlockStatement";
  directives?: any;
  body: any;
}

declare class BabelNodeBreakStatement extends BabelNode {
  type: "BreakStatement";
  label?: ?BabelNodeIdentifier;
}

declare class BabelNodeCallExpression extends BabelNode {
  type: "CallExpression";
  callee: BabelNodeExpression;
  arguments: any;
}

declare class BabelNodeCatchClause extends BabelNode {
  type: "CatchClause";
  param: BabelNodeIdentifier;
  body: BabelNodeBlockStatement;
}

declare class BabelNodeConditionalExpression extends BabelNode {
  type: "ConditionalExpression";
  test: BabelNodeExpression;
  consequent: BabelNodeExpression;
  alternate: BabelNodeExpression;
}

declare class BabelNodeContinueStatement extends BabelNode {
  type: "ContinueStatement";
  label?: ?BabelNodeIdentifier;
}

declare class BabelNodeDebuggerStatement extends BabelNode {
  type: "DebuggerStatement";
}

declare class BabelNodeDoWhileStatement extends BabelNode {
  type: "DoWhileStatement";
  test: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeEmptyStatement extends BabelNode {
  type: "EmptyStatement";
}

declare class BabelNodeExpressionStatement extends BabelNode {
  type: "ExpressionStatement";
  expression: BabelNodeExpression;
}

declare class BabelNodeFile extends BabelNode {
  type: "File";
  program: BabelNodeProgram;
  comments: any;
  tokens: any;
}

declare class BabelNodeForInStatement extends BabelNode {
  type: "ForInStatement";
  left: BabelNodeVariableDeclaration | BabelNodeLVal;
  right: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeForStatement extends BabelNode {
  type: "ForStatement";
  init?: ?BabelNodeVariableDeclaration | BabelNodeExpression;
  test?: ?BabelNodeExpression;
  update?: ?BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeFunctionDeclaration extends BabelNode {
  type: "FunctionDeclaration";
  id: BabelNodeIdentifier;
  params: any;
  body: BabelNodeBlockStatement;
  generator?: boolean;
  async?: boolean;
  returnType: any;
  typeParameters: any;
}

declare class BabelNodeFunctionExpression extends BabelNode {
  type: "FunctionExpression";
  id?: ?BabelNodeIdentifier;
  params: any;
  body: BabelNodeBlockStatement;
  generator?: boolean;
  async?: boolean;
  returnType: any;
  typeParameters: any;
}

declare class BabelNodeIdentifier extends BabelNode {
  type: "Identifier";
  name: any;
  typeAnnotation: any;
}

declare class BabelNodeIfStatement extends BabelNode {
  type: "IfStatement";
  test: BabelNodeExpression;
  consequent: BabelNodeStatement;
  alternate?: ?BabelNodeStatement;
}

declare class BabelNodeLabeledStatement extends BabelNode {
  type: "LabeledStatement";
  label: BabelNodeIdentifier;
  body: BabelNodeStatement;
}

declare class BabelNodeStringLiteral extends BabelNode {
  type: "StringLiteral";
  value: string;
}

declare class BabelNodeNumericLiteral extends BabelNode {
  type: "NumericLiteral";
  value: number;
}

declare class BabelNodeNullLiteral extends BabelNode {
  type: "NullLiteral";
}

declare class BabelNodeBooleanLiteral extends BabelNode {
  type: "BooleanLiteral";
  value: boolean;
}

declare class BabelNodeRegExpLiteral extends BabelNode {
  type: "RegExpLiteral";
  pattern: string;
  flags?: string;
}

declare class BabelNodeLogicalExpression extends BabelNode {
  type: "LogicalExpression";
  operator: "||" | "&&";
  left: BabelNodeExpression;
  right: BabelNodeExpression;
}

declare class BabelNodeMemberExpression extends BabelNode {
  type: "MemberExpression";
  object: BabelNodeExpression;
  property: any;
  computed?: boolean;
}

declare class BabelNodeNewExpression extends BabelNode {
  type: "NewExpression";
  callee: BabelNodeExpression;
  arguments: any;
}

declare class BabelNodeProgram extends BabelNode {
  type: "Program";
  directives?: any;
  body: any;
}

declare class BabelNodeObjectExpression extends BabelNode {
  type: "ObjectExpression";
  properties: any;
}

declare class BabelNodeObjectMethod extends BabelNode {
  type: "ObjectMethod";
  kind?: any;
  computed?: boolean;
  key: any;
  decorators: any;
  body: BabelNodeBlockStatement;
  generator?: boolean;
  async?: boolean;
  params: any;
  returnType: any;
  typeParameters: any;
}

declare class BabelNodeObjectProperty extends BabelNode {
  type: "ObjectProperty";
  computed?: boolean;
  key: any;
  value: BabelNodeExpression;
  shorthand?: boolean;
  decorators?: any;
}

declare class BabelNodeRestElement extends BabelNode {
  type: "RestElement";
  argument: BabelNodeLVal;
  typeAnnotation: any;
}

declare class BabelNodeReturnStatement extends BabelNode {
  type: "ReturnStatement";
  argument?: BabelNodeExpression;
}

declare class BabelNodeSequenceExpression extends BabelNode {
  type: "SequenceExpression";
  expressions: any;
}

declare class BabelNodeSwitchCase extends BabelNode {
  type: "SwitchCase";
  test?: BabelNodeExpression;
  consequent: any;
}

declare class BabelNodeSwitchStatement extends BabelNode {
  type: "SwitchStatement";
  discriminant: BabelNodeExpression;
  cases: any;
}

declare class BabelNodeThisExpression extends BabelNode {
  type: "ThisExpression";
}

declare class BabelNodeThrowStatement extends BabelNode {
  type: "ThrowStatement";
  argument: BabelNodeExpression;
}

declare class BabelNodeTryStatement extends BabelNode {
  type: "TryStatement";
  body: BabelNodeBlockStatement;
  handler?: any;
  finalizer?: BabelNodeBlockStatement;
  block: any;
}

declare class BabelNodeUnaryExpression extends BabelNode {
  type: "UnaryExpression";
  prefix?: boolean;
  argument: BabelNodeExpression;
  operator: "void" | "delete" | "!" | "+" | "-" | "++" | "--" | "~" | "typeof";
}

declare class BabelNodeUpdateExpression extends BabelNode {
  type: "UpdateExpression";
  prefix?: boolean;
  argument: BabelNodeExpression;
  operator: "++" | "--";
}

declare class BabelNodeVariableDeclaration extends BabelNode {
  type: "VariableDeclaration";
  kind: any;
  declarations: any;
}

declare class BabelNodeVariableDeclarator extends BabelNode {
  type: "VariableDeclarator";
  id: BabelNodeLVal;
  init?: BabelNodeExpression;
}

declare class BabelNodeWhileStatement extends BabelNode {
  type: "WhileStatement";
  test: BabelNodeExpression;
  body: BabelNodeBlockStatement | BabelNodeStatement;
}

declare class BabelNodeWithStatement extends BabelNode {
  type: "WithStatement";
  object: any;
  body: BabelNodeBlockStatement | BabelNodeStatement;
}

declare class BabelNodeAssignmentPattern extends BabelNode {
  type: "AssignmentPattern";
  left: BabelNodeIdentifier;
  right: BabelNodeExpression;
}

declare class BabelNodeArrayPattern extends BabelNode {
  type: "ArrayPattern";
  elements: any;
  typeAnnotation: any;
}

declare class BabelNodeArrowFunctionExpression extends BabelNode {
  type: "ArrowFunctionExpression";
  params: any;
  body: BabelNodeBlockStatement | BabelNodeExpression;
  async?: boolean;
  returnType: any;
}

declare class BabelNodeClassBody extends BabelNode {
  type: "ClassBody";
  body: any;
}

declare class BabelNodeClassDeclaration extends BabelNode {
  type: "ClassDeclaration";
  id: BabelNodeIdentifier;
  body: BabelNodeClassBody;
  superClass?: BabelNodeExpression;
  decorators: any;
  mixins: any;
  typeParameters: any;
  superTypeParameters: any;
}

declare class BabelNodeClassExpression extends BabelNode {
  type: "ClassExpression";
  id?: ?BabelNodeIdentifier;
  body: BabelNodeClassBody;
  superClass?: ?BabelNodeExpression;
  decorators: any;
  mixins: any;
  typeParameters: any;
  superTypeParameters: any;
}

declare class BabelNodeExportAllDeclaration extends BabelNode {
  type: "ExportAllDeclaration";
  source: BabelNodeStringLiteral;
}

declare class BabelNodeExportDefaultDeclaration extends BabelNode {
  type: "ExportDefaultDeclaration";
  declaration: BabelNodeFunctionDeclaration | BabelNodeClassDeclaration | BabelNodeExpression;
}

declare class BabelNodeExportNamedDeclaration extends BabelNode {
  type: "ExportNamedDeclaration";
  declaration?: ?BabelNodeDeclaration;
  specifiers: any;
  source?: ?BabelNodeStringLiteral;
}

declare class BabelNodeExportSpecifier extends BabelNode {
  type: "ExportSpecifier";
  local: BabelNodeIdentifier;
  imported: BabelNodeIdentifier;
  exported: any;
}

declare class BabelNodeForOfStatement extends BabelNode {
  type: "ForOfStatement";
  left: BabelNodeVariableDeclaration | BabelNodeLVal;
  right: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeImportDeclaration extends BabelNode {
  type: "ImportDeclaration";
  specifiers: any;
  source: BabelNodeStringLiteral;
}

declare class BabelNodeImportDefaultSpecifier extends BabelNode {
  type: "ImportDefaultSpecifier";
  local: BabelNodeIdentifier;
}

declare class BabelNodeImportNamespaceSpecifier extends BabelNode {
  type: "ImportNamespaceSpecifier";
  local: BabelNodeIdentifier;
}

declare class BabelNodeImportSpecifier extends BabelNode {
  type: "ImportSpecifier";
  local: BabelNodeIdentifier;
  imported: BabelNodeIdentifier;
}

declare class BabelNodeMetaProperty extends BabelNode {
  type: "MetaProperty";
  meta: string;
  property: string;
}

declare class BabelNodeClassMethod extends BabelNode {
  type: "ClassMethod";
  kind?: any;
  computed?: boolean;
  key: any;
  params: any;
  body: BabelNodeBlockStatement;
  generator?: boolean;
  async?: boolean;
  decorators: any;
  returnType: any;
  typeParameters: any;
}

declare class BabelNodeObjectPattern extends BabelNode {
  type: "ObjectPattern";
  properties: any;
  typeAnnotation: any;
}

declare class BabelNodeSpreadElement extends BabelNode {
  type: "SpreadElement";
  argument: BabelNodeExpression;
}

declare class BabelNodeSuper extends BabelNode {
  type: "Super";
}

declare class BabelNodeTaggedTemplateExpression extends BabelNode {
  type: "TaggedTemplateExpression";
  tag: BabelNodeExpression;
  quasi: BabelNodeTemplateLiteral;
}

declare class BabelNodeTemplateElement extends BabelNode {
  type: "TemplateElement";
  value: any;
  tail?: boolean;
}

declare class BabelNodeTemplateLiteral extends BabelNode {
  type: "TemplateLiteral";
  quasis: any;
  expressions: any;
}

declare class BabelNodeYieldExpression extends BabelNode {
  type: "YieldExpression";
  delegate?: boolean;
  argument?: ?BabelNodeExpression;
}

declare class BabelNodeAnyTypeAnnotation extends BabelNode {
  type: "AnyTypeAnnotation";
}

declare class BabelNodeArrayTypeAnnotation extends BabelNode {
  type: "ArrayTypeAnnotation";
  elementType: any;
}

declare class BabelNodeBooleanTypeAnnotation extends BabelNode {
  type: "BooleanTypeAnnotation";
}

declare class BabelNodeBooleanLiteralTypeAnnotation extends BabelNode {
  type: "BooleanLiteralTypeAnnotation";
}

declare class BabelNodeNullLiteralTypeAnnotation extends BabelNode {
  type: "NullLiteralTypeAnnotation";
}

declare class BabelNodeClassImplements extends BabelNode {
  type: "ClassImplements";
  id: any;
  typeParameters: any;
}

declare class BabelNodeClassProperty extends BabelNode {
  type: "ClassProperty";
  key: any;
  value: any;
  typeAnnotation: any;
  decorators: any;
}

declare class BabelNodeDeclareClass extends BabelNode {
  type: "DeclareClass";
  id: any;
  typeParameters: any;
  body: any;
}

declare class BabelNodeDeclareFunction extends BabelNode {
  type: "DeclareFunction";
  id: any;
}

declare class BabelNodeDeclareInterface extends BabelNode {
  type: "DeclareInterface";
  id: any;
  typeParameters: any;
  body: any;
}

declare class BabelNodeDeclareModule extends BabelNode {
  type: "DeclareModule";
  id: any;
  body: any;
}

declare class BabelNodeDeclareModuleExports extends BabelNode {
  type: "DeclareModuleExports";
  typeAnnotation: any;
}

declare class BabelNodeDeclareTypeAlias extends BabelNode {
  type: "DeclareTypeAlias";
  id: any;
  typeParameters: any;
  right: any;
}

declare class BabelNodeDeclareVariable extends BabelNode {
  type: "DeclareVariable";
  id: any;
}

declare class BabelNodeExistentialTypeParam extends BabelNode {
  type: "ExistentialTypeParam";
}

declare class BabelNodeFunctionTypeAnnotation extends BabelNode {
  type: "FunctionTypeAnnotation";
  typeParameters: any;
  params: any;
  rest: any;
  returnType: any;
}

declare class BabelNodeFunctionTypeParam extends BabelNode {
  type: "FunctionTypeParam";
  name: any;
  typeAnnotation: any;
}

declare class BabelNodeGenericTypeAnnotation extends BabelNode {
  type: "GenericTypeAnnotation";
  id: any;
  typeParameters: any;
}

declare class BabelNodeInterfaceExtends extends BabelNode {
  type: "InterfaceExtends";
  id: any;
  typeParameters: any;
}

declare class BabelNodeInterfaceDeclaration extends BabelNode {
  type: "InterfaceDeclaration";
  id: any;
  typeParameters: any;
  body: any;
}

declare class BabelNodeIntersectionTypeAnnotation extends BabelNode {
  type: "IntersectionTypeAnnotation";
  types: any;
}

declare class BabelNodeMixedTypeAnnotation extends BabelNode {
  type: "MixedTypeAnnotation";
}

declare class BabelNodeNullableTypeAnnotation extends BabelNode {
  type: "NullableTypeAnnotation";
  typeAnnotation: any;
}

declare class BabelNodeNumericLiteralTypeAnnotation extends BabelNode {
  type: "NumericLiteralTypeAnnotation";
}

declare class BabelNodeNumberTypeAnnotation extends BabelNode {
  type: "NumberTypeAnnotation";
}

declare class BabelNodeStringLiteralTypeAnnotation extends BabelNode {
  type: "StringLiteralTypeAnnotation";
}

declare class BabelNodeStringTypeAnnotation extends BabelNode {
  type: "StringTypeAnnotation";
}

declare class BabelNodeThisTypeAnnotation extends BabelNode {
  type: "ThisTypeAnnotation";
}

declare class BabelNodeTupleTypeAnnotation extends BabelNode {
  type: "TupleTypeAnnotation";
  types: any;
}

declare class BabelNodeTypeofTypeAnnotation extends BabelNode {
  type: "TypeofTypeAnnotation";
  argument: any;
}

declare class BabelNodeTypeAlias extends BabelNode {
  type: "TypeAlias";
  id: any;
  typeParameters: any;
  right: any;
}

declare class BabelNodeTypeAnnotation extends BabelNode {
  type: "TypeAnnotation";
  typeAnnotation: any;
}

declare class BabelNodeTypeCastExpression extends BabelNode {
  type: "TypeCastExpression";
  expression: any;
  typeAnnotation: any;
}

declare class BabelNodeTypeParameterDeclaration extends BabelNode {
  type: "TypeParameterDeclaration";
  params: any;
}

declare class BabelNodeTypeParameterInstantiation extends BabelNode {
  type: "TypeParameterInstantiation";
  params: any;
}

declare class BabelNodeObjectTypeAnnotation extends BabelNode {
  type: "ObjectTypeAnnotation";
  properties: any;
  indexers: any;
  callProperties: any;
}

declare class BabelNodeObjectTypeCallProperty extends BabelNode {
  type: "ObjectTypeCallProperty";
  value: any;
}

declare class BabelNodeObjectTypeIndexer extends BabelNode {
  type: "ObjectTypeIndexer";
  id: any;
  key: any;
  value: any;
}

declare class BabelNodeObjectTypeProperty extends BabelNode {
  type: "ObjectTypeProperty";
  key: any;
  value: any;
}

declare class BabelNodeQualifiedTypeIdentifier extends BabelNode {
  type: "QualifiedTypeIdentifier";
  id: any;
  qualification: any;
}

declare class BabelNodeUnionTypeAnnotation extends BabelNode {
  type: "UnionTypeAnnotation";
  types: any;
}

declare class BabelNodeVoidTypeAnnotation extends BabelNode {
  type: "VoidTypeAnnotation";
}

declare class BabelNodeJSXAttribute extends BabelNode {
  type: "JSXAttribute";
  name: BabelNodeJSXIdentifier | BabelNodeJSXNamespacedName;
  value?: ?BabelNodeJSXElement | BabelNodeStringLiteral | BabelNodeJSXExpressionContainer;
}

declare class BabelNodeJSXClosingElement extends BabelNode {
  type: "JSXClosingElement";
  name: BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression;
}

declare class BabelNodeJSXElement extends BabelNode {
  type: "JSXElement";
  openingElement: BabelNodeJSXOpeningElement;
  closingElement?: ?BabelNodeJSXClosingElement;
  children: any;
  selfClosing: any;
}

declare class BabelNodeJSXEmptyExpression extends BabelNode {
  type: "JSXEmptyExpression";
}

declare class BabelNodeJSXExpressionContainer extends BabelNode {
  type: "JSXExpressionContainer";
  expression: BabelNodeExpression;
}

declare class BabelNodeJSXIdentifier extends BabelNode {
  type: "JSXIdentifier";
  name: string;
}

declare class BabelNodeJSXMemberExpression extends BabelNode {
  type: "JSXMemberExpression";
  object: BabelNodeJSXMemberExpression | BabelNodeJSXIdentifier;
  property: BabelNodeJSXIdentifier;
}

declare class BabelNodeJSXNamespacedName extends BabelNode {
  type: "JSXNamespacedName";
  namespace: BabelNodeJSXIdentifier;
  name: BabelNodeJSXIdentifier;
}

declare class BabelNodeJSXOpeningElement extends BabelNode {
  type: "JSXOpeningElement";
  name: BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression;
  selfClosing?: boolean;
  attributes: any;
}

declare class BabelNodeJSXSpreadAttribute extends BabelNode {
  type: "JSXSpreadAttribute";
  argument: BabelNodeExpression;
}

declare class BabelNodeJSXText extends BabelNode {
  type: "JSXText";
  value: string;
}

declare class BabelNodeNoop extends BabelNode {
  type: "Noop";
}

declare class BabelNodeParenthesizedExpression extends BabelNode {
  type: "ParenthesizedExpression";
  expression: BabelNodeExpression;
}

declare class BabelNodeAwaitExpression extends BabelNode {
  type: "AwaitExpression";
  argument: BabelNodeExpression;
}

declare class BabelNodeBindExpression extends BabelNode {
  type: "BindExpression";
  object: any;
  callee: any;
}

declare class BabelNodeDecorator extends BabelNode {
  type: "Decorator";
  expression: BabelNodeExpression;
}

declare class BabelNodeDoExpression extends BabelNode {
  type: "DoExpression";
  body: BabelNodeBlockStatement;
}

declare class BabelNodeExportDefaultSpecifier extends BabelNode {
  type: "ExportDefaultSpecifier";
  exported: BabelNodeIdentifier;
}

declare class BabelNodeExportNamespaceSpecifier extends BabelNode {
  type: "ExportNamespaceSpecifier";
  exported: BabelNodeIdentifier;
}

declare class BabelNodeRestProperty extends BabelNode {
  type: "RestProperty";
  argument: BabelNodeLVal;
}

declare class BabelNodeSpreadProperty extends BabelNode {
  type: "SpreadProperty";
  argument: BabelNodeExpression;
}

type BabelNodeExpression = BabelNodeArrayExpression | BabelNodeAssignmentExpression | BabelNodeBinaryExpression | BabelNodeCallExpression | BabelNodeConditionalExpression | BabelNodeFunctionExpression | BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeRegExpLiteral | BabelNodeLogicalExpression | BabelNodeMemberExpression | BabelNodeNewExpression | BabelNodeObjectExpression | BabelNodeSequenceExpression | BabelNodeThisExpression | BabelNodeUnaryExpression | BabelNodeUpdateExpression | BabelNodeArrowFunctionExpression | BabelNodeClassExpression | BabelNodeMetaProperty | BabelNodeSuper | BabelNodeTaggedTemplateExpression | BabelNodeTemplateLiteral | BabelNodeYieldExpression | BabelNodeTypeCastExpression | BabelNodeJSXElement | BabelNodeJSXEmptyExpression | BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression | BabelNodeParenthesizedExpression | BabelNodeAwaitExpression | BabelNodeBindExpression | BabelNodeDoExpression;
type BabelNodeBinary = BabelNodeBinaryExpression | BabelNodeLogicalExpression;
type BabelNodeScopable = BabelNodeBlockStatement | BabelNodeCatchClause | BabelNodeDoWhileStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeProgram | BabelNodeObjectMethod | BabelNodeSwitchStatement | BabelNodeWhileStatement | BabelNodeArrowFunctionExpression | BabelNodeClassDeclaration | BabelNodeClassExpression | BabelNodeForOfStatement | BabelNodeClassMethod;
type BabelNodeBlockParent = BabelNodeBlockStatement | BabelNodeDoWhileStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeProgram | BabelNodeObjectMethod | BabelNodeSwitchStatement | BabelNodeWhileStatement | BabelNodeArrowFunctionExpression | BabelNodeForOfStatement | BabelNodeClassMethod;
type BabelNodeBlock = BabelNodeBlockStatement | BabelNodeProgram;
type BabelNodeStatement = BabelNodeBlockStatement | BabelNodeBreakStatement | BabelNodeContinueStatement | BabelNodeDebuggerStatement | BabelNodeDoWhileStatement | BabelNodeEmptyStatement | BabelNodeExpressionStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeFunctionDeclaration | BabelNodeIfStatement | BabelNodeLabeledStatement | BabelNodeReturnStatement | BabelNodeSwitchStatement | BabelNodeThrowStatement | BabelNodeTryStatement | BabelNodeVariableDeclaration | BabelNodeWhileStatement | BabelNodeWithStatement | BabelNodeClassDeclaration | BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration | BabelNodeForOfStatement | BabelNodeImportDeclaration | BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareTypeAlias | BabelNodeDeclareVariable | BabelNodeInterfaceDeclaration | BabelNodeTypeAlias;
type BabelNodeTerminatorless = BabelNodeBreakStatement | BabelNodeContinueStatement | BabelNodeReturnStatement | BabelNodeThrowStatement | BabelNodeYieldExpression | BabelNodeAwaitExpression;
type BabelNodeCompletionStatement = BabelNodeBreakStatement | BabelNodeContinueStatement | BabelNodeReturnStatement | BabelNodeThrowStatement;
type BabelNodeConditional = BabelNodeConditionalExpression | BabelNodeIfStatement;
type BabelNodeLoop = BabelNodeDoWhileStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeWhileStatement | BabelNodeForOfStatement;
type BabelNodeWhile = BabelNodeDoWhileStatement | BabelNodeWhileStatement;
type BabelNodeExpressionWrapper = BabelNodeExpressionStatement | BabelNodeTypeCastExpression | BabelNodeParenthesizedExpression;
type BabelNodeFor = BabelNodeForInStatement | BabelNodeForStatement | BabelNodeForOfStatement;
type BabelNodeForXStatement = BabelNodeForInStatement | BabelNodeForOfStatement;
type BabelNodeFunction = BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeObjectMethod | BabelNodeArrowFunctionExpression | BabelNodeClassMethod;
type BabelNodeFunctionParent = BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeProgram | BabelNodeObjectMethod | BabelNodeArrowFunctionExpression | BabelNodeClassMethod;
type BabelNodePureish = BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeArrowFunctionExpression | BabelNodeClassDeclaration | BabelNodeClassExpression;
type BabelNodeDeclaration = BabelNodeFunctionDeclaration | BabelNodeVariableDeclaration | BabelNodeClassDeclaration | BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration | BabelNodeImportDeclaration | BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareVariable | BabelNodeInterfaceDeclaration | BabelNodeTypeAlias;
type BabelNodeLVal = BabelNodeIdentifier | BabelNodeMemberExpression | BabelNodeRestElement | BabelNodeAssignmentPattern | BabelNodeArrayPattern | BabelNodeObjectPattern;
type BabelNodeLiteral = BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeRegExpLiteral | BabelNodeTemplateLiteral;
type BabelNodeImmutable = BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeJSXAttribute | BabelNodeJSXClosingElement | BabelNodeJSXElement | BabelNodeJSXExpressionContainer | BabelNodeJSXOpeningElement;
type BabelNodeUserWhitespacable = BabelNodeObjectMethod | BabelNodeObjectProperty | BabelNodeObjectTypeCallProperty | BabelNodeObjectTypeIndexer | BabelNodeObjectTypeProperty;
type BabelNodeMethod = BabelNodeObjectMethod | BabelNodeClassMethod;
type BabelNodeObjectMember = BabelNodeObjectMethod | BabelNodeObjectProperty;
type BabelNodeProperty = BabelNodeObjectProperty | BabelNodeClassProperty;
type BabelNodeUnaryLike = BabelNodeUnaryExpression | BabelNodeSpreadElement | BabelNodeRestProperty | BabelNodeSpreadProperty;
type BabelNodePattern = BabelNodeAssignmentPattern | BabelNodeArrayPattern | BabelNodeObjectPattern;
type BabelNodeClass = BabelNodeClassDeclaration | BabelNodeClassExpression;
type BabelNodeModuleDeclaration = BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration | BabelNodeImportDeclaration;
type BabelNodeExportDeclaration = BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration;
type BabelNodeModuleSpecifier = BabelNodeExportSpecifier | BabelNodeImportDefaultSpecifier | BabelNodeImportNamespaceSpecifier | BabelNodeImportSpecifier | BabelNodeExportDefaultSpecifier | BabelNodeExportNamespaceSpecifier;
type BabelNodeFlow = BabelNodeAnyTypeAnnotation | BabelNodeArrayTypeAnnotation | BabelNodeBooleanTypeAnnotation | BabelNodeBooleanLiteralTypeAnnotation | BabelNodeNullLiteralTypeAnnotation | BabelNodeClassImplements | BabelNodeClassProperty | BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareVariable | BabelNodeExistentialTypeParam | BabelNodeFunctionTypeAnnotation | BabelNodeFunctionTypeParam | BabelNodeGenericTypeAnnotation | BabelNodeInterfaceExtends | BabelNodeInterfaceDeclaration | BabelNodeIntersectionTypeAnnotation | BabelNodeMixedTypeAnnotation | BabelNodeNullableTypeAnnotation | BabelNodeNumericLiteralTypeAnnotation | BabelNodeNumberTypeAnnotation | BabelNodeStringLiteralTypeAnnotation | BabelNodeStringTypeAnnotation | BabelNodeThisTypeAnnotation | BabelNodeTupleTypeAnnotation | BabelNodeTypeofTypeAnnotation | BabelNodeTypeAlias | BabelNodeTypeAnnotation | BabelNodeTypeCastExpression | BabelNodeTypeParameterDeclaration | BabelNodeTypeParameterInstantiation | BabelNodeObjectTypeAnnotation | BabelNodeObjectTypeCallProperty | BabelNodeObjectTypeIndexer | BabelNodeObjectTypeProperty | BabelNodeQualifiedTypeIdentifier | BabelNodeUnionTypeAnnotation | BabelNodeVoidTypeAnnotation;
type BabelNodeFlowBaseAnnotation = BabelNodeAnyTypeAnnotation | BabelNodeBooleanTypeAnnotation | BabelNodeNullLiteralTypeAnnotation | BabelNodeMixedTypeAnnotation | BabelNodeNumberTypeAnnotation | BabelNodeStringTypeAnnotation | BabelNodeThisTypeAnnotation | BabelNodeVoidTypeAnnotation;
type BabelNodeFlowDeclaration = BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareVariable | BabelNodeInterfaceDeclaration | BabelNodeTypeAlias;
type BabelNodeJSX = BabelNodeJSXAttribute | BabelNodeJSXClosingElement | BabelNodeJSXElement | BabelNodeJSXEmptyExpression | BabelNodeJSXExpressionContainer | BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression | BabelNodeJSXNamespacedName | BabelNodeJSXOpeningElement | BabelNodeJSXSpreadAttribute | BabelNodeJSXText;


declare class BabelTypes {
    types: {
  assertLiteral(value:BabelNode): void;
  isValidIdentifier(value: string): boolean;
  assignmentExpression(operator: string, left: BabelNodeLVal, right: BabelNodeExpression): BabelNodeAssignmentExpression;
  binaryExpression(operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=", left: BabelNodeExpression, right: BabelNodeExpression): BabelNodeBinaryExpression;
  directive(value: BabelNodeDirectiveLiteral): BabelNodeDirective;
  directiveLiteral(value: string): BabelNodeDirectiveLiteral;
  blockStatement(directives?: any, body: any): BabelNodeBlockStatement;
  breakStatement(label?: ?BabelNodeIdentifier): BabelNodeBreakStatement;
  callExpression(callee: BabelNodeExpression, _arguments: any): BabelNodeCallExpression;
  catchClause(param: BabelNodeIdentifier, body: BabelNodeBlockStatement): BabelNodeCatchClause;
  conditionalExpression(test: BabelNodeExpression, consequent: BabelNodeExpression, alternate: BabelNodeExpression): BabelNodeConditionalExpression;
  continueStatement(label?: ?BabelNodeIdentifier): BabelNodeContinueStatement;
  debuggerStatement(): BabelNodeDebuggerStatement;
  doWhileStatement(test: BabelNodeExpression, body: BabelNodeStatement): BabelNodeDoWhileStatement;
  emptyStatement(): BabelNodeEmptyStatement;
  expressionStatement(expression: BabelNodeExpression): BabelNodeExpressionStatement;
  file(program: BabelNodeProgram, comments: any, tokens: any): BabelNodeFile;
  forInStatement(left: BabelNodeVariableDeclaration | BabelNodeLVal, right: BabelNodeExpression, body: BabelNodeStatement): BabelNodeForInStatement;
  forStatement(init?: ?BabelNodeVariableDeclaration | BabelNodeExpression, test?: ?BabelNodeExpression, update?: ?BabelNodeExpression, body: BabelNodeStatement): BabelNodeForStatement;
  functionDeclaration(id: BabelNodeIdentifier, params: any, body: BabelNodeBlockStatement, generator?: boolean, async?: boolean, returnType: any, typeParameters: any): BabelNodeFunctionDeclaration;
  functionExpression(id?: ?BabelNodeIdentifier, params: any, body: BabelNodeBlockStatement, generator?: boolean, async?: boolean, returnType: any, typeParameters: any): BabelNodeFunctionExpression;
  identifier(name: any, typeAnnotation: any): BabelNodeIdentifier;
  ifStatement(test: BabelNodeExpression, consequent: BabelNodeStatement, alternate?: ?BabelNodeStatement): BabelNodeIfStatement;
  labeledStatement(label: BabelNodeIdentifier, body: BabelNodeStatement): BabelNodeLabeledStatement;
  stringLiteral(value: string): BabelNodeStringLiteral;
  numericLiteral(value: number): BabelNodeNumericLiteral;
  nullLiteral(): BabelNodeNullLiteral;
  booleanLiteral(value: boolean): BabelNodeBooleanLiteral;
  regExpLiteral(pattern: string, flags?: string): BabelNodeRegExpLiteral;
  logicalExpression(operator: "||" | "&&", left: BabelNodeExpression, right: BabelNodeExpression): BabelNodeLogicalExpression;
  memberExpression(object: BabelNodeExpression, property: any, computed?: boolean): BabelNodeMemberExpression;
  newExpression(callee: BabelNodeExpression, _arguments: any): BabelNodeNewExpression;
  program(directives?: any, body: any): BabelNodeProgram;
  objectExpression(properties: any): BabelNodeObjectExpression;
  objectMethod(kind?: any, computed?: boolean, key: any, decorators: any, body: BabelNodeBlockStatement, generator?: boolean, async?: boolean, params: any, returnType: any, typeParameters: any): BabelNodeObjectMethod;
  objectProperty(computed?: boolean, key: any, value: BabelNodeExpression, shorthand?: boolean, decorators?: any): BabelNodeObjectProperty;
  restElement(argument: BabelNodeLVal, typeAnnotation: any): BabelNodeRestElement;
  returnStatement(argument?: ?BabelNodeExpression): BabelNodeReturnStatement;
  sequenceExpression(expressions: any): BabelNodeSequenceExpression;
  switchCase(test?: ?BabelNodeExpression, consequent: any): BabelNodeSwitchCase;
  switchStatement(discriminant: BabelNodeExpression, cases: any): BabelNodeSwitchStatement;
  thisExpression(): BabelNodeThisExpression;
  throwStatement(argument: BabelNodeExpression): BabelNodeThrowStatement;
  tryStatement(body: BabelNodeBlockStatement, handler?: any, finalizer?: ?BabelNodeBlockStatement, block: any): BabelNodeTryStatement;
  unaryExpression(prefix?: boolean, argument: BabelNodeExpression, operator: "void" | "delete" | "!" | "+" | "-" | "++" | "--" | "~" | "typeof"): BabelNodeUnaryExpression;
  updateExpression(prefix?: boolean, argument: BabelNodeExpression, operator: "++" | "--"): BabelNodeUpdateExpression;
  variableDeclaration(kind: any, declarations: any): BabelNodeVariableDeclaration;
  variableDeclarator(id: BabelNodeLVal, init?: ?BabelNodeExpression): BabelNodeVariableDeclarator;
  whileStatement(test: BabelNodeExpression, body: BabelNodeBlockStatement | BabelNodeStatement): BabelNodeWhileStatement;
  withStatement(object: any, body: BabelNodeBlockStatement | BabelNodeStatement): BabelNodeWithStatement;
  assignmentPattern(left: BabelNodeIdentifier, right: BabelNodeExpression): BabelNodeAssignmentPattern;
  arrayPattern(elements: any, typeAnnotation: any): BabelNodeArrayPattern;
  arrowFunctionExpression(params: any, body: BabelNodeBlockStatement | BabelNodeExpression, async?: boolean, returnType: any): BabelNodeArrowFunctionExpression;
  classBody(body: any): BabelNodeClassBody;
  classDeclaration(id: BabelNodeIdentifier, body: BabelNodeClassBody, superClass?: ?BabelNodeExpression, decorators: any, mixins: any, typeParameters: any, superTypeParameters: any, _implements: any): BabelNodeClassDeclaration;
  classExpression(id?: ?BabelNodeIdentifier, body: BabelNodeClassBody, superClass?: ?BabelNodeExpression, decorators: any, mixins: any, typeParameters: any, superTypeParameters: any, _implements: any): BabelNodeClassExpression;
  exportAllDeclaration(source: BabelNodeStringLiteral): BabelNodeExportAllDeclaration;
  exportDefaultDeclaration(declaration: BabelNodeFunctionDeclaration | BabelNodeClassDeclaration | BabelNodeExpression): BabelNodeExportDefaultDeclaration;
  exportNamedDeclaration(declaration?: ?BabelNodeDeclaration, specifiers: any, source?: ?BabelNodeStringLiteral): BabelNodeExportNamedDeclaration;
  exportSpecifier(local: BabelNodeIdentifier, imported: BabelNodeIdentifier, exported: any): BabelNodeExportSpecifier;
  forOfStatement(left: BabelNodeVariableDeclaration | BabelNodeLVal, right: BabelNodeExpression, body: BabelNodeStatement): BabelNodeForOfStatement;
  importDeclaration(specifiers: any, source: BabelNodeStringLiteral): BabelNodeImportDeclaration;
  importDefaultSpecifier(local: BabelNodeIdentifier): BabelNodeImportDefaultSpecifier;
  importNamespaceSpecifier(local: BabelNodeIdentifier): BabelNodeImportNamespaceSpecifier;
  importSpecifier(local: BabelNodeIdentifier, imported: BabelNodeIdentifier): BabelNodeImportSpecifier;
  metaProperty(meta: string, property: string): BabelNodeMetaProperty;
  classMethod(kind?: any, computed?: boolean, _static?: boolean, key: any, params: any, body: BabelNodeBlockStatement, generator?: boolean, async?: boolean, decorators: any, returnType: any, typeParameters: any): BabelNodeClassMethod;
  objectPattern(properties: any, typeAnnotation: any): BabelNodeObjectPattern;
  spreadElement(argument: BabelNodeExpression): BabelNodeSpreadElement;
  taggedTemplateExpression(tag: BabelNodeExpression, quasi: BabelNodeTemplateLiteral): BabelNodeTaggedTemplateExpression;
  templateElement(value: any, tail?: boolean): BabelNodeTemplateElement;
  templateLiteral(quasis: any, expressions: any): BabelNodeTemplateLiteral;
  yieldExpression(delegate?: boolean, argument?: ?BabelNodeExpression): BabelNodeYieldExpression;
  anyTypeAnnotation(): BabelNodeAnyTypeAnnotation;
  arrayTypeAnnotation(elementType: any): BabelNodeArrayTypeAnnotation;
  booleanTypeAnnotation(): BabelNodeBooleanTypeAnnotation;
  booleanLiteralTypeAnnotation(): BabelNodeBooleanLiteralTypeAnnotation;
  nullLiteralTypeAnnotation(): BabelNodeNullLiteralTypeAnnotation;
  classImplements(id: any, typeParameters: any): BabelNodeClassImplements;
  classProperty(key: any, value: any, typeAnnotation: any, decorators: any): BabelNodeClassProperty;
  declareClass(id: any, typeParameters: any, _extends: any, body: any): BabelNodeDeclareClass;
  declareFunction(id: any): BabelNodeDeclareFunction;
  declareInterface(id: any, typeParameters: any, _extends: any, body: any): BabelNodeDeclareInterface;
  declareModule(id: any, body: any): BabelNodeDeclareModule;
  declareModuleExports(typeAnnotation: any): BabelNodeDeclareModuleExports;
  declareTypeAlias(id: any, typeParameters: any, right: any): BabelNodeDeclareTypeAlias;
  declareVariable(id: any): BabelNodeDeclareVariable;
  existentialTypeParam(): BabelNodeExistentialTypeParam;
  functionTypeAnnotation(typeParameters: any, params: any, rest: any, returnType: any): BabelNodeFunctionTypeAnnotation;
  functionTypeParam(name: any, typeAnnotation: any): BabelNodeFunctionTypeParam;
  genericTypeAnnotation(id: any, typeParameters: any): BabelNodeGenericTypeAnnotation;
  interfaceExtends(id: any, typeParameters: any): BabelNodeInterfaceExtends;
  interfaceDeclaration(id: any, typeParameters: any, _extends: any, body: any): BabelNodeInterfaceDeclaration;
  intersectionTypeAnnotation(types: any): BabelNodeIntersectionTypeAnnotation;
  mixedTypeAnnotation(): BabelNodeMixedTypeAnnotation;
  nullableTypeAnnotation(typeAnnotation: any): BabelNodeNullableTypeAnnotation;
  numericLiteralTypeAnnotation(): BabelNodeNumericLiteralTypeAnnotation;
  numberTypeAnnotation(): BabelNodeNumberTypeAnnotation;
  stringLiteralTypeAnnotation(): BabelNodeStringLiteralTypeAnnotation;
  stringTypeAnnotation(): BabelNodeStringTypeAnnotation;
  thisTypeAnnotation(): BabelNodeThisTypeAnnotation;
  tupleTypeAnnotation(types: any): BabelNodeTupleTypeAnnotation;
  typeofTypeAnnotation(argument: any): BabelNodeTypeofTypeAnnotation;
  typeAlias(id: any, typeParameters: any, right: any): BabelNodeTypeAlias;
  typeAnnotation(typeAnnotation: any): BabelNodeTypeAnnotation;
  typeCastExpression(expression: any, typeAnnotation: any): BabelNodeTypeCastExpression;
  typeParameterDeclaration(params: any): BabelNodeTypeParameterDeclaration;
  typeParameterInstantiation(params: any): BabelNodeTypeParameterInstantiation;
  objectTypeAnnotation(properties: any, indexers: any, callProperties: any): BabelNodeObjectTypeAnnotation;
  objectTypeCallProperty(value: any): BabelNodeObjectTypeCallProperty;
  objectTypeIndexer(id: any, key: any, value: any): BabelNodeObjectTypeIndexer;
  objectTypeProperty(key: any, value: any): BabelNodeObjectTypeProperty;
  qualifiedTypeIdentifier(id: any, qualification: any): BabelNodeQualifiedTypeIdentifier;
  unionTypeAnnotation(types: any): BabelNodeUnionTypeAnnotation;
  voidTypeAnnotation(): BabelNodeVoidTypeAnnotation;
  jSXAttribute(name: BabelNodeJSXIdentifier | BabelNodeJSXNamespacedName, value?: ?BabelNodeJSXElement | BabelNodeStringLiteral | BabelNodeJSXExpressionContainer): BabelNodeJSXAttribute;
  jSXClosingElement(name: BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression): BabelNodeJSXClosingElement;
  jSXElement(openingElement: BabelNodeJSXOpeningElement, closingElement?: ?BabelNodeJSXClosingElement, children: any, selfClosing: any): BabelNodeJSXElement;
  jSXEmptyExpression(): BabelNodeJSXEmptyExpression;
  jSXExpressionContainer(expression: BabelNodeExpression): BabelNodeJSXExpressionContainer;
  jSXIdentifier(name: string): BabelNodeJSXIdentifier;
  jSXMemberExpression(object: BabelNodeJSXMemberExpression | BabelNodeJSXIdentifier, property: BabelNodeJSXIdentifier): BabelNodeJSXMemberExpression;
  jSXNamespacedName(namespace: BabelNodeJSXIdentifier, name: BabelNodeJSXIdentifier): BabelNodeJSXNamespacedName;
  jSXOpeningElement(name: BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression, selfClosing?: boolean, attributes: any): BabelNodeJSXOpeningElement;
  jSXSpreadAttribute(argument: BabelNodeExpression): BabelNodeJSXSpreadAttribute;
  jSXText(value: string): BabelNodeJSXText;
  noop(): BabelNodeNoop;
  parenthesizedExpression(expression: BabelNodeExpression): BabelNodeParenthesizedExpression;
  awaitExpression(argument: BabelNodeExpression): BabelNodeAwaitExpression;
  bindExpression(object: any, callee: any): BabelNodeBindExpression;
  decorator(expression: BabelNodeExpression): BabelNodeDecorator;
  doExpression(body: BabelNodeBlockStatement): BabelNodeDoExpression;
  exportDefaultSpecifier(exported: BabelNodeIdentifier): BabelNodeExportDefaultSpecifier;
  exportNamespaceSpecifier(exported: BabelNodeIdentifier): BabelNodeExportNamespaceSpecifier;
  restProperty(argument: BabelNodeLVal): BabelNodeRestProperty;
  spreadProperty(argument: BabelNodeExpression): BabelNodeSpreadProperty;
  isArrayExpression(node: Object, opts?: Object): boolean;
  isAssignmentExpression(node: Object, opts?: Object): boolean;
  isBinaryExpression(node: Object, opts?: Object): boolean;
  isDirective(node: Object, opts?: Object): boolean;
  isDirectiveLiteral(node: Object, opts?: Object): boolean;
  isBlockStatement(node: Object, opts?: Object): boolean;
  isBreakStatement(node: Object, opts?: Object): boolean;
  isCallExpression(node: Object, opts?: Object): boolean;
  isCatchClause(node: Object, opts?: Object): boolean;
  isConditionalExpression(node: Object, opts?: Object): boolean;
  isContinueStatement(node: Object, opts?: Object): boolean;
  isDebuggerStatement(node: Object, opts?: Object): boolean;
  isDoWhileStatement(node: Object, opts?: Object): boolean;
  isEmptyStatement(node: Object, opts?: Object): boolean;
  isExpressionStatement(node: Object, opts?: Object): boolean;
  isFile(node: Object, opts?: Object): boolean;
  isForInStatement(node: Object, opts?: Object): boolean;
  isForStatement(node: Object, opts?: Object): boolean;
  isFunctionDeclaration(node: Object, opts?: Object): boolean;
  isFunctionExpression(node: Object, opts?: Object): boolean;
  isIdentifier(node: Object, opts?: Object): boolean;
  isIfStatement(node: Object, opts?: Object): boolean;
  isLabeledStatement(node: Object, opts?: Object): boolean;
  isStringLiteral(node: Object, opts?: Object): boolean;
  isNumericLiteral(node: Object, opts?: Object): boolean;
  isNullLiteral(node: Object, opts?: Object): boolean;
  isBooleanLiteral(node: Object, opts?: Object): boolean;
  isRegExpLiteral(node: Object, opts?: Object): boolean;
  isLogicalExpression(node: Object, opts?: Object): boolean;
  isMemberExpression(node: Object, opts?: Object): boolean;
  isNewExpression(node: Object, opts?: Object): boolean;
  isProgram(node: Object, opts?: Object): boolean;
  isObjectExpression(node: Object, opts?: Object): boolean;
  isObjectMethod(node: Object, opts?: Object): boolean;
  isObjectProperty(node: Object, opts?: Object): boolean;
  isRestElement(node: Object, opts?: Object): boolean;
  isReturnStatement(node: Object, opts?: Object): boolean;
  isSequenceExpression(node: Object, opts?: Object): boolean;
  isSwitchCase(node: Object, opts?: Object): boolean;
  isSwitchStatement(node: Object, opts?: Object): boolean;
  isThisExpression(node: Object, opts?: Object): boolean;
  isThrowStatement(node: Object, opts?: Object): boolean;
  isTryStatement(node: Object, opts?: Object): boolean;
  isUnaryExpression(node: Object, opts?: Object): boolean;
  isUpdateExpression(node: Object, opts?: Object): boolean;
  isVariableDeclaration(node: Object, opts?: Object): boolean;
  isVariableDeclarator(node: Object, opts?: Object): boolean;
  isWhileStatement(node: Object, opts?: Object): boolean;
  isWithStatement(node: Object, opts?: Object): boolean;
  isAssignmentPattern(node: Object, opts?: Object): boolean;
  isArrayPattern(node: Object, opts?: Object): boolean;
  isArrowFunctionExpression(node: Object, opts?: Object): boolean;
  isClassBody(node: Object, opts?: Object): boolean;
  isClassDeclaration(node: Object, opts?: Object): boolean;
  isClassExpression(node: Object, opts?: Object): boolean;
  isExportAllDeclaration(node: Object, opts?: Object): boolean;
  isExportDefaultDeclaration(node: Object, opts?: Object): boolean;
  isExportNamedDeclaration(node: Object, opts?: Object): boolean;
  isExportSpecifier(node: Object, opts?: Object): boolean;
  isForOfStatement(node: Object, opts?: Object): boolean;
  isImportDeclaration(node: Object, opts?: Object): boolean;
  isImportDefaultSpecifier(node: Object, opts?: Object): boolean;
  isImportNamespaceSpecifier(node: Object, opts?: Object): boolean;
  isImportSpecifier(node: Object, opts?: Object): boolean;
  isMetaProperty(node: Object, opts?: Object): boolean;
  isClassMethod(node: Object, opts?: Object): boolean;
  isObjectPattern(node: Object, opts?: Object): boolean;
  isSpreadElement(node: Object, opts?: Object): boolean;
  isSuper(node: Object, opts?: Object): boolean;
  isTaggedTemplateExpression(node: Object, opts?: Object): boolean;
  isTemplateElement(node: Object, opts?: Object): boolean;
  isTemplateLiteral(node: Object, opts?: Object): boolean;
  isYieldExpression(node: Object, opts?: Object): boolean;
  isAnyTypeAnnotation(node: Object, opts?: Object): boolean;
  isArrayTypeAnnotation(node: Object, opts?: Object): boolean;
  isBooleanTypeAnnotation(node: Object, opts?: Object): boolean;
  isBooleanLiteralTypeAnnotation(node: Object, opts?: Object): boolean;
  isNullLiteralTypeAnnotation(node: Object, opts?: Object): boolean;
  isClassImplements(node: Object, opts?: Object): boolean;
  isClassProperty(node: Object, opts?: Object): boolean;
  isDeclareClass(node: Object, opts?: Object): boolean;
  isDeclareFunction(node: Object, opts?: Object): boolean;
  isDeclareInterface(node: Object, opts?: Object): boolean;
  isDeclareModule(node: Object, opts?: Object): boolean;
  isDeclareModuleExports(node: Object, opts?: Object): boolean;
  isDeclareTypeAlias(node: Object, opts?: Object): boolean;
  isDeclareVariable(node: Object, opts?: Object): boolean;
  isExistentialTypeParam(node: Object, opts?: Object): boolean;
  isFunctionTypeAnnotation(node: Object, opts?: Object): boolean;
  isFunctionTypeParam(node: Object, opts?: Object): boolean;
  isGenericTypeAnnotation(node: Object, opts?: Object): boolean;
  isInterfaceExtends(node: Object, opts?: Object): boolean;
  isInterfaceDeclaration(node: Object, opts?: Object): boolean;
  isIntersectionTypeAnnotation(node: Object, opts?: Object): boolean;
  isMixedTypeAnnotation(node: Object, opts?: Object): boolean;
  isNullableTypeAnnotation(node: Object, opts?: Object): boolean;
  isNumericLiteralTypeAnnotation(node: Object, opts?: Object): boolean;
  isNumberTypeAnnotation(node: Object, opts?: Object): boolean;
  isStringLiteralTypeAnnotation(node: Object, opts?: Object): boolean;
  isStringTypeAnnotation(node: Object, opts?: Object): boolean;
  isThisTypeAnnotation(node: Object, opts?: Object): boolean;
  isTupleTypeAnnotation(node: Object, opts?: Object): boolean;
  isTypeofTypeAnnotation(node: Object, opts?: Object): boolean;
  isTypeAlias(node: Object, opts?: Object): boolean;
  isTypeAnnotation(node: Object, opts?: Object): boolean;
  isTypeCastExpression(node: Object, opts?: Object): boolean;
  isTypeParameterDeclaration(node: Object, opts?: Object): boolean;
  isTypeParameterInstantiation(node: Object, opts?: Object): boolean;
  isObjectTypeAnnotation(node: Object, opts?: Object): boolean;
  isObjectTypeCallProperty(node: Object, opts?: Object): boolean;
  isObjectTypeIndexer(node: Object, opts?: Object): boolean;
  isObjectTypeProperty(node: Object, opts?: Object): boolean;
  isQualifiedTypeIdentifier(node: Object, opts?: Object): boolean;
  isUnionTypeAnnotation(node: Object, opts?: Object): boolean;
  isVoidTypeAnnotation(node: Object, opts?: Object): boolean;
  isJSXAttribute(node: Object, opts?: Object): boolean;
  isJSXClosingElement(node: Object, opts?: Object): boolean;
  isJSXElement(node: Object, opts?: Object): boolean;
  isJSXEmptyExpression(node: Object, opts?: Object): boolean;
  isJSXExpressionContainer(node: Object, opts?: Object): boolean;
  isJSXIdentifier(node: Object, opts?: Object): boolean;
  isJSXMemberExpression(node: Object, opts?: Object): boolean;
  isJSXNamespacedName(node: Object, opts?: Object): boolean;
  isJSXOpeningElement(node: Object, opts?: Object): boolean;
  isJSXSpreadAttribute(node: Object, opts?: Object): boolean;
  isJSXText(node: Object, opts?: Object): boolean;
  isNoop(node: Object, opts?: Object): boolean;
  isParenthesizedExpression(node: Object, opts?: Object): boolean;
  isAwaitExpression(node: Object, opts?: Object): boolean;
  isBindExpression(node: Object, opts?: Object): boolean;
  isDecorator(node: Object, opts?: Object): boolean;
  isDoExpression(node: Object, opts?: Object): boolean;
  isExportDefaultSpecifier(node: Object, opts?: Object): boolean;
  isExportNamespaceSpecifier(node: Object, opts?: Object): boolean;
  isRestProperty(node: Object, opts?: Object): boolean;
  isSpreadProperty(node: Object, opts?: Object): boolean;
  isExpression(node: Object, opts?: Object): boolean;
  isBinary(node: Object, opts?: Object): boolean;
  isScopable(node: Object, opts?: Object): boolean;
  isBlockParent(node: Object, opts?: Object): boolean;
  isBlock(node: Object, opts?: Object): boolean;
  isStatement(node: Object, opts?: Object): boolean;
  isTerminatorless(node: Object, opts?: Object): boolean;
  isCompletionStatement(node: Object, opts?: Object): boolean;
  isConditional(node: Object, opts?: Object): boolean;
  isLoop(node: Object, opts?: Object): boolean;
  isWhile(node: Object, opts?: Object): boolean;
  isExpressionWrapper(node: Object, opts?: Object): boolean;
  isFor(node: Object, opts?: Object): boolean;
  isForXStatement(node: Object, opts?: Object): boolean;
  isFunction(node: Object, opts?: Object): boolean;
  isFunctionParent(node: Object, opts?: Object): boolean;
  isPureish(node: Object, opts?: Object): boolean;
  isDeclaration(node: Object, opts?: Object): boolean;
  isLVal(node: Object, opts?: Object): boolean;
  isLiteral(node: Object, opts?: Object): boolean;
  isImmutable(node: Object, opts?: Object): boolean;
  isUserWhitespacable(node: Object, opts?: Object): boolean;
  isMethod(node: Object, opts?: Object): boolean;
  isObjectMember(node: Object, opts?: Object): boolean;
  isProperty(node: Object, opts?: Object): boolean;
  isUnaryLike(node: Object, opts?: Object): boolean;
  isPattern(node: Object, opts?: Object): boolean;
  isClass(node: Object, opts?: Object): boolean;
  isModuleDeclaration(node: Object, opts?: Object): boolean;
  isExportDeclaration(node: Object, opts?: Object): boolean;
  isModuleSpecifier(node: Object, opts?: Object): boolean;
  isFlow(node: Object, opts?: Object): boolean;
  isFlowBaseAnnotation(node: Object, opts?: Object): boolean;
  isFlowDeclaration(node: Object, opts?: Object): boolean;
  isJSX(node: Object, opts?: Object): boolean;
  isNumberLiteral(node: Object, opts?: Object): boolean;
  isRegexLiteral(node: Object, opts?: Object): boolean;
  isReferencedIdentifier(node: Object, opts?: Object): boolean;
  isReferencedMemberExpression(node: Object, opts?: Object): boolean;
  isBindingIdentifier(node: Object, opts?: Object): boolean;
  isScope(node: Object, opts?: Object): boolean;
  isReferenced(node: Object, opts?: Object): boolean;
  isBlockScoped(node: Object, opts?: Object): boolean;
  isVar(node: Object, opts?: Object): boolean;
  isUser(node: Object, opts?: Object): boolean;
  isGenerated(node: Object, opts?: Object): boolean;
  isPure(node: Object, opts?: Object): boolean;
    }
}
