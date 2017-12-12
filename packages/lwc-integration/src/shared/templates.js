exports.app = function (cmpName) {
    return `
        import { createElement } from 'engine';
        import Cmp from '${cmpName}';
        const element = createElement('${cmpName}', { is: Cmp });
        document.body.appendChild(element);
    `;
}

exports.todoApp = function (cmpName) {
    return `
        import registerWireService from 'wire-service';
        import { createElement, register } from 'engine';
        import Cmp from '${cmpName}';

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

        registerWireService(register, () => {
            return {
                'todo': serviceTodo
            };
        });

        const element = createElement('${cmpName}', { is: Cmp });
        document.body.appendChild(element);
    `;
}

const COMPAT = `
    <script src="/shared/compat.js"></script>
    <script>
        for (let h in EngineHelpers.babelHelpers) { window[h] = EngineHelpers.babelHelpers[h] }
    </script>
`;

exports.html = function (cmpName, isCompat) {

    return `
    <html>
        <head>
            <title>${cmpName}</title>
        </head>
        <body>
            ${isCompat ? COMPAT : ''}
            <script src="/shared/engine.js"></script>
            <script src="./${cmpName}.js"></script>
        </body>
    </html>
`;
}

exports.wireServiceHtml = function (cmpName, isCompat) {

    return `
    <html>
        <head>
            <title>${cmpName}</title>
        </head>
        <body>
            ${isCompat ? COMPAT : ''}
            <script src="/shared/engine.js"></script>
            <script src="/shared/wire-service.js"></script>
            <script src="./${cmpName}.js"></script>
        </body>
    </html>
`;
}
