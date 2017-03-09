export function concatClassnames(a = '', b = '') {
    return [a, b].filter(value => value !== '').join(' ');
}
