let MO = (window as any).MutationObserver;

// MutationObserver is not yet implemented in jsdom:
// https://github.com/jsdom/jsdom/issues/639
if (typeof MO === 'undefined') {
    /* tslint:disable-next-line:no-empty */
    function MutationObserverMock() {}
    MutationObserverMock.prototype = {
        observe() {
            if (process.env.NODE_ENV !== 'production') {
                if (process.env.NODE_ENV !== 'test') {
                    throw new Error(`MutationObserver should not be mocked outside of the jest test environment`);
                }
            }
        }
    };
    MO = (window as any).MutationObserver = MutationObserverMock;
}

const MutationObserver = MO;
const MutationObserverObserve = MutationObserver.prototype.observe;

export {
    MutationObserver,
    MutationObserverObserve,
};
