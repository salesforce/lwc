import { Template } from "./template";

const signedTemplateSet: Set<Template> = new Set();

export function defaultEmptyTemplate() {
    return [];
}
signedTemplateSet.add(defaultEmptyTemplate);

export function isTemplateRegistered(tpl: Template): boolean {
    return signedTemplateSet.has(tpl);
}

// chaining this method as a way to wrap existing
// assignment of templates easily, without too much transformation
export function registerTemplate(tpl: Template): Template {
    signedTemplateSet.add(tpl);
    return tpl;
}
