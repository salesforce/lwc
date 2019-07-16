import { createElement } from 'lwc';
import ParentCmp from 'x/parent';

describe('disconnecting root vm', () => {
    // unhandledrejection is not supported in ie11 or firefox. In those browsers we will get false positives
    // but we will get the failure in chrome and safari.
    // We dont use the error handler because karma does not triggers it.
    if (!process.env.COMPAT) {
        it('should not throw an error when disconnecting an already disconnected child vm', function(done) {
            let unhandledErrorEvent = null;
            const unhandledErrorListener = event => {
                event.preventDefault();
                unhandledErrorEvent = event;
            };

            window.addEventListener('unhandledrejection', unhandledErrorListener);

            const elm = createElement('x-parent', { is: ParentCmp });
            elm.labels = ['label 1', 'label 2'];
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                elm.labels = [];
                document.body.removeChild(elm);

                setTimeout(() => {
                    expect(unhandledErrorEvent).toBe(null);
                    window.removeEventListener('unhandledrejection', unhandledErrorListener);
                    done();
                });
            });
        });
    }
});
