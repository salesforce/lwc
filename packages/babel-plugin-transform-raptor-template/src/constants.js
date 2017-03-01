export const PROPS = 'props';
export const ATTRS  = 'attrs';

export const DATASET = 'dataset';
export const DATA_ATTRIBUTE_PREFIX = 'data-';

export const DIRECTIVE_SYMBOL = ':';
export const MODULE_SYMBOL = ':';
export const CMP_INSTANCE = '$cmp';
export const API_PARAM = '$api';
export const SLOT_SET = '$slotset';
export const TEMPLATE_TAG = 'template';
export const SLOT_TAG = 'slot';
export const DEFAULT_SLOT_NAME = '$default$';

export const DIRECTIVES = {
    repeat    : 'repeat',
    on        : 'on',
    is        : 'is',
    bind      : 'bind',
    branch    : 'set',
    eval      : 'set',
    assign    : 'set',
    set       : 'set',
    d         : 'set',
    directive : 'set',
    custom    : 'custom',
};

export const MODIFIERS = {
    if    : 'if',
    else  : 'else',
    for   : 'for',
    ifnot : 'ifnot',
};

export const RENDER_PRIMITIVES = {
    ITERATOR        : 'i',
    FLATTENING      : 'f',
    EMPTY           : 'e',
    CREATE_ELEMENT  : 'h',
    VIRTUAL_ELEMENT : 'v',
    CUSTOM_ELEMENT  : 'c',
    TEXT            : 's',
};

export const RENDER_PRIMITIVE_KEYS = Object.keys(RENDER_PRIMITIVES).map(k => RENDER_PRIMITIVES[k]);

export const TOP_LEVEL_PROPS = [
    'class',
    'style',
    'ref',
    'key',
];

export const EVENT_KEYS = {
    blur: 1,
    canplay: 1,
    canplaythrough: 1,
    change: 1,
    click: 1,
    complete: 1,
    contextmenu: 1,
    copy: 1,
    cut: 1,
    dblclick: 1,
    drag: 1,
    dragend: 1,
    dragenter: 1,
    dragleave: 1,
    dragover: 1,
    dragstart: 1,
    drop: 1,
    durationchange: 1,
    emptied: 1,
    ended: 1,
    error: 1,
    focus: 1,
    focusin: 1,
    focusout: 1,
    input: 1,
    keydown: 1,
    keypress: 1,
    keyup: 1,
    load: 1,
    loadeddata: 1,
    loadedmetadata: 1,
    loadstart: 1,
    mousedown: 1,
    mouseenter: 1,
    mouseleave: 1,
    mousemove: 1,
    mouseout: 1,
    mouseover: 1,
    mouseup: 1,
    paste: 1,
    pause: 1,
    play: 1,
    playing: 1,
    progress: 1,
    ratechange: 1,
    scroll: 1,
    seeked: 1,
    seeking: 1,
    stalled: 1,
    submit: 1,
    suspend: 1,
    timeupdate: 1,
    touchcancel: 1,
    touchend: 1,
    touchmove: 1,
    touchstart: 1,
    volumechange: 1,
    waiting: 1,
    wheel: 1
};
