export const TEMPLATE_FUNCTION_NAME: string = 'tmpl';

export const TEMPLATE_PARAMS: { [label: string]: string } = {
    INSTANCE    : '$cmp',
    API         : '$api',
    SLOT_SET    : '$slotset',
    CONTEXT     : '$ctx',
};

export const RENDER_PRIMITIVES: { [label: string]: string } = {
    ITERATOR        : 'i',
    FLATTENING      : 'f',
    ELEMENT         : 'h',
    CUSTOM_ELEMENT  : 'c',
    BIND            : 'b',
    TEXT            : 't',
    DYNAMIC         : 'd',
};

export const DEFAULT_SLOT_NAME = '$default$';
