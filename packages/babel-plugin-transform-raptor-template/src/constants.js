export const PROPS = 'props';
export const ATTRS  = 'attrs';

export const DATASET = 'dataset';
export const DATA_ATTRIBUTE_PREFIX = 'data-';
export const TMPL_FUNCTION_NAME = 'tmpl';

export const DIRECTIVE_SYMBOL = ':';
export const MODULE_SYMBOL = ':';
export const CMP_INSTANCE = '$cmp';
export const API_PARAM = '$api';
export const SLOT_SET = '$slotset';
export const CONTEXT = '$ctx';
export const TEMPLATE_TAG = 'template';
export const SLOT_TAG = 'slot';
export const DEFAULT_SLOT_NAME = '$default$';

export const DIRECTIVES = {
    repeat    : 'repeat',
    for       : 'for',
    if        : 'if',
    on        : 'on',
    is        : 'is',
    bind      : 'bind',
    set       : 'set',
    eval      : 'eval',
};

export const IF_MODIFIERS = {
    'true'     : 'isTrue',
    'is-true'  : 'isTrue',
    'false'    : 'isFalse',
    'is-false' : 'isFalse',
    'is-not'   : 'isFalse',
};

export const EVAL_MODIFIERS = {
    if   : 'if',
    else : 'else',
};

