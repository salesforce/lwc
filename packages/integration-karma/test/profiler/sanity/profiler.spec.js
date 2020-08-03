import { createElement } from 'lwc';
import Container from 'x/container';

describe('Profiler Sanity Test', () => {
    afterEach(() => {
        LWC.__unstable__ProfilerControl.detachDispatcher();
        LWC.__unstable__ProfilerControl.disableProfiler();
    });

    const X_CONTAINER = 'X-CONTAINER';
    const X_ERROR_CHILD = 'X-ERROR-CHILD';
    const X_ITEM = 'X-ITEM';

    const OperationId = {
        constructor: 0,
        render: 1,
        patch: 2,
        connectedCallback: 3,
        renderedCallback: 4,
        disconnectedCallback: 5,
        errorCallback: 6,
    };

    const Phase = {
        Start: 0,
        Stop: 1,
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
        profilerControl.attachDispatcher((opId, phase, name) => {
            name = name.toUpperCase();
            events.push({ opId, phase, name });
        });
        return events;
    }

    function matchEventsOfTypeFor(opId, name, profilerEvents) {
        const filteredEvents = profilerEvents.filter((e) => e.name === name && e.opId === opId);
        const expectedEvents = [
            { opId, phase: Phase.Start, name },
            { opId, phase: Phase.Stop, name },
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

        const expectedEvents = [
            { opId: OperationId.errorCallback, phase: Phase.Start, name: X_ERROR_CHILD },
            { opId: OperationId.errorCallback, phase: Phase.Stop, name: X_ERROR_CHILD },
        ];
        expect(profilerEvents).toEqual(expectedEvents);
    });
});
