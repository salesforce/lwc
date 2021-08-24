import * as parse5 from 'parse5';
import {
    CompilerDiagnostic,
    CompilerError,
    generateCompilerDiagnostic,
    generateCompilerError,
    Location,
    LWCErrorInfo,
    normalizeToCompilerError,
    normalizeToDiagnostic,
} from '@lwc/errors';

import { IRBaseAttribute, IRNode } from '../shared/types';

function normalizeLocation(location?: parse5.Location): Location {
    let line = 0;
    let column = 0;
    let start = 0;
    let length = 0;

    if (location) {
        const { startOffset, endOffset } = location;

        line = location.startLine;
        column = location.startCol;
        start = startOffset;
        length = endOffset - startOffset;
    }

    return { line, column, start, length };
}

export default class Warning {
    readonly warnings: CompilerDiagnostic[] = [];

    warnOnIRNode(errorInfo: LWCErrorInfo, irNode: IRNode | IRBaseAttribute, messageArgs?: any[]) {
        this.warnAtLocation(errorInfo, messageArgs, irNode.location);
    }

    warnAtLocation(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: parse5.Location) {
        this.addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: normalizeLocation(location),
                },
            })
        );
    }

    // Check difference between location objects of warnAtLocation and warnOnError
    warnOnError(errorInfo: LWCErrorInfo, error: any, location?: parse5.Location) {
        this.addDiagnostic(
            normalizeToDiagnostic(errorInfo, error, {
                location: normalizeLocation(location),
            })
        );
    }

    throwOnError(errorInfo: LWCErrorInfo, error: any, location?: parse5.Location): never {
        throw normalizeToCompilerError(errorInfo, error, {
            location: normalizeLocation(location),
        });
    }

    errorTest(error: CompilerError) {
        this.addDiagnostic(error.toDiagnostic());
    }

    throwError(errorInfo: LWCErrorInfo, location: parse5.Location, messageArgs?: any[]): never {
        // if (condition) {
        throw generateCompilerError(errorInfo, {
            messageArgs,
            origin: {
                location: normalizeLocation(location),
            },
        });
        // }
    }

    addDiagnostic(diagnostic: CompilerDiagnostic) {
        this.warnings.push(diagnostic);
    }
}
