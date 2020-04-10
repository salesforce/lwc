import { register, ValueChangedEvent } from 'wire-service';

function getSubject(initialValue, initialError) {
    var observer;

    function next(value) {
        observer.next(value);
    }

    function error(err) {
        observer.error(err);
    }

    function complete() {
        observer.complete();
    }

    var observable = {
        subscribe: function(obs) {
            observer = obs;
            if (initialValue) {
                next(initialValue);
            }
            if (initialError) {
                error(initialError);
            }
            return {
                unsubscribe: function() {},
            };
        },
    };

    return {
        next: next,
        error: error,
        complete: complete,
        observable: observable,
    };
}

function generateTodo(id, completed) {
    return {
        id: id,
        title: 'task ' + id,
        completed: completed,
    };
}

var TODO = [
    generateTodo(0, true),
    generateTodo(1, false),
    // intentionally skip 2
    generateTodo(3, true),
    generateTodo(4, true),
    // intentionally skip 5
    generateTodo(6, false),
    generateTodo(7, false),
].reduce(function(acc, value) {
    acc[value.id] = value;
    return acc;
}, {});

function getObservable(config) {
    if (!config || !('id' in config)) {
        return undefined;
    }

    var todo = TODO[config.id];
    if (!todo) {
        var subject = getSubject(undefined, { message: 'Todo not found' });
        return subject.observable;
    }

    return getSubject(todo).observable;
}

const getTodo = function() {};

register(getTodo, function getTodoWireAdapter(wiredEventTarget) {
    var subscription;
    var config;
    wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error: undefined }));
    var observer = {
        next: function(data) {
            wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: data, error: undefined }));
        },
        error: function(error) {
            wiredEventTarget.dispatchEvent(
                new ValueChangedEvent({ data: undefined, error: error })
            );
        },
    };
    wiredEventTarget.addEventListener('connect', function() {
        var observable = getObservable(config);
        if (observable) {
            subscription = observable.subscribe(observer);
        }
    });
    wiredEventTarget.addEventListener('disconnect', function() {
        subscription.unsubscribe();
    });
    wiredEventTarget.addEventListener('config', function(newConfig) {
        config = newConfig;
        if (subscription) {
            subscription.unsubscribe();
            subscription = undefined;
        }
        var observable = getObservable(config);
        if (observable) {
            subscription = observable.subscribe(observer);
        }
    });
});

export { getTodo };
export { getObservable };
