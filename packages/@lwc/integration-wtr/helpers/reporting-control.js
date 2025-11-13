import { __unstable__ReportingControl } from 'lwc';

/**
 *
 * @param dispatcher
 * @param runtimeEvents List of runtime events to filter by. If no list is provided, all events will be dispatched.
 */
export function attachReportingControlDispatcher(dispatcher, runtimeEvents) {
    __unstable__ReportingControl.attachDispatcher((eventName, payload) => {
        if (!runtimeEvents || runtimeEvents.includes(eventName)) {
            dispatcher(eventName, payload);
        }
    });
}

export function detachReportingControlDispatcher() {
    __unstable__ReportingControl.detachDispatcher();
}
