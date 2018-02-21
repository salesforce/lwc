import * as path from 'path';
import compile from 'lwc-template-compiler';

export function getTemplateToken(filename, options) {
    const templateId = path.basename(filename, path.extname(filename));
    return `${options.namespace}-${options.name}_${templateId}`;
}

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */
export default function(src, options) {
    const { name, namespace, outputConfig } = options;
    const { code: template, metadata, warnings } = compile(src, {});

    const fatalError = warnings.find(warning => warning.level === 'error');
    if (fatalError) {
        throw new Error(fatalError.message);
    }


    const token = getTemplateToken(name, options);
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
