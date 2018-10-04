import { Declaration } from 'postcss';
import { normalizeErrorMessage, PostCSSErrors } from 'lwc-errors';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(decl: Declaration): void {
    const { prop } = decl;

    if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
        throw decl.error(
            normalizeErrorMessage(PostCSSErrors.CUSTOM_PROPERTY_INVALID_DEFINITION, [prop])
        );
    }
}
