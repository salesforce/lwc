let root;
let activeMeasure;
const originalUserTiming = window.performance;

export const isUserTimingSupported =
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

export function resetMeasures() {
    root = {
        parent: null,
        children: [],
    };
    activeMeasure = root;
}

export function patchUserTiming() {
    window.performance = {
        mark(name) {
            const measure = {
                label: null,
                parent: activeMeasure,
                children: [],
            };

            activeMeasure.children.push(measure);
            activeMeasure = measure;

            originalUserTiming.mark(name);
        },
        measure(label, startMarkName) {
            activeMeasure.label = label;
            activeMeasure = activeMeasure.parent;

            originalUserTiming.measure(label, startMarkName);
        },

        clearMarks: originalUserTiming.clearMarks.bind(originalUserTiming),
        clearMeasures: originalUserTiming.clearMeasures.bind(originalUserTiming),
    };
}

export function resetUserTiming() {
    window.performance = originalUserTiming;
}

function compareMeasure(actual, expected) {
    if (actual.label) {
        expect(actual.label).toMatch(expected.label);
    }

    if (actual.children.length) {
        expect(actual.children.length).toBe(expected.children.length);

        for (let i = 0; i < actual.children.length; i++) {
            compareMeasure(actual.children[i], expected.children[i]);
        }
    }
}

export function expectMeasureEquals(expected) {
    const actual = root.children;

    expect(actual.length).toBe(expected.length);

    for (let i = 0; i < actual.length; i++) {
        compareMeasure(actual[i], expected[i]);
    }
}
