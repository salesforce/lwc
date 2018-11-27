export interface Location {
    /** 0-base character index in the file */
    start: number;

    /** Number of character after the start index */
    length: number;

    line?: number;
    column?: number;
}
