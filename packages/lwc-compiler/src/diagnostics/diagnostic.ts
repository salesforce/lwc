export interface Diagnostic {
    /** Level of the diagnostic */
    level: DiagnosticLevel;

    /** Error messages that should be outputed */
    message: string;

    /** Relative path location of the file in the bundle. */
    filename?: string;

    /**
     * Location in the code affected by the diagnostic.
     * This field is optional, for example when the compiler throws an uncaught exception.
     */
    location?: Location;
}

export enum DiagnosticLevel {
    /** Unexpected error, parsing error, bundling error */
    Fatal = 0,
    /** Linting error with error level, invalid external reference, invalid import, invalid transform */
    Error = 1,
    /** Linting error with warning level, usage of an API to be deprecated */
    Warning = 2,
    /** Logging messages */
    Log = 3,
}

export interface Location {
    /** 0-base character index in the file */
    start: number;

    /** Number of character after the start index */
    length: number;
}
