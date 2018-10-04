import { Template } from "./template";

const VERIFIED_TEMPLATE_SET = new Set();

export function verifyTemplate(tmpl: Template): Template {
    if (!VERIFIED_TEMPLATE_SET.has(tmpl)) {
        throw new TypeError('Unknown template');
    }
    return tmpl;
}

export function registerTemplate(tmpl: Template): Template {
    VERIFIED_TEMPLATE_SET.add(tmpl);
    return tmpl;
}
