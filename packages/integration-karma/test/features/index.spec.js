import { setFeatureFlagForTest } from 'lwc';

describe('feature flags', () => {
    let packages;

    const onHasDummyFlag = (event) => {
        if (event.detail.hasFlag) {
            packages.push(event.detail.package);
        }
    };

    beforeEach(() => {
        packages = [];
        window.addEventListener('has-dummy-flag', onHasDummyFlag);
    });

    afterEach(() => {
        window.removeEventListener('has-dummy-flag', onHasDummyFlag);
    });

    describe('flag enabled', () => {
        beforeEach(() => {
            setFeatureFlagForTest('DUMMY_TEST_FLAG', true);
        });

        afterEach(() => {
            setFeatureFlagForTest('DUMMY_TEST_FLAG', false);
        });

        it('works', () => {
            window.dispatchEvent(new CustomEvent('test-dummy-flag'));
            const expected = ['@lwc/engine-core', '@lwc/engine-dom'];
            if (!process.env.NATIVE_SHADOW) {
                expected.push('@lwc/synthetic-shadow');
            }
            expect(packages.sort()).toEqual(expected);
        });
    });

    describe('flag disabled', () => {
        it('works', () => {
            window.dispatchEvent(new CustomEvent('test-dummy-flag'));
            expect(packages.sort()).toEqual([]);
        });
    });
});
