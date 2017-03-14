/* eslint-env node */

import fs from 'fs';
import Table from 'cli-table';

import BenchmarkResult, { groupBenchmarkByName } from '../shared/benchmark-results';

function compareBenchmarkResults(base, compare) {
    const compareRes = BenchmarkResult.compare(base, compare);

    switch (compareRes) {
        case 0: // Statically not differenciable
            return '👌';

        case 1: // Base is better than compare
            return '👎';

        case -1: // Compare is better than base
            return '👍';

        default:
            throw new Error(`Unexpected compare value of ${compareRes}`);
    }
}

function buildTable(bundles) {
    const isComparable = bundles.length === 2;
    const labels = bundles.map(bundle => bundle.label);
    const head = ['', ...labels];

    if (isComparable) {
        head.push('trend');
    }

    const benchmarkResults = bundles.map(({ results }) => (
        results.map(result => new BenchmarkResult(result.name, result.samples))
    ));

    const groupedResults = groupBenchmarkByName(...benchmarkResults);

    const rows = groupedResults.map(benchmark => {
        const { name, results } = benchmark;

        const data = results.map(benchmark => {
            if (benchmark) {
                const { median, mad } = benchmark.stats;
                return `${median.toFixed(3)} ± ${mad.toFixed(3)}`;
            } else {
                return '';
            }
        });

        if (isComparable) {
            if (results.length === 2 && results.every(Boolean)) {
                const [base, compare] = results;
                data.push(compareBenchmarkResults(base, compare));
            } else {
                data.push('');
            }
        }

        return [name, ...data];
    });

    return [
        head,
        ...rows
    ]
}

class JSONReporter {
    constructor({ dest }) {
        if (!dest) {
            throw new Error('JSON reporter expect a dest argument');
        }

        this.dest = dest;
    }

    run(results) {
        const formatted = JSON.stringify(results, null, 4);
        fs.writeFileSync(this.dest, formatted);
    }
}

class MarkdownReporter {
    constructor({ dest }) {
        if (!dest) {
            throw new Error('Markdown reporter expect a dest argument');
        }

        this.dest = dest;
    }

    run(results) {
        const [head, ...rows] = buildTable(results);

        const table = [
            head,
            head.map(() => `---`),
            ...rows
        ];

        const formattedTable = table.map(row => row.join(' | ')).join('\n');
        fs.writeFileSync(this.dest, formattedTable);
    }
}

class PrettyTable {
    run(bundles) {
        const [head, ...rows] = buildTable(bundles)

        const table = new Table({ head });
        table.push(...rows);

        console.log(table.toString());
    }
}

const REPORTER_TYPES = {
    json: JSONReporter,
    markdown: MarkdownReporter,
    pretty: PrettyTable,
};

export default function(type, argv) {
    if (!(type in REPORTER_TYPES)) {
        throw new Error(`${type} is not a valid reporter.`);
    }

    const FormatterClass = REPORTER_TYPES[type];
    return new FormatterClass(argv);
}
