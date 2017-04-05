/* eslint-env node */

import fs from 'fs';
import Table from 'cli-table';

import {
    bundleResultsIterator,
} from '../shared/bundle';

function markdownDropdown(title, content) {
    return [
        '<p><details>',
        `<summary><b>${title}</b></summary>`,
        content,
        '</details></p>',
    ].join('\n');
}

function markdownReplayMessage(url) {
    const content = [
        '<p>You can do this by opening the following link in your browser<br/>',
        `<code><a href=${url}>${url}</code>`,
        '</p>',
    ].join('\n');

    return markdownDropdown(
        'Want to replay the benchmark?',
        content
    );
}

function formatStats(benchmark, shouldCompareBundles) {
    const { stats, compare } = benchmark;

    const cells = stats.map(stat => (
        stat ? `${stat.median.toFixed(2)} (± ${stat.mad.toFixed(2)} ms)` : 'N/A'
    ));

    if (shouldCompareBundles) {
        let formattedCompare = 'N/A';

        if (compare === 0) {
            formattedCompare = '👌'
        } else if (compare === 1) {
            formattedCompare = '👎'
        } else {
            formattedCompare = '👍'
        }

        cells.push(formattedCompare);
    }

    return cells;
}

function buildTable(bundles) {
    const shouldCompareBundles = bundles.length >= 2;

    const head = [
        'name',
        ...bundles.map(bundle => `${bundle.label} (${bundle.info.commitHash})`)
    ];

    if (shouldCompareBundles) {
        head.push('trend');
    }

    const rows = [];
    for (let [name, benchmark] of bundleResultsIterator(bundles)) {
        rows.push([
            name,
            ...formatStats(benchmark, shouldCompareBundles),
        ]);
    }

    return [
        head,
        ...rows
    ]
}

export function jsonFormatter ({ dest }) {
    if (!dest) {
        throw new Error('JSON formatter expects a dest argument')
    }

    return (err, res) => {
        let content = res;

        if (err) {
            const { message, stack } = err;
            content = { message, stack };
        }

        fs.writeFileSync(dest, JSON.stringify(content, null, 4));
    };
}

export function markdownFormatter ({ dest }, url) {
    if (!dest) {
        throw new Error('Markdown formatter expects a dest argument')
    }

    return (err, res) => {
        const lines = [];

        if (err) {
            lines.push(
                '### 🚫 Benchmark performance results 🚫',
                'Oops an error occurred during the benchmark!',
                '```',
                err.stack,
                '```',
            );

        } else {
            const [head, ...rows] = buildTable(res);
            const table = [
                head,
                head.map(() => `---`),
                ...rows
            ];

            const resultDropdown = markdownDropdown(
                'What is the raw performance result?',
                `<pre><code>${JSON.stringify(res, null, 4)}</code></pre>`,
            );

            lines.push(
                '### Benchmark performance results',
                table.map(row => row.join(' | ')).join('\n'),
                resultDropdown
            );
        }

        const content = [
            ...lines,
            markdownReplayMessage(url),
        ].join('\n');

        fs.writeFileSync(dest, content);
    }
}

export function cliFormatter() {
    return (err, res) => {
        // Because the cli already print errors, do nothing if there is an error
        if (err) {
            return;
        }

        const [head, ...rows] = buildTable(res)

        const table = new Table({ head });
        table.push(...rows);

        console.log(table.toString());
    }
}
