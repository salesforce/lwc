/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { LWC_COMPONENT_PROPERTIES, LWC_PACKAGE_EXPORTS } from '../constants';
import { handleError } from '../utils';
import type {
    KeyValueProperty,
    ObjectExpression,
    NumericLiteral,
    Identifier,
    StringLiteral,
    ArrayExpression,
    FunctionExpression,
    BlockStatement,
    ReturnStatement,
    MemberExpression,
    Expression,
    VariableDeclaration,
    VariableDeclarator,
    ConditionalExpression,
    BinaryExpression,
    AssignmentExpression,
    ExprOrSpread,
    Span,
    CallExpression,
    Pattern,
    Param,
} from '@swc/types';
import type { DecoratorMeta } from './types';
import type { VisitorState } from '../utils';
import type { BindingInfo } from '../types';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

const WIRE_PARAM_PREFIX = '$';
const WIRE_CONFIG_ARG_NAME = '$cmp';

const { TRACK_DECORATOR, API_DECORATOR, WIRE_DECORATOR } = LWC_PACKAGE_EXPORTS;

function isWireDecorator(decorator: DecoratorMeta) {
    return decorator.name === 'wire';
}

// --- AST helpers ---

function makeIdentifier(value: string): Identifier {
    return { type: 'Identifier', value, optional: false, span: DUMMY_SPAN, ctxt: 0 } as any;
}

function makeStringLiteral(value: string): StringLiteral {
    return { type: 'StringLiteral', value, span: DUMMY_SPAN, raw: JSON.stringify(value) };
}

function makeNumericLiteral(value: number): NumericLiteral {
    return { type: 'NumericLiteral', value, span: DUMMY_SPAN };
}

function makeObjectExpression(properties: KeyValueProperty[]): ObjectExpression {
    return { type: 'ObjectExpression', properties, span: DUMMY_SPAN };
}

function makeKeyValueProperty(
    key: Identifier | StringLiteral,
    value: Expression
): KeyValueProperty {
    return { type: 'KeyValueProperty', key, value };
}

function makeArrayExpression(elements: Expression[]): ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements: elements.map((e) => ({ expression: e }) as ExprOrSpread),
        span: DUMMY_SPAN,
    };
}

function makeMemberExpression(
    object: Expression,
    property: Identifier | StringLiteral,
    computed = false
): MemberExpression {
    return {
        type: 'MemberExpression',
        object,
        property:
            computed || property.type === 'StringLiteral'
                ? { type: 'Computed', expression: property as Expression, span: DUMMY_SPAN }
                : (property as Identifier),
        span: DUMMY_SPAN,
    };
}

// --- Wire config key/value types ---

/** A parsed param entry: key + StringLiteral value like "$propName.sub" */
interface WireParamEntry {
    key: Identifier | StringLiteral;
    value: StringLiteral; // The raw "$propName.sub" value
    computed: boolean;
}

interface WiredValue {
    propertyName: string;
    isClassMethod: boolean;
    /**
     * Static config properties (non-$-prefixed). Stored as raw AST property nodes
     * so they are passed through verbatim into the generated config function,
     * matching Babel's behavior of not transforming these entries.
     */
    staticProps?: any[];
    paramEntries?: WireParamEntry[];
    adapter?: {
        name: string;
        expression: Expression;
        reference: string | undefined;
    };
}

function isObservedProperty(
    key: Identifier | StringLiteral | Expression,
    value: Expression
): boolean {
    return (
        value.type === 'StringLiteral' &&
        (value as StringLiteral).value.startsWith(WIRE_PARAM_PREFIX)
    );
}

