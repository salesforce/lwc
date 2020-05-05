import { VM, scheduleRehydration } from './vm';
import { isFalse, isUndefined } from '@lwc/shared';
import { markComponentAsDirty } from './component';
import { Template } from './template';

const swappedTemplateMap: WeakMap<Template, Template> = new WeakMap();
const activeTemplates: WeakMap<Template, Set<VM>> = new WeakMap();

function rehydrateHotTemplate(tpl: Template) {
    const list = activeTemplates.get(tpl);
    list?.forEach((vm) => {
        if (!isUndefined(vm)) {
            if (isFalse(vm.isDirty)) {
                markComponentAsDirty(vm);
                scheduleRehydration(vm);
            }
        }
    });
}

export function registerTemplateSwap(oldTpl: Template, newTpl: Template) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    swappedTemplateMap.set(oldTpl, newTpl);
    rehydrateHotTemplate(oldTpl);
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

export function addHotVM(vm: VM) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const tpl = vm.cmpTemplate;
    let list = activeTemplates.get(tpl);
    if (isUndefined(list)) {
        list = new Set();
        activeTemplates.set(tpl, list);
    }
    // this will allow us to keep track of the templates that are being used by a hot component
    list.add(vm);
}

export function removeHotVM(vm: VM) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const tpl = vm.cmpTemplate;
    const list = activeTemplates.get(tpl);
    if (!isUndefined(list)) {
        // deleting the vm from the template's set to avoid leaking memory
        list.delete(vm);
    }
}
