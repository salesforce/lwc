/**
 * LWC only lets us call `setHooks` once. But we need to do it multiple times
 * for tests, so we implement
 */
import { setHooks as lwcSetHooks } from 'lwc';

let sanitizeHtmlContentHook = function shouldBeReplaced() {
    throw new Error('sanitizeHtmlContent hook must be implemented.');
};

lwcSetHooks({
    sanitizeHtmlContent(content) {
        return sanitizeHtmlContentHook(content);
    },
});

export function getHooks() {
    return { sanitizeHtmlContent: sanitizeHtmlContentHook };
}

export function setHooks(hooks) {
    sanitizeHtmlContentHook = hooks.sanitizeHtmlContent;
}
