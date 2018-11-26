import { Root } from 'postcss';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(root: Root): void {
    root.walkDecls(decl => {
        const { prop } = decl;

        if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
            throw decl.error(
                `Invalid definition of custom property "${prop}".`,
            );
        }
    });
}
