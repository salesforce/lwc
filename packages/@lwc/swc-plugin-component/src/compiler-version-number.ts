/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWC_VERSION_COMMENT } from '@lwc/shared';
import type { Class } from '@swc/types';

// The comment text to inject into class bodies (without surrounding /* */ delimiters)
export const VERSION_COMMENT_PLACEHOLDER = `/*${LWC_VERSION_COMMENT}*/`;

/**
 * Determines whether a class node needs a compiler version comment.
 * A class needs the comment only if it has a superclass.
 */
export function classNeedsVersionComment(classNode: Class): boolean {
    return classNode.superClass !== undefined && classNode.superClass !== null;
}

/**
 * A record of class body information collected during AST traversal.
 */
export interface ClassVersionCommentInfo {
    /** The span.end byte offset of the class node in the ORIGINAL source */
    classSpanEnd: number;
    /** Whether the class body is empty (no members) */
    isEmpty: boolean;
}
