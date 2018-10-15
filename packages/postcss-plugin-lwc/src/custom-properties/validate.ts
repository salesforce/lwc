import { Declaration } from 'postcss';
import { generateCompilerError, PostCSSErrors } from 'lwc-errors';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(decl: Declaration): void {
    const { prop } = decl;

    if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
        throw generateCompilerError(PostCSSErrors.CUSTOM_PROPERTY_INVALID_DEFINITION, {
            messageArgs: [prop],
            errorConstructor: decl.error.bind(decl)
        });
    }
}
