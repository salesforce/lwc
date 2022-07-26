exports.app = function (cmpName) {
    return `
        import { createElement } from 'lwc';
        import Cmp from 'integration/${cmpName}';

        var element = createElement('integration-${cmpName}', {
            is: Cmp
        });

        document.body.appendChild(element);
    `;
};

const SHADOW_POLYFILL = `
    <script>
    var fallback = location.search.indexOf('nativeShadow=true') === -1;
    if (fallback) {
        /** shadow dom polyfill is needed, this hack evaluate it before engine */
        document.write('<s' + 'cript src="../../shared/shadow.js"></scr' + 'ipt>');
    }
    </script>
`;

exports.html = function (cmpName) {
    return `
        <html>
            <head>
                <title>${cmpName}</title>
            </head>
            <body>
                <script>
                    window.process = { env: { NODE_ENV: "development" } };
                </script>
                ${SHADOW_POLYFILL}
                <script src="../../shared/engine.js"></script>
                <script src="./${cmpName}.js"></script>
            </body>
        </html>
    `;
};
