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
        import { createElement } from 'lwc';
        import Cmp from 'integration/${cmpName}';

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
                <script>
                    window.process = { env: { NODE_ENV: "development" } };
                </script>
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
                <script>
                    window.process = { env: { NODE_ENV: "development" } };
                </script>
                ${isCompat ? COMPAT : ''}
                ${SHADOW_POLYFILL}
                <script src="../../shared/engine.js"></script>
                <script src="../../shared/todo.js"></script>
                <script src="../../shared/wire.js"></script>
                <script src="./${cmpName}.js"></script>
            </body>
        </html>
    `;
};
