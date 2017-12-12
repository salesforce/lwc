import { register } from 'engine';
import registerWireService from 'wire-service';

function createMockWireService() {
    let observer;

    function next(d) {
        observer.next(d);
    }

    function error(err) {
        observer.error(err);
    }

    function complete() {
        observer.complete();
    }

    const observable = {
        subscribe: (obs) => {
            observer = obs;
        }
    };

    const init = jest.fn().mockReturnValue(observable);
    function lastInitializedArgs() {
        return init.mock.calls[init.mock.calls.length - 1];
    }

    return {
        init,
        next,
        error,
        complete,
        lastInitializedArgs
    };
}

export function registerMockWireAdapters(...names) {
    const serviceMocks = names.reduce((acc, key) => {
        acc[key] = createMockWireService();
        return acc;
    }, {});

    registerWireService(register, () => {
        return Object.getOwnPropertyNames(serviceMocks).reduce((acc, key) => {
            acc[key] = serviceMocks[key].init;

            return acc;
        }, {});
    });

    return serviceMocks;
}
