import { Reference } from './types';

import * as postcss from 'postcss';
import { NodeSource, Rule } from 'postcss';

import * as postcssSelector from 'postcss-selector-parser';
import { isTag, Tag } from 'postcss-selector-parser';

function isCustomElementSelector(tag: string) {
    return tag.includes('-');
}

function getSelectorOffset(rule: Rule, source: string) {
    // line and column are both 1 based.
    const { line, column } = rule.source.start!;

    const lines = source.split('\n');
    const lineOffset = lines
        .slice(0, line - 1)
        .reduce((offset, l) => offset + l.length + 1, 0);

    return lineOffset + column - 1;
}

function getSelectorReferences(
    selector: string,
    filename: string,
    offset: number,
): Reference[] {
    const references: Reference[] = [];

    const processor = postcssSelector();
    const root = processor.astSync(selector, { lossless: true });

    root.walk(node => {
        if (!isTag(node) || !isCustomElementSelector(node.value)) {
            return;
        }

        references.push({
            id: node.value,
            type: 'component',
            file: filename,
            locations: [
                {
                    start: offset + node.sourceIndex,
                    length: node.value.length,
                },
            ],
        });
    });

    return references;
}

export function getReferences(source: string, filename: string): Reference[] {
    const references: Reference[] = [];

    const root = postcss.parse(source, { from: filename });
    root.walkRules(rule => {
        const selectorOffset = getSelectorOffset(rule, source);
        const ruleReferences = getSelectorReferences(
            rule.selector,
            filename,
            selectorOffset,
        );
        references.push(...ruleReferences);
    });

    return references;
}
