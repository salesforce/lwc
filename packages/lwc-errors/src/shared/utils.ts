export interface LWCErrorInfo {
    code: number;
    message: string;
    level?: Level;
    type?: string;
    arguments?: any[];
    url?: string;
}

export interface Location {
    line: number;
    column: number;
}

export enum Level {
    /** Unexpected error, parsing error, bundling error */
    Fatal = 0,
    /** Linting error with error level, invalid external reference, invalid import, invalid transform */
    Error = 1,
    /** Linting error with warning level, usage of an API to be deprecated */
    Warning = 2,
    /** Logging messages */
    Log = 3,
}

const templateRegex = /\{([0-9]+)\}/g;
export function templateString(template: string, args: any[]) {
    return template.replace(templateRegex, (_, index) => {
        return args[index];
    });
}
