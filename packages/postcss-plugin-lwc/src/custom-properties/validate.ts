import { Declaration } from 'postcss';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(decl: Declaration): void {
    const { prop } = decl;

    if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
        throw decl.error(
            `Invalid definition of custom property "${prop}".`,
        );
    }
}
