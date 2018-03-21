exports.app = function (cmpName) {
    return `
        import { createElement } from 'engine';
        import Cmp from '${cmpName}';
        var element = createElement('${cmpName}', { is: Cmp });
        document.body.appendChild(element);
    `;
}

exports.todoApp = function (cmpName) {
    return `
        import { registerWireService, register as registerAdapter } from 'wire-service';
        import { createElement, register } from 'engine';
        import Cmp from '${cmpName}';
        import { getTodo, getObservable } from 'todo';

        registerWireService(register);

        // Register the wire adapter for @wire(getTodo).
        registerAdapter(getTodo, function getTodoWireAdapter(targetSetter) {
            let subscription;
            let config;
            return {
                updatedCallback: (newConfig) => {
                    config = newConfig;
                    subscription = getObservable(config).subscribe({
                        next: data => targetSetter({ data, error: undefined }),
                        error: error => targetSetter({ data: undefined, error })
                    });
                },

                connectedCallback: () => {
                    // Subscribe to stream.
                    subscription = getObservable(config).subscribe({
                        next: data => targetSetter({ data, error: undefined }),
                        error: error => targetSetter({ data: undefined, error })
                    });
                },

                disconnectedCallback: () => {
                    subscription.unsubscribe();
                }
            };
        });

        const element = createElement('${cmpName}', { is: Cmp });
        document.body.appendChild(element);
    `;
}

const COMPAT = `
    <script src="../../shared/downgrade.js"></script>
    <script src="../../shared/polyfills.js"></script>
`;

exports.html = function (cmpName, isCompat) {

    return `
    <html>
        <head>
            <title>${cmpName}</title>
        </head>
        <body>
            ${isCompat ? COMPAT : ''}
            <script src="../../shared/engine.js"></script>
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
            <script src="../../shared/engine.js"></script>
            <script src="../../shared/todo.js"></script>
            <script src="../../shared/wire.js"></script>
            <script src="./${cmpName}.js"></script>
        </body>
    </html>
`;
}
