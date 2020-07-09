const ESCAPED_CHARS: { [char: string]: string } = {
    '"': '&quot;',
    "'": '&#x27;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
};

export function htmlEscape(str: string): string {
    return str.replace(/["'<>&]/g, (char) => ESCAPED_CHARS[char]);
}
