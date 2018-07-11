export class CompilerError extends Error {
    public filename: string;
    public location?: { line: number, column: number };

    constructor(message: string, filename: string, location?: { line: number, column: number }) {
        super(message);

        this.filename = filename;
        this.location = location;
    }
}
