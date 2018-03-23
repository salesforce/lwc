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
        import { registerWireService, register as registerAdapter, ValueChangedEvent } from 'wire-service';
        import { createElement, register } from 'engine';
        import Cmp from '${cmpName}';
        import { getTodo, getObservable } from 'todo';

        registerWireService(register);

        // Register the wire adapter for @wire(getTodo).
        registerAdapter(getTodo, function getTodoWireAdapter(wiredEventTarget) {
            let subscription;
            let config;
            const observer = {
                next: data => wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data, error: undefined })),
                error: error => wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error }))
            };
            wiredEventTarget.addEventListener('connect', () => {
                // Subscribe to stream.
                subscription = getObservable(config).subscribe(observer);
            });
            wiredEventTarget.addEventListener('disconnect', () => {
                subscription.unsubscribe();
            });
            wiredEventTarget.addEventListener('config', (newConfig) => {
                config = newConfig;
                if (subscription) {
                    subscription.unsubscribe();
                }
                subscription = getObservable(config).subscribe(observer);
            });
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
