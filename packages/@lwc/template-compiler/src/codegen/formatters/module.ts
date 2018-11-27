import * as t from '@babel/types';

import State from '../../state';
import {
    identifierFromComponentName,
    generateTemplateMetadata,
    kebabcaseToCamelcase
} from '../helpers';
import { ResolvedConfig } from '../../config';

import {
    TEMPLATE_FUNCTION_NAME,
    SECURE_REGISTER_TEMPLATE_METHOD_NAME,
    LWC_MODULE_NAME
} from '../../shared/constants';

function moduleNameToImport(name: string): t.ImportDeclaration {
    const localIdentifier = identifierFromComponentName(name);

    return t.importDeclaration(
        [t.importDefaultSpecifier(localIdentifier)],
        t.stringLiteral(kebabcaseToCamelcase(name)),
    );
}

function generateSecureImport(): t.ImportDeclaration {
    return t.importDeclaration(
        [t.importSpecifier(t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME), t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME))],
        t.stringLiteral(LWC_MODULE_NAME)
    );
}

function generateInlineStylesImports(state: State) {
    return state.inlineStyle.imports;
}

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
    options: ResolvedConfig
): t.Program {
    const imports = state.dependencies.map(cmpClassName =>
        moduleNameToImport(cmpClassName),
    );

    const metadata = generateTemplateMetadata(state);

    imports.push(generateSecureImport());
    imports.push(...generateInlineStylesImports(state));

    const templateBody = [
        templateFn,
        t.exportDefaultDeclaration(
            t.callExpression(
                t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME),
                [t.identifier(TEMPLATE_FUNCTION_NAME)]
            )
        )
    ];

    return t.program([
        ...imports,
        ...templateBody,
        ...metadata,
    ]);
}
