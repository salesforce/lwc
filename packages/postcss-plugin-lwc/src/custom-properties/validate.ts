import { Declaration } from 'postcss';
import { generateErrorFromDeclaration } from '../helpers/errors';
import { CSSTransformErrors } from 'lwc-errors';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(decl: Declaration): void {
    const { prop } = decl;

    if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
        throw generateErrorFromDeclaration(decl, {
            errorInfo: CSSTransformErrors.CUSTOM_PROPERTY_INVALID_DEFINITION,
            messageArgs: [prop]
        });
    }
}
