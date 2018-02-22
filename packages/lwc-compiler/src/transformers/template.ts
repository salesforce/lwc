import * as path from 'path';
import { CompilerOptions } from '../options';
import compile from 'lwc-template-compiler';

export function getTemplateToken(name: string, namespace: string) {
    const templateId = path.basename(name, path.extname(name));
    return `${namespace}-${name}_${templateId}`;
}

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */
export default function(src: string, options: CompilerOptions) {
    const { name, namespace } = options;
    const { code: template, metadata, warnings } = compile(src, {});

    const fatalError = warnings.find(warning => warning.level === 'error');
    if (fatalError) {
        throw new Error(fatalError.message);
    }


    const token = getTemplateToken(name, namespace);
    const cssName = path.basename(name, path.extname(name)) + '.css';

    const code = [
        `import style from './${cssName}'`,
        '',
        template,
        '',
        `if (style) {`,
        `   const tagName = '${namespace}-${name}';`,
        `   const token = '${token}';`,
        ``,
        `   tmpl.token = token;`,
        `   tmpl.style = style(tagName, token);`,
        `}`,
    ].join('\n');

    return { code, metadata };
}
