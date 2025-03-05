interface StyleTagInfo {
    originalStyleTag: string;
    styleTagWithoutId: string;
    idAttrStr: string;
    styleId: string;
    styleTagIdx: number;
    indentation: number | null;
}

export function swapLwcStyleForStyleTag(src: string): string {
    let modifiedSrc = src;
    const styleCapture = /(\s*)(<style [^>]*(id="([^"]+)" ?)[^>]*>.*?<\/style>)/s;
    const capturedStyleTags: StyleTagInfo[] = [];
    let styleTagMatch: RegExpExecArray | null = null;

    // Find all <style> tags, remove id attrs, capture information for later replacement of <lwc-style> tags
    while ((styleTagMatch = styleCapture.exec(modifiedSrc))) {
        const [tagWithLeadingWhitespace, leadingWhiteSpace, originalStyleTag, idAttrStr, styleId] =
            styleTagMatch;
        const styleTagWithoutId = originalStyleTag.replace(idAttrStr, '');
        const styleTagIdx = styleTagMatch.index;
        // We remove the value of `styleTagWithoutId` here because it'll be added back in when the first
        // corresponding <lwc-style> tag is replaced with <style> in the second section below.
        modifiedSrc =
            modifiedSrc.slice(0, styleTagIdx) +
            modifiedSrc.slice(styleTagIdx + tagWithLeadingWhitespace.length);
        capturedStyleTags.push({
            originalStyleTag,
            styleTagWithoutId,
            idAttrStr,
            styleId,
            styleTagIdx,
            indentation: leadingWhiteSpace.length ? leadingWhiteSpace.length : null,
        });
    }

    const lwcStyleCapture = /(\s*)<lwc-style style-id="([^"]+)">[^<]*<\/lwc-style>/s;
    const idToStyleTag = Object.fromEntries(
        capturedStyleTags.map((styleTagInfo) => [styleTagInfo.styleId, styleTagInfo])
    );
    let lwcStyleTagMatch: RegExpExecArray | null = null;

    // Find all <lwc-style> tags and replace them with corresponding <style> tags captured earlier.
    while ((lwcStyleTagMatch = lwcStyleCapture.exec(modifiedSrc))) {
        const [tagWithLeadingWhitespace, leadingWhiteSpace, styleId] = lwcStyleTagMatch;
        const lwcStyleTagIdx = lwcStyleTagMatch.index;
        const correspondingStyleTagInfo = idToStyleTag[styleId];
        if (!correspondingStyleTagInfo) {
            throw new Error(
                'swapLwcStyleForStyleTag was unable to find <style> tag corresponding to <lwc-style>'
            );
        }
        let styleTagWithoutId = correspondingStyleTagInfo.styleTagWithoutId;
        const indentationDelta = correspondingStyleTagInfo.indentation
            ? leadingWhiteSpace.length - correspondingStyleTagInfo.indentation
            : null;
        if (indentationDelta) {
            styleTagWithoutId = styleTagWithoutId
                .split('\n')
                .map((line, idx) => {
                    if (
                        // Don't add indentation for lines that are empty.
                        !line ||
                        // The first line will already be indented.
                        idx === 0
                    ) {
                        return line;
                    }
                    // The original <style> is more indented than the <lwc-style>
                    if (indentationDelta > 0) {
                        return line.padStart(line.length + indentationDelta);
                    }
                    // The original <style> is less indented than the <lwc-style>
                    return line.slice(indentationDelta * -1);
                })
                .join('\n');
            console.log(styleTagWithoutId);
        }

        modifiedSrc =
            modifiedSrc.slice(0, lwcStyleTagIdx + leadingWhiteSpace.length) +
            styleTagWithoutId +
            modifiedSrc.slice(lwcStyleTagIdx + tagWithLeadingWhitespace.length);
    }

    return modifiedSrc;
}
