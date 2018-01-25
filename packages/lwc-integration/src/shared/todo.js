(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.Todo = {})));
}(this, (function (exports) {
    'use strict';

function getSubject(initialValue, initialError) {
    let observer;

    function next(value) {
        observer.next(value);
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
            if (initialValue) {
                next(initialValue);
            }
            if (initialError) {
                error(initialError);
            }
            return {
                unsubscribe: () => { }
            };
        }
    };

    return {
        next,
        error,
        complete,
        observable
    };
}

function generateTodo(id, completed) {
    return {
        id,
        title: 'task ' + id,
        completed
    };
}

const TODO = [
    generateTodo(0, true),
    generateTodo(1, false),
    // intentionally skip 2
    generateTodo(3, true),
    generateTodo(4, true),
    // intentionally skip 5
    generateTodo(6, false),
    generateTodo(7, false)
].reduce((acc, value) => {
    acc[value.id] = value;
    return acc;
}, {});


function serviceTodo(config) {
    if (!('id' in config)) {
        return undefined;
    }

    const todo = TODO[config.id];
    if (!todo) {
        const subject = getSubject(undefined, { message: 'Todo not found' });
        return subject.observable;
    }

    return getSubject(todo).observable;
}

    exports.serviceTodo = serviceTodo;
    Object.defineProperty(exports, '__esModule', { value: true });
})));