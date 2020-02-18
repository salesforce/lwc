(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && window.define.amd
        ? window.define(['exports'], factory)
        : factory((global.Todo = {}));
})(this, function(exports) {
    'use strict';

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

    const getTodo = Symbol('getTodo');
    const echoAdapter = Symbol('echoAdapter');

    exports.getTodo = getTodo;
    exports.echoAdapter = echoAdapter;
    exports.getObservable = getObservable;
    Object.defineProperty(exports, '__esModule', { value: true });
});
