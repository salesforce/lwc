import { __unstable__ReportingControl as reportingControl, setFeatureFlagForTest } from 'lwc';

describe('reporting', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = jasmine.createSpy();
        reportingControl.attachDispatcher(dispatcher);
    });

    afterEach(() => {
        reportingControl.detachDispatcher();
    });

    describe('lwcRuntimeFlags.DISABLE_REPORTING=false', () => {
        it('reporting is enabled', () => {
            window.__lwcReport(0, /* fake VM */ { tagName: 'x-foo', idx: 1 });
            expect(dispatcher).toHaveBeenCalledWith(0, 'x-foo', 1);
        });
    });

    describe('lwcRuntimeFlags.DISABLE_REPORTING=true', () => {
        beforeEach(() => {
            setFeatureFlagForTest('DISABLE_REPORTING', true);
        });

        afterEach(() => {
            setFeatureFlagForTest('DISABLE_REPORTING', false);
        });

        it('reporting is disabled', () => {
            window.__lwcReport(0, /* fake VM */ { tagName: 'x-foo', idx: 1 });
            expect(dispatcher).not.toHaveBeenCalled();
        });
    });
});
