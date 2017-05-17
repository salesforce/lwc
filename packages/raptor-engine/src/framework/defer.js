import assert from "./assert";
import { isFunction, isUndefined, isPromise } from "./language";
import { evaluateTemplate } from "./template";
import { rehydrate } from "./vm";

function attemptToEvaluateResolvedTemplate(vm: VM, html: Template | undefined, originalPromise: Promise<Template | undefined>) {
    let { context } = vm;
    if (originalPromise !== context.tplPromise) {
        // resolution of an old promise that is not longer relevant, ignoring it.
        return;
    }
    if (isFunction(html)) {
        context.tplResolvedValue = html;
        assert.block(function devModeCheck() {
            if (html === vm.cmpTemplate) {
                assert.logError(`component ${vm.component} is returning a new promise everytime the render() method is invoked, even though the promise resolves to the same template ${html}. You should cache the promise outside of the render method, and return the same promise everytime, otherwise you will incurr in some performance penalty.`);
            }
        });
        // forcing the vm to be dirty so it can render its content.
        vm.isDirty = true;
        rehydrate(vm);
    } else if (!isUndefined(html)) {
        assert.fail(`The template rendered by ${vm} must return an imported template tag (e.g.: \`import html from "./mytemplate.html"\`) or undefined, instead, it has returned ${html}.`);
    }
    // if the promise resolves to `undefined`, do nothing...
}

export function deferredTemplate(vm: VM, html: Promise<Template | undefined>): Array<VNode> {
    assert.vm(vm);
    assert.isTrue(isPromise(html), `deferredTemplate() second argument must be a promise instead of ${html}`);
    let { context } = vm;
    const { tplResolvedValue, tplPromise } = context;
    if (html !== tplPromise) {
        context.tplPromise = html;
        context.tplResolvedValue = undefined;
        html.then((fn) => attemptToEvaluateResolvedTemplate(vm, fn, html));
    } else if (tplResolvedValue) {
        // if multiple invokes to render() return the same promise, we can rehydrate using the
        // underlaying resolved value of that promise.
        return evaluateTemplate(vm, tplResolvedValue);
    }
    return [];
}
