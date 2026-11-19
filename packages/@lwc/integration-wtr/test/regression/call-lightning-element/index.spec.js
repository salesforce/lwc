import {
    createElement,
    enableLockerMode,
    registerLockerModeComponent,
    setFeatureFlagForTest,
} from 'lwc';

import ElementAsComponent from 'x/elementAsComponent';
import NeedsLocker from 'x/needsLocker';

// See W-23887203
afterEach(() => {
    setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', false);
    setFeatureFlagForTest('DISABLE_STRICT_VALIDATION', false);
});

describe('returning element as component', () => {
    it('should fail by default', () => {
        expect(() => createElement('x-element-as-component', { is: ElementAsComponent })).toThrow(
            'LightningElement must be constructed.'
        );
    });

    it('should fail in Locker mode', () => {
        setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);
        expect(() => createElement('x-element-as-component', { is: ElementAsComponent })).toThrow(
            'Invalid component constructor, the class should extend LightningElement.'
        );
    });

    it('should fail with strict validation disabled', () => {
        setFeatureFlagForTest('DISABLE_STRICT_VALIDATION', true);
        expect(() => createElement('x-element-as-component', { is: ElementAsComponent })).toThrow(
            'LightningElement must be constructed.'
        );
    });

    it('should be allowed in Locker mode with strict validation disabled', () => {
        setFeatureFlagForTest('LEGACY_LOCKER_ENABLED', true);
        setFeatureFlagForTest('DISABLE_STRICT_VALIDATION', true);
        expect(() =>
            createElement('x-element-as-component', { is: ElementAsComponent })
        ).not.toThrow();
    });
});

describe('component-level Locker registration', () => {
    // Must run before `enableLockerMode()`, which can only be claimed once per page.
    it('should fail when Locker mode is not enabled', () => {
        expect(() => createElement('x-component', { is: NeedsLocker })).toThrow(
            'LightningElement must be constructed.'
        );
    });

    describe('when Locker mode is enabled', () => {
        let authority;
        beforeAll(() => {
            authority = enableLockerMode();
        });

        it('should fail for an unregistered component', () => {
            expect(() => createElement('x-component', { is: NeedsLocker })).toThrow(
                'LightningElement must be constructed.'
            );
        });

        it('should be allowed for a registered component', () => {
            registerLockerModeComponent(NeedsLocker, authority);
            expect(() => createElement('x-component', { is: NeedsLocker })).not.toThrow();
        });
    });
});
