/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';
import type {
    ModuleDeclaration as EsModuleDeclaration,
    Statement as EsStatement,
    ImportSpecifier as EsImportSpecifier,
    ImportDefaultSpecifier as EsImportDefaultSpecifier,
    ImportNamespaceSpecifier as EsImportNamespaceSpecifier,
} from 'estree';
import type { TemplateOpts, TransformerContext } from './types';

const identifierChars = 'abcdefghijklmnopqrstuvwxyz';

function genId(n: number, prevChars = ''): string {
    const remaining = Math.floor(n / identifierChars.length);
    const result = identifierChars.charAt(n % identifierChars.length) + prevChars;

    return remaining <= 0 ? result : genId(remaining - 1, result);
}

function* genIds() {
    let counter = 0;
    while (true) {
        yield genId(counter++);
    }
}

export function createNewContext(templateOptions: TemplateOpts): {
    hoisted: Map<string, EsStatement | EsModuleDeclaration>;
    cxt: TransformerContext;
} {
    const hoisted = new Map<string, EsStatement | EsModuleDeclaration>();
    const hoist = (stmt: EsStatement | EsModuleDeclaration, dedupeKey: string) =>
        hoisted.set(dedupeKey, stmt);

    /**
     * Hoist an import declaration to the top of the file. If source is not specified, defaults to
     * `@lwc/ssr-runtime`.
     */
    const _import = (
        imports: string | string[] | Record<string, string>,
        source = '@lwc/ssr-runtime'
    ): void => {
        let specifiers: Array<[string, string | undefined]>;
        if (typeof imports === 'string') {
            specifiers = [[imports, undefined]];
        } else if (Array.isArray(imports)) {
            specifiers = imports.map((imp) => [imp, undefined]);
        } else {
            specifiers = Object.entries(imports);
        }
        // Do one import per specifier to optimize deduping; the bundler should merge them later
        for (const [imported, local] of specifiers) {
            let spec: EsImportSpecifier | EsImportDefaultSpecifier | EsImportNamespaceSpecifier;
            let key: string;
            if (imported === 'default') {
                spec = b.importDefaultSpecifier(b.identifier(local!));
                key = `import ${imported} from "${source}"`;
            } else if (imported === '*') {
                spec = b.importNamespaceSpecifier(b.identifier(local!));
                key = `import * as ${imported} from "${source}"`;
            } else if (local) {
                spec = b.importSpecifier(b.identifier(imported), b.identifier(local));
                key = `import { ${imported} as ${local} } from "${source}"`;
            } else {
                spec = b.importSpecifier(b.identifier(imported));
                key = `import { ${imported} } from "${source}"`;
            }
            const decl = b.importDeclaration([spec], b.literal(source));
            hoist(decl, key);
        }
    };

    const localVarStack: Set<string>[] = [];

    const pushLocalVars = (vars: string[]) => {
        localVarStack.push(new Set(vars));
    };
    const popLocalVars = () => {
        localVarStack.pop();
    };
    const isLocalVar = (varName: string | null | undefined) => {
        if (!varName) {
            return false;
        }
        for (const stackFrame of localVarStack) {
            if (stackFrame.has(varName)) {
                return true;
            }
        }
        return false;
    };

    const uniqueVarGenerator = genIds();
    const getUniqueVar = () => uniqueVarGenerator.next().value!;

    return {
        hoisted,
        cxt: {
            hoist,
            pushLocalVars,
            popLocalVars,
            isLocalVar,
            getUniqueVar,
            templateOptions,
            import: _import,
        },
    };
}
