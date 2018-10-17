export enum Level {
    /** Unexpected error, parsing error, bundling error */
    Fatal = "fatal",
    /** Linting error with error level, invalid external reference, invalid import, invalid transform */
    Error = "error",
    /** Linting error with warning level, usage of an API to be deprecated */
    Warning = "warning",
    /** Logging messages */
    Log = "log",
}

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
