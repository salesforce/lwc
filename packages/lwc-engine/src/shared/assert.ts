import {StringToLowerCase, ArrayMap, ArrayJoin, forEach} from "./language";
import { elementTagNameGetter } from "../framework/dom-api";
import { getComponentStack } from "./debug";

const StringSplit = String.prototype.split;

function formatComponentStack(componentStack: HTMLElement[]): string {
    const indentationChar = '\t';
    let indentation = '';

    const stackNames = ArrayMap.call(componentStack, (component: HTMLElement): string => {
            const componentName = `<${StringToLowerCase.call(elementTagNameGetter.call(component))}>`;
            const mappedComponentName = `${indentation}${componentName}`;
            indentation = indentation + indentationChar;

            return mappedComponentName;
        });

    return ArrayJoin.call(stackNames, '\n');
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
            const wcStack = getComponentStack(elm);
            msg = `${msg}\n${formatComponentStack(wcStack)}`;
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
            const wcStack = getComponentStack(elm);
            msg = `${msg}\n${formatComponentStack(wcStack)}`;
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
