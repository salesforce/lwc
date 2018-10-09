import { ArrayJoin, ArrayPush, forEach, getOwnPropertyDescriptor, isNull, StringToLowerCase } from "./language";

const parentNodeGetter: (this: Node) => Node | null = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;
const elementTagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(Element.prototype, 'tagName')!.get!;
const nativeShadowRootHostGetter: (this: ShadowRoot) => Element = (function() {
    const nativeShadowRootIsAvailable = typeof (window as any).ShadowRoot !== "undefined";
    if (nativeShadowRootIsAvailable) {
        return getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, 'host')!.get!;
    } else {
        return () => {
            throw new Error(`Internal Error: Invalid ShadowRoot resolution.`);
        };
    }
})();

const StringSplit = String.prototype.split;

function isLWC(element): element is HTMLElement {
    return (element instanceof Element) && (elementTagNameGetter.call(element).indexOf('-') !== -1);
}

function isShadowRoot(elmOrShadow: Node | ShadowRoot): elmOrShadow is ShadowRoot {
    return !(elmOrShadow instanceof Element) && ('host' in elmOrShadow);
}

function getFormattedComponentStack(elm: Element): string {
    const componentStack: string[] = [];
    const indentationChar = '\t';
    let indentation = '';

    let currentElement: Node | null = elm;

    do {
        if (isLWC(currentElement)) {
            ArrayPush.call(componentStack, `${indentation}<${StringToLowerCase.call(elementTagNameGetter.call(currentElement))}>`);

            indentation = indentation + indentationChar;
        }

        if (isShadowRoot(currentElement)) {
            // if at some point we find a ShadowRoot, it must be a native shadow root.
            currentElement = nativeShadowRootHostGetter.call(currentElement);
        } else {
            currentElement = parentNodeGetter.call(currentElement);
        }
    } while (!isNull(currentElement));

    return ArrayJoin.call(componentStack, '\n');
}

const assert = {
    invariant(value: any, msg: string) {
        if (!value) {
            throw new Error(`Invariant Violation: ${msg}`);
        }
    },
    isTrue(value: any, msg: string) {
        if (!value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    isFalse(value: any, msg: string) {
        if (value) {
            throw new Error(`Assert Violation: ${msg}`);
        }
    },
    fail(msg: string) {
        throw new Error(msg);
    },
    logError(message: string, elm: Element | null) {
        let msg = message;

        if (elm) {
            msg = `${msg}\n${getFormattedComponentStack(elm)}`;
        }

        if (process.env.NODE_ENV === 'test') {
            console.error(msg); // tslint:disable-line
            return;
        }
        try {
            throw new Error(msg);
        } catch (e) {
            console.error(e); // tslint:disable-line
        }
    },
    logWarning(message: string, elm: Element | null) {
        let msg = message;

        if (elm) {
            msg = `${msg}\n${getFormattedComponentStack(elm)}`;
        }

        if (process.env.NODE_ENV === 'test') {
            console.warn(msg); // tslint:disable-line
            return;
        }
        try {
            throw new Error('error to get stacktrace');
        } catch (e) {
            // first line is the dummy message and second this function (which does not need to be there)
            const stackTraceLines: string[] = StringSplit.call(e.stack, '\n').splice(2);
            console.group(`Warning: ${msg}`); // tslint:disable-line
            forEach.call(stackTraceLines, (trace) => {
                // We need to format this as a string,
                // because Safari will detect that the string
                // is a stack trace line item and will format it as so
                console.log('%s', trace.trim()); // tslint:disable-line
            });
            console.groupEnd(); // tslint:disable-line
        }
    },
};

export default assert;
