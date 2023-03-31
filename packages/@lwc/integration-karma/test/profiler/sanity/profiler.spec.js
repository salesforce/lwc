import { createElement } from 'lwc';
import Container from 'x/container';

describe('Profiler Sanity Test', () => {
    // Count the number of marks/measures before and after the test to ensure the profiler
    // doesn't leak any. Note that other tests/libraries may be adding their own marks/measures,
    // so we can't just check for 0.
    const hasPerfMarksAndMeasures =
        typeof performance !== 'undefined' && performance.getEntriesByType;
    let numMarksBeforeTest;
    let numMeasuresBeforeTest;

    beforeEach(() => {
        if (hasPerfMarksAndMeasures) {
            numMarksBeforeTest = performance.getEntriesByType('mark').length;
            numMeasuresBeforeTest = performance.getEntriesByType('measure').length;
        }
    });

    afterEach(() => {
        LWC.__unstable__ProfilerControl.detachDispatcher();
        LWC.__unstable__ProfilerControl.disableProfiler();

        // No marks or measures added by the profiler
        if (hasPerfMarksAndMeasures) {
            expect(performance.getEntriesByType('mark').length).toEqual(numMarksBeforeTest);
            expect(performance.getEntriesByType('measure').length).toEqual(numMeasuresBeforeTest);
        }
    });

    const X_CONTAINER = 'X-CONTAINER';
    const X_ERROR_CHILD = 'X-ERROR-CHILD';
    const X_ITEM = 'X-ITEM';
    const X_LIGHT = 'X-LIGHT';

    const OperationId = {
        constructor: 0,
        render: 1,
        patch: 2,
        connectedCallback: 3,
        renderedCallback: 4,
        disconnectedCallback: 5,
        errorCallback: 6,
        globalHydrate: 7,
        globalRehydrate: 8,
    };

    const Phase = {
        Start: 0,
        Stop: 1,
    };

    const RenderMode = {
        Light: 0,
        Shadow: 1,
    };

    const ShadowMode = {
        Native: 0,
        Synthetic: 1,
    };

    const getExpectedShadowMode = (name) => {
        if (!name) {
            return undefined;
        }
        if (name === X_LIGHT) {
            return ShadowMode.Native;
        }
        return process.env.NATIVE_SHADOW ? ShadowMode.Native : ShadowMode.Synthetic;
    };
    const getExpectedRenderMode = (name) => {
        if (!name) {
            return undefined;
        }
        return name === X_LIGHT ? RenderMode.Light : RenderMode.Shadow;
    };

    async function generateContainer() {
        const elm = createElement(X_CONTAINER.toLowerCase(), { is: Container });
        document.body.appendChild(elm);
        await Promise.resolve();
        return elm;
    }

    function enableProfilerAndRegisterBuffer() {
        const profilerControl = LWC.__unstable__ProfilerControl;
        const events = [];
        profilerControl.enableProfiler();
        profilerControl.attachDispatcher((opId, phase, name, id, renderMode, shadowMode) => {
            name = name ? name.toUpperCase() : name;
            events.push({ opId, phase, name, renderMode, shadowMode });
        });
        return events;
    }

    function matchEventsOfTypeFor(opId, name, profilerEvents) {
        const filteredEvents = profilerEvents.filter((e) => e.name === name && e.opId === opId);
        const expectedEvents = [
            {
                opId,
                phase: Phase.Start,
                name,
                renderMode: getExpectedRenderMode(name),
                shadowMode: getExpectedShadowMode(name),
            },
            {
                opId,
                phase: Phase.Stop,
                name,
                renderMode: getExpectedRenderMode(name),
                shadowMode: getExpectedShadowMode(name),
            },
        ];
        expect(filteredEvents).toEqual(expectedEvents);
    }

    it('container first render without activating list', async () => {
        const profilerEvents = enableProfilerAndRegisterBuffer();
        await generateContainer();

        matchEventsOfTypeFor(OperationId.constructor, X_CONTAINER, profilerEvents);
        matchEventsOfTypeFor(OperationId.render, X_CONTAINER, profilerEvents);
        matchEventsOfTypeFor(OperationId.patch, X_CONTAINER, profilerEvents);
        matchEventsOfTypeFor(OperationId.connectedCallback, X_CONTAINER, profilerEvents);
        matchEventsOfTypeFor(OperationId.renderedCallback, X_CONTAINER, profilerEvents);
        matchEventsOfTypeFor(OperationId.globalHydrate, X_CONTAINER, profilerEvents);

        matchEventsOfTypeFor(OperationId.constructor, X_LIGHT, profilerEvents);
        matchEventsOfTypeFor(OperationId.render, X_LIGHT, profilerEvents);
    });

    it('activate children in iteration in container', async () => {
        const elm = await generateContainer();
        const profilerEvents = enableProfilerAndRegisterBuffer();
        const activateListButton = elm.shadowRoot.querySelector('.profiler-renderList');

        activateListButton.click();
        await Promise.resolve();

        // the child item will have the usual lifecycle
        matchEventsOfTypeFor(OperationId.constructor, X_ITEM, profilerEvents);
        matchEventsOfTypeFor(OperationId.render, X_ITEM, profilerEvents);
        matchEventsOfTypeFor(OperationId.patch, X_ITEM, profilerEvents);
        matchEventsOfTypeFor(OperationId.globalRehydrate, undefined, profilerEvents);
    });

    it('error callback counted properly', async () => {
        const elm = await generateContainer();
        const profilerEvents = enableProfilerAndRegisterBuffer();
        const errorButton = elm.shadowRoot
            .querySelector(X_ERROR_CHILD.toLowerCase())
            .shadowRoot.querySelector('button');

        try {
            errorButton.click();
        } catch (e) {
            // do nothing
        }

        const name = X_ERROR_CHILD;
        const expectedEvents = [
            {
                opId: OperationId.errorCallback,
                phase: Phase.Start,
                name,
                renderMode: getExpectedRenderMode(name),
                shadowMode: getExpectedShadowMode(name),
            },
            {
                opId: OperationId.errorCallback,
                phase: Phase.Stop,
                name,
                renderMode: getExpectedRenderMode(name),
                shadowMode: getExpectedShadowMode(name),
            },
        ];
        expect(profilerEvents).toEqual(expectedEvents);
    });
});