export const MODIFIERS = {
    repeat : { 'for': 'for' },
    for    : { each: 'each' },
    on     : '*',
    is     : '*',
    bind   : '*',
    set    : '*',
    if     : IF_MODIFIERS,
    eval   : EVAL_MODIFIERS,
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

export const VALID_HTML_ATTRIBUTES = {
  "xlink:href": [
    "use"
  ],
  role: [

  ],
  accept: [
    "form",
    "input"
  ],
  "accept-charset": [
    "form"
  ],
  accesskey: [

  ],
  action: [
    "form"
  ],
  align: [
    "applet",
    "caption",
    "col",
    "colgroup",
    "hr",
    "iframe",
    "img",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr"
  ],
  alt: [
    "applet",
    "area",
    "img",
    "input"
  ],
  async: [
    "script"
  ],
  autocomplete: [
    "form",
    "input"
  ],
  autofocus: [
    "button",
    "input",
    "keygen",
    "select",
    "textarea"
  ],
  autoplay: [
    "audio",
    "video"
  ],
  autosave: [
    "input"
  ],
  bgcolor: [
    "body",
    "col",
    "colgroup",
    "marquee",
    "table",
    "tbody",
    "tfoot",
    "td",
    "th",
    "tr"
  ],
  border: [
    "img",
    "object",
    "table"
  ],
  buffered: [
    "audio",
    "video"
  ],
  challenge: [
    "keygen"
  ],
  charset: [
    "meta",
    "script"
  ],
  checked: [
    "command",
    "input"
  ],
  cite: [
    "blockquote",
    "del",
    "ins",
    "q"
  ],
  "class": [

  ],
  code: [
    "applet"
  ],
  codebase: [
    "applet"
  ],
  color: [
    "basefont",
    "font",
    "hr"
  ],
  cols: [
    "textarea"
  ],
  colspan: [
    "td",
    "th"
  ],
  content: [
    "meta"
  ],
  contenteditable: [

  ],
  contextmenu: [

  ],
  controls: [
    "audio",
    "video"
  ],
  coords: [
    "area"
  ],
  data: [
    "object"
  ],
  "data-*": [

  ],
  datetime: [
    "del",
    "ins",
    "time"
  ],
  "default": [
    "track"
  ],
  defer: [
    "script"
  ],
  dir: [

  ],
  dirname: [
    "input",
    "textarea"
  ],
  disabled: [
    "button",
    "command",
    "fieldset",
    "input",
    "keygen",
    "optgroup",
    "option",
    "select",
    "textarea"
  ],
  download: [
    "a",
    "area"
  ],
  draggable: [

  ],
  dropzone: [

  ],
  enctype: [
    "form"
  ],
  "for": [
    "label",
    "output"
  ],
  form: [
    "button",
    "fieldset",
    "input",
    "keygen",
    "label",
    "meter",
    "object",
    "output",
    "progress",
    "select",
    "textarea"
  ],
  formaction: [
    "input",
    "button"
  ],
  headers: [
    "td",
    "th"
  ],
  height: [
    "canvas",
    "embed",
    "iframe",
    "img",
    "input",
    "object",
    "video"
  ],
  hidden: [

  ],
  high: [
    "meter"
  ],
  href: [
    "a",
    "area",
    "base",
    "link"
  ],
  hreflang: [
    "a",
    "area",
    "link"
  ],
  "http-equiv": [
    "meta"
  ],
  icon: [
    "command"
  ],
  id: [

  ],
  integrity: [
    "link",
    "script"
  ],
  ismap: [
    "img"
  ],
  itemprop: [

  ],
  keytype: [
    "keygen"
  ],
  kind: [
    "track"
  ],
  label: [
    "track"
  ],
  lang: [

  ],
  language: [
    "script"
  ],
  list: [
    "input"
  ],
  loop: [
    "audio",
    "bgsound",
    "marquee",
    "video"
  ],
  low: [
    "meter"
  ],
  manifest: [
    "html"
  ],
  max: [
    "input",
    "meter",
    "progress"
  ],
  minlength: [
    "textarea",
    "input",
  ],
  maxlength: [
    "input",
    "textarea"
  ],
  media: [
    "a",
    "area",
    "link",
    "source",
    "style"
  ],
  method: [
    "form"
  ],
  min: [
    "input",
    "meter"
  ],
  multiple: [
    "input",
    "select"
  ],
  muted: [
    "video"
  ],
  name: [
    "slot",
    "button",
    "form",
    "fieldset",
    "iframe",
    "input",
    "keygen",
    "object",
    "output",
    "select",
    "textarea",
    "map",
    "meta",
    "param"
  ],
  novalidate: [
    "form"
  ],
  open: [
    "details"
  ],
  optimum: [
    "meter"
  ],
  pattern: [
    "input"
  ],
  ping: [
    "a",
    "area"
  ],
  placeholder: [
    "input",
    "textarea"
  ],
  poster: [
    "video"
  ],
  preload: [
    "audio",
    "video"
  ],
  radiogroup: [
    "command"
  ],
  readonly: [
    "input",
    "textarea"
  ],
  rel: [
    "a",
    "area",
    "link"
  ],
  required: [
    "input",
    "select",
    "textarea"
  ],
  reversed: [
    "ol"
  ],
  rows: [
    "textarea"
  ],
  rowspan: [
    "td",
    "th"
  ],
  sandbox: [
    "iframe"
  ],
  scope: [
    "th"
  ],
  scoped: [
    "style"
  ],
  seamless: [
    "iframe"
  ],
  selected: [
    "option"
  ],
  shape: [
    "a",
    "area"
  ],
  size: [
    "input",
    "select"
  ],
  sizes: [
    "link",
    "img",
    "source"
  ],
  slot: [

  ],
  span: [
    "col",
    "colgroup"
  ],
  spellcheck: [

  ],
  src: [
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ],
  srcdoc: [
    "iframe"
  ],
  srclang: [
    "track"
  ],
  srcset: [
    "img"
  ],
  start: [
    "ol"
  ],
  step: [
    "input"
  ],
  style: [

  ],
  summary: [
    "table"
  ],
  tabindex: [

  ],
  target: [
    "a",
    "area",
    "base",
    "form"
  ],
  title: [

  ],
  type: [
    "button",
    "input",
    "command",
    "embed",
    "object",
    "script",
    "source",
    "style",
    "menu"
  ],
  usemap: [
    "img",
    "input",
    "object"
  ],
  value: [
    "button",
    "option",
    "input",
    "li",
    "meter",
    "progress",
    "param"
  ],
  width: [
    "canvas",
    "embed",
    "iframe",
    "img",
    "input",
    "object",
    "video"
  ],
  wrap: [
    "textarea"
  ]
}
