exports.app = function(cmpName) {
    return `
        import { createElement } from 'lwc';
        import Cmp from 'integration/${cmpName}';

        var element = createElement('integration-${cmpName}', {
            is: Cmp
        });

        document.body.appendChild(element);
    `;
};

exports.todoApp = function(cmpName) {
    return `
        import { registerWireService, register as registerAdapter, ValueChangedEvent } from 'wire-service';
        import { createElement, register } from 'lwc';
        import Cmp from 'integration/${cmpName}';
        import { getTodo, getObservable } from 'todo';

        registerWireService(register);

        // Register the wire adapter for @wire(getTodo).
        registerAdapter(getTodo, function getTodoWireAdapter(wiredEventTarget) {
            var subscription;
            var config;
            wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error: undefined }));
            var observer = {
                next: function(data) { wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: data, error: undefined })); },
                error: function(error) { wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error: error })); }
            };
            wiredEventTarget.addEventListener('connect', function() {
                var observable = getObservable(config);
                if (observable) {
                    subscription = observable.subscribe(observer);
                    return;
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
                    return;
                }
            });
        });

        var element = createElement('integration-${cmpName}', { is: Cmp });
        document.body.appendChild(element);
    `;
};

const COMPAT = `
    <script src="../../shared/downgrade.js"></script>
    <script src="../../shared/polyfills.js"></script>
`;
const SHADOW_POLYFILL = `
    <script>
    var fallback = location.search.indexOf('nativeShadow=true') === -1;
    if (fallback) {
        /** shadow dom polyfill is needed, this hack evaluate it before engine */
        document.write('<s' + 'cript src="../../shared/shadow.js"></scr' + 'ipt>');
    }
    </script>
`;

exports.html = function(cmpName, isCompat) {
    return `
        <html>
            <head>
                <title>${cmpName}</title>
            </head>
            <body>
                ${isCompat ? COMPAT : ''}
                ${SHADOW_POLYFILL}
                <script src="../../shared/engine.js"></script>
                <script src="./${cmpName}.js"></script>
            </body>
        </html>
    `;
};

exports.wireServiceHtml = function(cmpName, isCompat) {
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
};
