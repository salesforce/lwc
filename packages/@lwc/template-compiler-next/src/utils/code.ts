function getBaseIndentation(str: string): RegExp {
    const identMatch = /\n( +)/.exec(str);

    if (!identMatch) {
        return new RegExp('', 'gm');
    }

    return new RegExp(`^${identMatch[1]}`, 'gm');
}

function getChunkEndIndentation(str: string): string {
    let newLineStart = str.length;
    while (newLineStart > 0 && str[newLineStart - 1] !== '\n') {
        newLineStart--;
    }

    let indentEnd = newLineStart;
    while (indentEnd < str.length && str[indentEnd] === ' ') {
        indentEnd++;
    }

    return str.slice(newLineStart, indentEnd);
}

export function code(chunks: TemplateStringsArray, ...values: (string | string[])[]): string {
    const baseIndentation = getBaseIndentation(chunks[0]);

    let result = chunks[0].replace(baseIndentation, '');
    let currentIndentation = getChunkEndIndentation(result);

    for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i].replace(baseIndentation, '');

        const value = values[i - 1];
        let formattedValue = Array.isArray(value) ? value.join('\n') : value;
        formattedValue = formattedValue.replace(/\n/g, `\n${currentIndentation}`);

        result += formattedValue + chunk;

        currentIndentation = getChunkEndIndentation(chunk);
    }

    return result.trim();
}
