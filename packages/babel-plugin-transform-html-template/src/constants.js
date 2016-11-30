export const PROPS = 'props';
export const DIRECTIVE_SYMBOL = ':';

export const DIRECTIVE_PRIMITIVES = {
    if        : "if",
    else      : "else",
    ifnot     : "ifnot",
    repeat    : "repeat",
    on        : "on",
    directive : "directive"
};

export const RENDER_PRIMITIVES = {
    ITERATOR       : 'i',
    FOR_LOOP       : 'f',
    EMPTY          : 'e',
    CREATE_ELEMENT : 'h',
    STRING         : 's',
};

export const TOP_LEVEL_PROPS = [
    'class',
    'staticClass',
    'style',
    'key',
    'ref',
    'slot'
];