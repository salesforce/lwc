import { VM, scheduleRehydration } from './vm';
import { isFalse, isUndefined, isNull } from '@lwc/shared';
import { markComponentAsDirty, ComponentConstructor } from './component';
import { Template } from './template';
import { StylesheetFactory } from './stylesheet';

const swappedTemplateMap = new WeakMap<Template, Template>();
const swappedComponentMap = new WeakMap<ComponentConstructor, ComponentConstructor>();
const swappedStyleMap = new WeakMap<StylesheetFactory, StylesheetFactory>();

const activeTemplates = new WeakMap<Template, Set<VM>>();
const activeComponents = new WeakMap<ComponentConstructor, Set<VM>>();
const activeStyles = new WeakMap<StylesheetFactory, Set<VM>>();

function rehydrateHotTemplate(tpl: Template) {
    const list = activeTemplates.get(tpl);
    list?.forEach((vm) => {
        if (!isUndefined(vm)) {
            if (isFalse(vm.isDirty)) {
                // forcing the vm to rehydrate in the next tick
                markComponentAsDirty(vm);
                scheduleRehydration(vm);
            }
        }
    });
}

function rehydrateHotStyle(style: StylesheetFactory) {
    const list = activeStyles.get(style);
    list?.forEach((vm) => {
        if (!isUndefined(vm)) {
            if (isFalse(vm.isDirty)) {
                // hacky way to force the styles to get recomputed
                // by replacing the value of old template, which is used
                // during the rendering process. If the template returned
                // by render() is different from the previous stored template
                // the styles will be reset, along with the content of the
                // shadow, this way we can guarantee that the styles will be
                // recalculated, and applied.
                vm.cmpTemplate = () => [];
                // forcing the vm to rehydrate in the next tick
                markComponentAsDirty(vm);
                scheduleRehydration(vm);
            }
        }
    });
}

function rehydrateHotComponent(Ctor: ComponentConstructor) {
    const list = activeComponents.get(Ctor);
    list?.forEach((vm) => {
        if (!isUndefined(vm)) {
            const { owner } = vm;
            // the hot swapping for components only work for instances of components
            // created from a template, root elements can't be swapped because we
            // don't have a way to force the creation of the element with the same state
            // of the current element.
            if (!isNull(owner) && isFalse(owner.isDirty)) {
                // if a component class definition is swapped, we must reset
                // the shadowRoot instance that hosts an instance of the old
                // constructor in order to get a new element to be created based
                // on the new constructor. this is a hacky way to force the owner's
                // shadowRoot instance to be reset by replacing the value of old template,
                // which is used during the rendering process. If the template returned
                // by render() is different from the previous stored template
                // the styles will be reset, along with the content of the
                // shadow, this way we can guarantee that all children elements will be
                // throw away, and new instances will be created.
                owner.cmpTemplate = () => [];
                // forcing the vm to rehydrate in the next tick
                markComponentAsDirty(owner);
                scheduleRehydration(owner);
            }
        }
    });
}

export function getTemplateOrSwappedTemplate(tpl: Template): Template {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const visited: Set<Template> = new Set();
    while (swappedTemplateMap.has(tpl) && !visited.has(tpl)) {
        visited.add(tpl);
        tpl = swappedTemplateMap.get(tpl)!;
    }
    return tpl;
}

export function getComponentOrSwappedComponent(Ctor: ComponentConstructor): ComponentConstructor {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const visited: Set<ComponentConstructor> = new Set();
    while (swappedComponentMap.has(Ctor) && !visited.has(Ctor)) {
        visited.add(Ctor);
        Ctor = swappedComponentMap.get(Ctor)!;
    }
    return Ctor;
}

export function getStyleOrSwappedStyle(style: StylesheetFactory): StylesheetFactory {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const visited: Set<StylesheetFactory> = new Set();
    while (swappedStyleMap.has(style) && !visited.has(style)) {
        visited.add(style);
        style = swappedStyleMap.get(style)!;
    }
    return style;
}

export function setActiveVM(vm: VM) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // tracking active component
    const Ctor = vm.def.ctor;
    let componentVMs = activeComponents.get(Ctor);
    if (isUndefined(componentVMs)) {
        componentVMs = new Set();
        activeComponents.set(Ctor, componentVMs);
    }
    // this will allow us to keep track of the hot components
    componentVMs.add(vm);

    // tracking active template
    const tpl = vm.cmpTemplate;
    let templateVMs = activeTemplates.get(tpl);
    if (isUndefined(templateVMs)) {
        templateVMs = new Set();
        activeTemplates.set(tpl, templateVMs);
    }
    // this will allow us to keep track of the templates that are
    // being used by a hot component
    templateVMs.add(vm);

    // tracking active styles associated to template
    const stylesheets = tpl.stylesheets;
    if (!isUndefined(stylesheets)) {
        stylesheets.forEach((stylesheet) => {
            let stylesheetVMs = activeStyles.get(stylesheet);
            if (isUndefined(stylesheetVMs)) {
                stylesheetVMs = new Set();
                activeStyles.set(stylesheet, stylesheetVMs);
            }
            // this will allow us to keep track of the stylesheet that are
            // being used by a hot component
            stylesheetVMs.add(vm);
        });
    }
}

export function removeActiveVM(vm: VM) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // tracking inactive component
    const Ctor = vm.def.ctor;
    let list = activeComponents.get(Ctor);
    if (!isUndefined(list)) {
        // deleting the vm from the set to avoid leaking memory
        list.delete(vm);
    }
    // removing inactive template
    const tpl = vm.cmpTemplate;
    list = activeTemplates.get(tpl);
    if (!isUndefined(list)) {
        // deleting the vm from the set to avoid leaking memory
        list.delete(vm);
    }
    // removing active styles associated to template
    const styles = tpl.stylesheets;
    if (!isUndefined(styles)) {
        styles.forEach((style) => {
            list = activeStyles.get(style);
            if (isUndefined(list)) {
                // deleting the vm from the set to avoid leaking memory
                activeStyles.delete(style);
            }
        });
    }
}

export function registerTemplateSwap(oldTpl: Template, newTpl: Template) {
    if (process.env.NODE_ENV !== 'production') {
        swappedTemplateMap.set(oldTpl, newTpl);
        rehydrateHotTemplate(oldTpl);
    }
}

export function registerComponentSwap(
    oldComponent: ComponentConstructor,
    newComponent: ComponentConstructor
) {
    if (process.env.NODE_ENV !== 'production') {
        swappedComponentMap.set(oldComponent, newComponent);
        rehydrateHotComponent(oldComponent);
    }
}

export function registerStyleSwap(oldStyle: StylesheetFactory, newStyle: StylesheetFactory) {
    if (process.env.NODE_ENV !== 'production') {
        swappedStyleMap.set(oldStyle, newStyle);
        rehydrateHotStyle(oldStyle);
    }
}
