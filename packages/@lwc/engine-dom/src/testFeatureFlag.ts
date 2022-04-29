import features from '@lwc/features';

if (process.env.NODE_ENV !== 'production') {
    window.addEventListener('test-dummy-flag', () => {
        let hasFlag = false;
        if (features.DUMMY_TEST_FLAG) {
            hasFlag = true;
        }

        window.dispatchEvent(
            new CustomEvent('has-dummy-flag', {
                detail: {
                    package: '@lwc/engine-dom',
                    hasFlag,
                },
            })
        );
    });
}
