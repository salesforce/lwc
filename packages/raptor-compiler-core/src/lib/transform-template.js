import compile from 'raptor-template-compiler';

export default function (src: string): any {
    const { code, metadata, warnings } = compile(src);

    const fatalError = warnings.find((warning: any) => warning.level === 'error');
    if (fatalError) {
        throw new Error(fatalError.message);
    }

    // #FIXME: Returns for now only a subset of the transform result because the ast property in
    // the result makes rollup throw.
    // Returning the AST instead of the generated code would greately improve the compilation time.
    return { code, metadata };
}
