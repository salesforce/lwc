export function importsToString(imports) {
    return imports
        .map((i) =>
            i
                .toString()
                .split('(')[0]
                .replace('async function serverSideRenderComponent', 'function renderComponent')
        )
        .join('\n      ');
}
