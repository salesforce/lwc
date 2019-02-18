/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * @wire adapter for todo data.
 */
import { getSubject, getImmutableObservable } from './util';

function generateTodo(id, completed) {
    return {
        id,
        title: 'task ' + id,
        completed,
        nextId: id + 1,
    };
}

// the data
const TODO = [
    generateTodo(0, true),
    generateTodo(1, false),
    // intentionally skip 2
    generateTodo(3, true),
    generateTodo(4, true),
    // intentionally skip 5
    generateTodo(6, false),
    generateTodo(7, false),
].reduce((acc, value) => {
    acc[value.id] = value;
    return acc;
}, {});

/**
 * Gets an observable for a todo.
 * @param {Object} config Configuration.
 * @return {Observable|undefined} An observable for the todo, or undefined if the configuration is insufficient.
 */
export default function getObservable(config) {
    if (!config || !('id' in config)) {
        return undefined;
    }

    const todo = TODO[config.id];
    if (!todo) {
        const subject = getSubject(undefined, { message: 'Todo not found' });
        return subject.observable;
    }

    return getImmutableObservable(todo);
}