function isValidIdentifier(name: string): boolean {
    // Simple valid ES3 identifier check
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

function generateParameterConfigValue(
    memberExprPaths: string[],
    varName = 'v'
): { varDeclaration?: VariableDeclaration; configValueExpression: Expression } {
    const isInvalidMemberExpr = memberExprPaths.some(
        (maybeIdentifier) => !isValidIdentifier(maybeIdentifier) || maybeIdentifier.length === 0
    );

    const makePropertyAccessor = (name: string): Identifier | StringLiteral =>
        isInvalidMemberExpr ? makeStringLiteral(name) : makeIdentifier(name);

    if (memberExprPaths.length === 1) {
        return {
            configValueExpression: makeMemberExpression(
                makeIdentifier(WIRE_CONFIG_ARG_NAME),
                makePropertyAccessor(memberExprPaths[0]),
                isInvalidMemberExpr
            ),
        };
    }

    const varDeclaration: VariableDeclaration = {
        type: 'VariableDeclaration',
        kind: 'let',
        declare: false,
        declarations: [
            {
                type: 'VariableDeclarator',
                id: makeIdentifier(varName) as unknown as Pattern,
                init: makeMemberExpression(
                    makeIdentifier(WIRE_CONFIG_ARG_NAME),
                    makePropertyAccessor(memberExprPaths[0]),
                    isInvalidMemberExpr
                ),
                definite: false,
                span: DUMMY_SPAN,
            } as VariableDeclarator,
        ],
        span: DUMMY_SPAN,
        ctxt: 0,
    } as any;

    // Build: v != null && ... (v = v.i) != null && ...
    let conditionTest: Expression = {
        type: 'BinaryExpression',
        operator: '!=',
        left: makeIdentifier(varName),
        right: { type: 'NullLiteral', span: DUMMY_SPAN },
        span: DUMMY_SPAN,
    } as BinaryExpression;

    for (let i = 1; i < memberExprPaths.length - 1; i++) {
        const assignment: AssignmentExpression = {
            type: 'AssignmentExpression',
            operator: '=',
            left: makeIdentifier(varName) as unknown as Pattern,
            right: makeMemberExpression(
                makeIdentifier(varName),
                makePropertyAccessor(memberExprPaths[i]),
                isInvalidMemberExpr
            ),
            span: DUMMY_SPAN,
        };

        const nextTest: BinaryExpression = {
            type: 'BinaryExpression',
            operator: '!=',
            left: assignment as unknown as Expression,
            right: { type: 'NullLiteral', span: DUMMY_SPAN },
            span: DUMMY_SPAN,
        };

        conditionTest = {
            type: 'BinaryExpression',
            operator: '&&',
            left: conditionTest,
            right: nextTest,
            span: DUMMY_SPAN,
        } as BinaryExpression;
    }

    const configValueExpression: ConditionalExpression = {
        type: 'ConditionalExpression',
        test: conditionTest,
        consequent: makeMemberExpression(
            makeIdentifier(varName),
            makePropertyAccessor(memberExprPaths[memberExprPaths.length - 1]),
            isInvalidMemberExpr
        ),
        alternate: makeIdentifier('undefined'),
        span: DUMMY_SPAN,
    };

    return { varDeclaration, configValueExpression };
}

function getGeneratedConfig(wiredValue: WiredValue): KeyValueProperty {
    let counter = 0;
    const configBlockBody: (VariableDeclaration | ReturnStatement)[] = [];
    // configReturnProps holds all properties for the returned object.
    // Static props are passed through as raw AST nodes (preserving shorthand, numeric keys, methods, etc.)
    // Param props are synthesized as key → $cmp.prop expressions.
    const configReturnProps: any[] = [];

    if (wiredValue.staticProps) {
        // Pass through original static property nodes verbatim (shorthand, numeric keys, methods, etc.)
        for (const rawProp of wiredValue.staticProps) {
            configReturnProps.push(rawProp);
        }
    }

    if (wiredValue.paramEntries) {
        for (const param of wiredValue.paramEntries) {
            // The value contains the path like "$prop.sub.path", strip the $ prefix
            const rawValue = param.value.value.slice(1);
            const memberExprPaths = rawValue.split('.');

            // Use a unique var name per multi-level param to avoid duplicate let declarations
            // in the same config function body (e.g. two params like "$a.b" and "$c.d" would
            // both emit `let v = ...` without this, causing a REDECLARATION_ERROR).
            const paramVarName = memberExprPaths.length > 1 ? `v${counter}` : 'v';
            if (memberExprPaths.length > 1) {
                counter++;
            }
            const paramResult = generateParameterConfigValue(memberExprPaths, paramVarName);

            configReturnProps.push(
                makeKeyValueProperty(param.key, paramResult.configValueExpression)
            );

            if (paramResult.varDeclaration) {
                configBlockBody.push(paramResult.varDeclaration);
            }
        }
    }

    configBlockBody.push({
        type: 'ReturnStatement',
        argument: { type: 'ObjectExpression', properties: configReturnProps, span: DUMMY_SPAN },
        span: DUMMY_SPAN,
    } as ReturnStatement);

    const configFn: FunctionExpression = {
        type: 'FunctionExpression',
        identifier: undefined,
        params: [
            {
                type: 'Parameter',
                pat: makeIdentifier(WIRE_CONFIG_ARG_NAME) as unknown as Pattern,
                decorators: [],
                span: DUMMY_SPAN,
            } as Param,
        ],
        body: {
            type: 'BlockStatement',
            stmts: configBlockBody as any[],
            span: DUMMY_SPAN,
            ctxt: 0,
        } as any,
        async: false,
        generator: false,
        span: DUMMY_SPAN,
        ctxt: 0,
    } as any;

    return makeKeyValueProperty(makeIdentifier('config'), configFn);
}

function buildWireConfigValue(wiredValues: WiredValue[]): ObjectExpression {
    const entries: KeyValueProperty[] = wiredValues.map((wiredValue) => {
        const wireConfig: KeyValueProperty[] = [];

        if (wiredValue.adapter) {
            wireConfig.push(
                makeKeyValueProperty(makeIdentifier('adapter'), wiredValue.adapter.expression)
            );
        }

        if (wiredValue.paramEntries && wiredValue.paramEntries.length > 0) {
            // Build dynamic param names array
            const dynamicParamNames: Expression[] = wiredValue.paramEntries.map((p) => {
                if (p.key.type === 'Identifier') {
                    return p.computed
                        ? makeIdentifier(p.key.value)
                        : makeStringLiteral(p.key.value);
                } else if (p.key.type === 'StringLiteral') {
                    return makeStringLiteral(p.key.value);
                }
                // Fallback: use string representation
                return makeStringLiteral(String((p.key as any).value));
            });
            wireConfig.push(
                makeKeyValueProperty(
                    makeIdentifier('dynamic'),
                    makeArrayExpression(dynamicParamNames)
                )
            );
        }

        if (wiredValue.isClassMethod) {
            wireConfig.push(makeKeyValueProperty(makeIdentifier('method'), makeNumericLiteral(1)));
        }

        wireConfig.push(getGeneratedConfig(wiredValue));

        return makeKeyValueProperty(
            makeIdentifier(wiredValue.propertyName),
            makeObjectExpression(wireConfig)
        );
    });

    return makeObjectExpression(entries);
}

// --- Validation ---

export function validateWire(decorators: DecoratorMeta[], state: VisitorState): void {
    for (const decorator of decorators.filter(isWireDecorator)) {
        validateUsageWithOtherDecorators(decorator, decorators, state);
        validateWireDecoratorParams(decorator, state);
    }
}

function validateUsageWithOtherDecorators(
    decorator: DecoratorMeta,
    allDecorators: DecoratorMeta[],
    state: VisitorState
) {
    for (const other of allDecorators) {
        if (
            other.decorator !== decorator.decorator &&
            other.name === WIRE_DECORATOR &&
            other.member === decorator.member
        ) {
            handleError(
                decorator.decorator,
                { errorInfo: DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED },
                state
            );
        }
        if (
            (other.name === API_DECORATOR || other.name === TRACK_DECORATOR) &&
            other.member === decorator.member
        ) {
            handleError(
                decorator.decorator,
                {
                    errorInfo: DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR,
                    messageArgs: [other.name],
                },
                state
            );
        }
    }
}

function validateWireDecoratorParams(decorator: DecoratorMeta, state: VisitorState): void {
    // The decorator expression is a CallExpression like @wire(Adapter, config?)
    const decoratorExpr = decorator.decorator.expression;
    if (decoratorExpr.type !== 'CallExpression') {
        handleError(
            decorator.decorator,
            { errorInfo: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER },
            state
        );
        return;
    }
    const args = (decoratorExpr as CallExpression).arguments;
    if (!args || args.length === 0) {
        handleError(
            decorator.decorator,
            { errorInfo: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER },
            state
        );
        return;
    }
    const idArg = args[0].expression;
    validateWireId(idArg, decorator, state);
    if (args[1]) {
        validateWireConfig(args[1].expression, decorator, state);
    }
}

function validateWireId(id: Expression, decorator: DecoratorMeta, state: VisitorState): void {
    if (!id) {
        handleError(
            decorator.decorator,
            { errorInfo: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER },
            state
        );
        return;
    }

    if (id.type === 'Identifier') {
        // @wire(adapter) — check that adapter is imported
        const adapterName = (id as Identifier).value;
        const binding = state.bindingMap?.get(adapterName);
        if (!binding) {
            handleError(
                decorator.decorator,
                {
                    errorInfo: DecoratorErrors.WIRE_ADAPTER_SHOULD_BE_IMPORTED,
                    messageArgs: [adapterName],
                },
                state
            );
            return;
        }
        if (binding.kind !== 'module') {
            handleError(
                decorator.decorator,
                {
                    errorInfo:
                        DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
                },
                state
            );
        }
    } else if (id.type === 'MemberExpression') {
        const memberExpr = id as MemberExpression;
        if (memberExpr.property.type === 'Computed') {
            handleError(
                decorator.decorator,
                { errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS },
                state
            );
            return;
        }
        // Check object is simple identifier (not nested member)
        if (memberExpr.object.type !== 'Identifier') {
            handleError(
                decorator.decorator,
                {
                    errorInfo:
                        DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS,
                },
                state
            );
            return;
        }
        const adapterName = (memberExpr.object as Identifier).value;
        const binding = state.bindingMap?.get(adapterName);
        if (!binding) {
            handleError(
                decorator.decorator,
                {
                    errorInfo: DecoratorErrors.WIRE_ADAPTER_SHOULD_BE_IMPORTED,
                    messageArgs: [adapterName],
                },
                state
            );
            return;
        }
        if (binding.kind !== 'module') {
            handleError(
                decorator.decorator,
                {
                    errorInfo:
                        DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
                },
                state
            );
        }
    } else {
        handleError(
            decorator.decorator,
            { errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER },
            state
        );
    }
}

function validateWireConfig(
    config: Expression,
    decorator: DecoratorMeta,
    state: VisitorState
): void {
    if (config.type !== 'ObjectExpression') {
        handleError(
            decorator.decorator,
            { errorInfo: DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER },
            state
        );
        return;
    }

    const objExpr = config as ObjectExpression;
    for (const prop of objExpr.properties) {
        if (prop.type !== 'KeyValueProperty') continue;
        const kvp = prop as KeyValueProperty;
        if (kvp.key.type !== 'Computed') continue;

        // Computed key - must be const-bound identifier, primitive literal, or 'undefined'
        const keyExpr = (kvp.key as any).expression as Expression;
        if (keyExpr.type === 'Identifier') {
            const name = (keyExpr as Identifier).value;
            if (name === 'undefined') continue;
            const binding = state.bindingMap?.get(name);
            if (binding?.kind === 'const') continue;
        } else if (
            keyExpr.type === 'StringLiteral' ||
            keyExpr.type === 'NumericLiteral' ||
            keyExpr.type === 'BooleanLiteral'
        ) {
            continue;
        } else if (keyExpr.type === 'TemplateLiteral') {
            handleError(
                decorator.decorator,
                { errorInfo: DecoratorErrors.COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL },
                state
            );
            continue;
        }

        handleError(
            decorator.decorator,
            { errorInfo: DecoratorErrors.COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL },
            state
        );
    }
}

// --- Transform ---

export function transformWire(
    decoratorMetas: DecoratorMeta[],
    state: VisitorState & { bindingMap: Map<string, BindingInfo> }
): KeyValueProperty[] {
    const objectProperties: KeyValueProperty[] = [];
    const wireDecorators = decoratorMetas.filter(isWireDecorator);

    const wiredValues: WiredValue[] = wireDecorators.map((meta) => {
        const decoratorExpr = meta.decorator.expression;
        if (decoratorExpr.type !== 'CallExpression') {
            return {
                propertyName: meta.propertyName,
                isClassMethod:
                    meta.member.type === 'ClassMethod' && (meta.member as any).kind === 'method',
            };
        }
        const callExpr = decoratorExpr as CallExpression;
        const args = callExpr.arguments;

        const isClassMethod =
            meta.member.type === 'ClassMethod' && (meta.member as any).kind === 'method';

        const wiredValue: WiredValue = {
            propertyName: meta.propertyName,
            isClassMethod,
        };

        // Extract adapter (first arg)
        if (args && args.length > 0) {
            const idExpr = args[0].expression;
            let adapterName: string | undefined;
            let adapterExpr: Expression = idExpr;

            if (idExpr.type === 'Identifier') {
                adapterName = (idExpr as Identifier).value;
            } else if (idExpr.type === 'MemberExpression') {
                const memberExpr = idExpr as MemberExpression;
                if (memberExpr.object.type === 'Identifier') {
                    adapterName = (memberExpr.object as Identifier).value;
                }
            }

            if (adapterName !== undefined) {
                const binding = state.bindingMap.get(adapterName);
                wiredValue.adapter = {
                    name: adapterName,
                    expression: adapterExpr,
                    reference: binding?.kind === 'module' ? binding.source : undefined,
                };
            }
        }

        // Extract config (second arg)
        if (args && args.length > 1 && args[1].expression.type === 'ObjectExpression') {
            const configObj = args[1].expression as ObjectExpression;
            const staticProps: any[] = [];
            const paramEntries: WireParamEntry[] = [];

            for (const prop of configObj.properties) {
                // Check if this is a KeyValueProperty with a $-prefixed string value (param entry)
                if (prop.type === 'KeyValueProperty') {
                    const kvp = prop as KeyValueProperty;
                    const value = kvp.value;

                    if (
                        value.type === 'StringLiteral' &&
                        (value as StringLiteral).value.startsWith(WIRE_PARAM_PREFIX)
                    ) {
                        // This is a param entry — extract key for dynamic array + config function generation
                        let keyId: Identifier | StringLiteral;
                        let computed = false;
                        if (kvp.key.type === 'NumericLiteral') {
                            // Numeric literal key like { 1.2_3e2: "$prop" } — use string representation as key
                            keyId = makeStringLiteral(String((kvp.key as NumericLiteral).value));
                        } else if (kvp.key.type === 'Identifier') {
                            keyId = kvp.key as Identifier;
                        } else if (kvp.key.type === 'StringLiteral') {
                            keyId = kvp.key as StringLiteral;
                        } else if (kvp.key.type === 'Computed') {
                            computed = true;
                            const innerExpr = (kvp.key as any).expression as Expression;
                            if (innerExpr.type === 'Identifier') {
                                keyId = innerExpr as Identifier;
                            } else if (innerExpr.type === 'StringLiteral') {
                                keyId = innerExpr as StringLiteral;
                            } else {
                                // skip invalid computed param keys
                                staticProps.push(prop);
                                continue;
                            }
                        } else {
                            // Other key type for param entry — treat as static
                            staticProps.push(prop);
                            continue;
                        }
                        paramEntries.push({ key: keyId, value: value as StringLiteral, computed });
                        continue;
                    }
                }

                // All other properties (shorthand identifiers, numeric keys, method properties,
                // regular key-value pairs with non-param values) are passed through as raw AST nodes.
                // This matches Babel's behavior of not transforming these entries.
                staticProps.push(prop);
            }

            wiredValue.staticProps = staticProps;
            wiredValue.paramEntries = paramEntries;
        }

        return wiredValue;
    });

    if (wiredValues.length > 0) {
        objectProperties.push(
            makeKeyValueProperty(
                makeIdentifier(LWC_COMPONENT_PROPERTIES.WIRE),
                buildWireConfigValue(wiredValues)
            )
        );
    }

    return objectProperties;
}
