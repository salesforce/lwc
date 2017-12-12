/**
 * Playground wire adapters.
 */

import registerWireService from 'wire-service';
import serviceTodo from './todo';

/**
 * Registers the wire service with mocked Salesforce UI API data types.
 * @param {Object} engine The module engine.
 */
export default function registerMockedWireService(engine) {
    registerWireService(engine.register, () => {
        return {
            'todo': serviceTodo
        };
    });
}
