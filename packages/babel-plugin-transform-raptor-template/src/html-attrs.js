import { makeMap, toCamelCase } from './utils';

const ATTRS_TAG_MAP={"xlink:href":["use"],role:[],accept:["form","input"],"accept-charset":["form"],accesskey:[],action:["form"],align:["applet","caption","col","colgroup","hr","iframe","img","table","tbody","td","tfoot","th","thead","tr"],alt:["applet","area","img","input"],async:["script"],autocomplete:["form","input"],autofocus:["button","input","keygen","select","textarea"],autoplay:["audio","video"],autosave:["input"],bgcolor:["body","col","colgroup","marquee","table","tbody","tfoot","td","th","tr"],border:["img","object","table"],buffered:["audio","video"],challenge:["keygen"],charset:["meta","script"],checked:["command","input"],cite:["blockquote","del","ins","q"],"class":[],code:["applet"],codebase:["applet"],color:["basefont","font","hr"],cols:["textarea"],colspan:["td","th"],content:["meta"],contenteditable:[],contextmenu:[],controls:["audio","video"],coords:["area"],data:["object"],"data-*":[],datetime:["del","ins","time"],"default":["track"],defer:["script"],dir:[],dirname:["input","textarea"],disabled:["button","command","fieldset","input","keygen","optgroup","option","select","textarea"],download:["a","area"],draggable:[],dropzone:[],enctype:["form"],"for":["label","output"],form:["button","fieldset","input","keygen","label","meter","object","output","progress","select","textarea"],formaction:["input","button"],headers:["td","th"],height:["canvas","embed","iframe","img","input","object","video"],hidden:[],high:["meter"],href:["a","area","base","link"],hreflang:["a","area","link"],"http-equiv":["meta"],icon:["command"],id:[],integrity:["link","script"],ismap:["img"],itemprop:[],keytype:["keygen"],kind:["track"],label:["track"],lang:[],language:["script"],list:["input"],loop:["audio","bgsound","marquee","video"],low:["meter"],manifest:["html"],max:["input","meter","progress"],maxlength:["input","textarea"],media:["a","area","link","source","style"],method:["form"],min:["input","meter"],multiple:["input","select"],muted:["video"],name:["slot","button","form","fieldset","iframe","input","keygen","object","output","select","textarea","map","meta","param"],novalidate:["form"],open:["details"],optimum:["meter"],pattern:["input"],ping:["a","area"],placeholder:["input","textarea"],poster:["video"],preload:["audio","video"],radiogroup:["command"],readonly:["input","textarea"],rel:["a","area","link"],required:["input","select","textarea"],reversed:["ol"],rows:["textarea"],rowspan:["td","th"],sandbox:["iframe"],scope:["th"],scoped:["style"],seamless:["iframe"],selected:["option"],shape:["a","area"],size:["input","select"],sizes:["link","img","source"],slot:[],span:["col","colgroup"],spellcheck:[],src:["audio","embed","iframe","img","input","script","source","track","video"],srcdoc:["iframe"],srclang:["track"],srcset:["img"],start:["ol"],step:["input"],style:[],summary:["table"],tabindex:[],target:["a","area","base","form"],title:[],type:["button","input","command","embed","object","script","source","style","menu"],usemap:["img","input","object"],value:["button","option","input","li","meter","progress","param"],width:["canvas","embed","iframe","img","input","object","video"],wrap:["textarea"]};

export const ATTRS_PROPS_TRANFORMS = {
    accesskey: 'accessKey',
    readonly: 'readOnly',
    tabindex: 'tabIndex',
    bgcolor: 'bgColor',
    colspan: 'colSpan',
    rowspan: 'rowSpan',
    contentEditable: 'contentEditable',
    datetime: 'dateTime',
    formaction: 'formAction',
    ismap: 'isMap',
    maxlength: 'maxLength',
    usemap: 'useMap',
    'class': 'className',
    'for': 'htmlFor',
};

export const ATTRS_PROPS_CUSTOM_ELEMENT_TRANFORMS = {
    accesskey: 'accessKey',
    tabindex: 'tabIndex',
    'class': 'className',
};

const ATTR_TRANFORMS = {
    'class': 'className',
}

const ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
const ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
const isDataOrAria = RegExp.prototype.test.bind( new RegExp('^(data|aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$'));

export const isCommonAttr = makeMap(
    'role,accesskey,class,contenteditable,contextmenu,dir,draggable,dropzone,hidden,' +
    'id,itemprop,lang,slot,spellcheck,style,tabindex,title'
);

export const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,' +
  'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view'
);

export const isSvgNsAttribute = makeMap('xml,xlink');

export function isCustomElement(tagName) {
    return tagName.indexOf('-') > 0;
}

function isCustomAttribute(attrName) {
    return attrName === 'role' || attrName === 'is' || isDataOrAria(attrName);
}

function transformAttr(attr) {
    return ATTR_TRANFORMS[attr] || attr;
}

export function isValidHTMLAttribute(tagName: string, attrName: string, /*attrValue: string*/) {
    if (isCustomAttribute(attrName)) {
        return true;
    }
    const validElements = ATTRS_TAG_MAP[attrName];
    return !!validElements && (validElements.length ? validElements.indexOf(tagName) !== -1 : true) /* applies to all */;
}

export function isProp(tagName: string, attrName: string, hasIsAttr: boolean) {
    const validAttr = hasIsAttr && isValidHTMLAttribute(tagName, attrName);
    return (isCustomElement(tagName) || hasIsAttr) && !isCustomAttribute(attrName) && !isCommonAttr(attrName) && !validAttr;

}

export function getPropertyNameFromAttrName(attrName: string, tagName: string) {
    return  transformAttr((isSVG(tagName) || isCustomAttribute(attrName)) ? attrName : toCamelCase(attrName));
}
