/**
 * SSRv2 implements style deduplication, where an <lwc-style> tag is inserted alongside the first instance
 * of a given component's <style> tag. In subsequent renders of that component, only the <lwc-style> tag
 * is present in the generated markup.
 *
 * This presents a problem when sharing fixtures between SSRv1 and SSRv2. SSRv1 will expect to find repeated
 * <style> tags and won't expect to find <lwc-style> tags.
 *
 * The `swapLwcStyleForStyleTag` function takes the SSRv2 fixtures and modifies it to look how SSRv1 would
 * expect. As more divergences between the implementations crop up, we may need to add more fixture mutations
 * to accommodate the differences.
 */

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
    // ([leading whitespace])(<style (id="(text)")...>...</style>)
    const styleCapture = /(\s*)(<style [^>]*(id="([^"]+)" ?)[^>]*>.*?<\/style>)/s;
    const capturedStyleTags: StyleTagInfo[] = [];
    let styleTagMatch: RegExpExecArray | null = null;

    // Find all <style> tags with an id, remove id attrs, capture information for later
    // replacement of <lwc-style> tags. The length of the `modifiedSrc` string will be
    // changing as <style> tags are modified, so we need to exec each time.
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
    // The length of the `modifiedSrc` string will be changing as <style> tags are modified, so we
    // need to exec each time.
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
