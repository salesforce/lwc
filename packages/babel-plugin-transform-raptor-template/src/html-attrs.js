import { makeMap, toCamelCase } from './utils';
import { VALID_HTML_ATTRIBUTES } from './constants';

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

export const isGlobalAttribute = makeMap(
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

function isAriaOrDataOrFrmkAttribute(attrName) {
    return attrName === 'role' || attrName === 'is' || attrName === 'key' || isDataOrAria(attrName);
}

function transformAttr(attr) {
    return ATTR_TRANFORMS[attr] || attr;
}

export function isValidHTMLAttribute(tagName: string, attrName: string, /*attrValue: string*/) {
    if (isAriaOrDataOrFrmkAttribute(attrName)) {
        return true;
    }

    const validElements = VALID_HTML_ATTRIBUTES[attrName];
    return !!validElements && (validElements.length ? validElements.indexOf(tagName) !== -1 : true) /* applies to all */;
}

// TODO: We will be adding more whitelisting here as we find bugs...
function isInputSpecialCase(tagName: string, attrName: string) {
    return tagName === 'input' && attrName !== "type";
}

/*
* Attribute vs. Prop
* We consider is an attribute if any of the conditions apply:
* 1) Is a special attribute (role, aria, key, is, data-)
* 2) Is a global attr (commong to all tags)
* 3) Is an html with no `is` and its not an input tag (input is special)
* 4) If has an is attr and is a valid HTMl for the current tagName
*/
export function isAttribute(tagName: string, attrName: string, hasIsAttr: boolean): boolean {
    return isGlobalAttribute(attrName) ||
           isAriaOrDataOrFrmkAttribute(attrName) ||
           (!isCustomElement(tagName) && !hasIsAttr && !isInputSpecialCase(tagName, attrName)) ||
           (hasIsAttr && isValidHTMLAttribute(tagName, attrName));
}

export function isProp(tagName: string, attrName: string, hasIsAttr: boolean) {
    return !isAttribute(tagName, attrName, hasIsAttr);
}

export function getPropertyNameFromAttrName(attrName: string, tagName: string) {
    return  transformAttr((isSVG(tagName) || isAriaOrDataOrFrmkAttribute(attrName)) ? attrName : toCamelCase(attrName));
}
