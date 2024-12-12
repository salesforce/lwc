export function importsToString(imports) {
    return imports
        .map((i) =>
            i
                .toString()
                .split('(')[0]
                // renderComponent is aliased here: https://github.com/salesforce/lwc/blob/5d01843a7733a03b9ccb59a70ad64af955f15b88/packages/%40lwc/ssr-runtime/src/index.ts#L31
                .replace('async function serverSideRenderComponent', 'function renderComponent')
        )
        .join('\n      ');
}
