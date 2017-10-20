import compile from 'raptor-template-compiler';

export default function(src) {
    const { code, metadata, warnings } = compile(src);

    const fatalError = warnings.find(warning => warning.level === 'error');
    if (fatalError) {
        throw new Error(fatalError.message);
    }

    return { code, metadata };
}
