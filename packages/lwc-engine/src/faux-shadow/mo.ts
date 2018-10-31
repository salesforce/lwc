import assert from "../shared/assert";

let MO = (window as any).MutationObserver;
// MutationObserver is not yet implemented in jsdom:
// https://github.com/jsdom/jsdom/issues/639
if (typeof MO === 'undefined') {
    /* tslint:disable-next-line:no-empty */
    function MutationObserverMock() {}
    MutationObserverMock.prototype = {
        observe() {
            assert.isTrue(
                process.env.NODE_ENV === 'test',
                'MutationObserver should not be mocked outside of the jest test environment'
            );
        }
    };
    MO = (window as any).MutationObserver = MutationObserverMock;
}

export const MutationObserver = MO;
export const observe = MutationObserver.prototype.observe;
