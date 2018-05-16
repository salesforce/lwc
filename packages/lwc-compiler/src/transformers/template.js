import * as path from 'path';
import compile from 'lwc-template-compiler';

function attachStyleToTemplate(src, { moduleName, moduleNamespace, filename }) {
    const templateFilename = path.basename(filename, path.extname(filename));

    // Use the component tagname and a unique style token to scope the compiled
    // styles to the component.
    const tagName = `${moduleNamespace}-${moduleName}`;
    const scopingToken = `${tagName}_${templateFilename}`;

    return [
        `import stylesheet from './${templateFilename}.css'`,
        '',
        src,
        '',

        // The compiler resolves the style import to undefined if the stylesheet
        // doesn't exists.
        `if (stylesheet) {`,

        // The engine picks the style token from the template during rendering to
        // add the token to all generated elements.
        `    tmpl.token = '${scopingToken}';`,
        ``,

        // Inject the component style in a new style tag the document head.
        `    const style = document.createElement('style');`,
        `    style.type = 'text/css';`,
        `    style.dataset.token = '${scopingToken}'`,
        `    style.textContent = stylesheet('${tagName}', '${scopingToken}');`,
        `    document.head.appendChild(style)`,
        `}`,
    ].join('\n');
}

export default function(src, options) {
    // Transform HTML template to javascript
    const { code, metadata, warnings } = compile(src, {});

    // Throw if a fatal error ocurred during the compilation
    const error = warnings.find(warning => warning.level === 'error');
    if (error) {
        throw new Error(error.message);
    }

    return {
        code: attachStyleToTemplate(code, options),
        metadata,
    };
}
