/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { isApiDecorator } from './decorators/api';
import type { ClassDeclaration, ClassExpression } from 'estree';

type ClassNode = ClassDeclaration | ClassExpression;

const REGISTER_PUBLIC_PROPERTIES = '__registerPublicProperties';

/**
 * Injects `static { __registerPublicProperties(this, [...apiProps]) }` into every in-file class
 * that has an `@api` member and is not the default export.
 *
 * The compiler emits `setStaticInternals` (which records the `@api` allowlist) only for the
 * exported component, so `@api` props on a non-exported in-file base class are dropped from the
 * leaf's allowlist (W-23508928). Rather than resolve the chain statically — impossible for
 * dynamically-chosen superclasses (`extends (flag ? A : B)`, `mixin(Base)`, `factory()`) — we let
 * the runtime union do it. `this` inside a static block needs no class name, so this also covers
 * nested/anonymous class expressions.
 *
 * Operates on class nodes gathered by the main traversal, so it adds no extra tree walk. `@api`
 * decorators survive on member nodes until `astring` drops them at `generate()`, so they are still
 * readable here (after the main traversal). Returns true if any registration was injected (so the
 * caller can add the runtime import).
 */
export function registerBaseClassProps(
    classNodes: Iterable<ClassNode>,
    exportedComponent: ClassNode | null
): boolean {
    let injected = false;
    for (const node of classNodes) {
        // The exported leaf is handled by the regular `setStaticInternals` emission.
        if (node === exportedComponent) continue;
        const apiProps = ownApiProps(node);
        if (apiProps.size === 0) continue;
        node.body.body.push(
            b.staticBlock([
                b.expressionStatement(
                    b.callExpression(b.identifier(REGISTER_PUBLIC_PROPERTIES), [
                        b.thisExpression(),
                        b.arrayExpression([...apiProps].map((name) => b.literal(name))),
                    ])
                ),
            ])
        );
        injected = true;
    }
    return injected;
}

export { REGISTER_PUBLIC_PROPERTIES };

/** Collect the class's own `@api` property/method names, in source order. */
function ownApiProps(node: ClassNode): Set<string> {
    const props = new Set<string>();
    for (const member of node.body.body) {
        if (
            (member.type === 'PropertyDefinition' || member.type === 'MethodDefinition') &&
            is.identifier(member.key) &&
            member.decorators?.some(isApiDecorator)
        ) {
            props.add(member.key.name);
        }
    }
    return props;
}
