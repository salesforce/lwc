import {
    bundleResultsIterator,
} from '../shared/bundle';

import {
    removeNodeChildren,
} from './utils';

const ROOT_SELECTOR = '#results-container';

const TEMPLATE_ELEMENT_SELECTOR = '#table-results-template';
const TEMPLATE_SELECTORS = {
    header: 'thead tr',
    body: 'tbody',
};

const rootElement = document.querySelector(ROOT_SELECTOR);

const headerCell = (content = '') => `<th scope="col">${content}</th>`;
const bodyCell = (content = '', style = '') => `<td scope="row" style="${style}">${content}</td>`;

function formatStats(benchmark, shouldCompare) {
    const { stats, compare } = benchmark;

    const cells = stats.map(stat => {
        let content = 'N/A';
        if (stat) {
            content = `${stat.median.toFixed(2)} ms <small>(± ${stat.mad.toFixed(2)} ms)</small>`;
        }

        return bodyCell(content);
    });

    if (shouldCompare) {
        let formattedCompare = 'N/A';

        if (compare === 0) {
            formattedCompare = 'stable'
        } else if (compare === 1) {
            formattedCompare = 'regress'
        } else {
            formattedCompare = 'improve'
        }

        cells.push(bodyCell(formattedCompare));
    }

    return cells;
}

function renderHeader(bundles, shouldCompare) {
    const head = [
        headerCell(''),
        ...bundles.map(bundle => headerCell(bundle.label)),
        shouldCompare && headerCell('comparison'),
    ];

    return head
        .filter(Boolean)
        .join('');
}

function renderBody(bundles, shouldCompare) {
    const body = [];

    for (let [name, benchmark] of bundleResultsIterator(bundles)) {
        const cells = [
            bodyCell(name),
            ...formatStats(benchmark, shouldCompare),
        ];

        body.push(`<tr>${cells.join('')}</tr>`);
    }

    return body.join('');
}

export function clearTable() {
    removeNodeChildren(rootElement);
}

export function renderResults(bundles) {
    const shouldCompareBundles = bundles.length >= 2;

    const t = document.querySelector(TEMPLATE_ELEMENT_SELECTOR).content;
    t.querySelector(TEMPLATE_SELECTORS.header).innerHTML = renderHeader(bundles, shouldCompareBundles);
    t.querySelector(TEMPLATE_SELECTORS.body).innerHTML = renderBody(bundles, shouldCompareBundles);

    const tableEl = document.importNode(t, true);
    rootElement.appendChild(tableEl);
}
