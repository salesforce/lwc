import { Declaration } from 'postcss';
import { Root } from 'postcss-selector-parser';
import { generateErrorMessage, LWCErrorInfo } from 'lwc-errors';

export function generateErrorFromDeclaration(decl: Declaration, config: {errorInfo: LWCErrorInfo, messageArgs?: any[], options?: any}): Error {
    const message = generateErrorMessage(config.errorInfo, config.messageArgs);
    const error = decl.error(message, config.options);

    error.lwcCode = config.errorInfo.code;

    return error;
}

export function generateErrorFromRoot(root: Root, config: {errorInfo: LWCErrorInfo, messageArgs: any[], options: any}): Error {
    const message = generateErrorMessage(config.errorInfo, config.messageArgs);
    const error = root.error(message, config.options);

    error.lwcCode = config.errorInfo.code;

    return error;
}
