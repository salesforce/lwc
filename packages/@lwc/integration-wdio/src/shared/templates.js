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

exports.html = function (cmpName) {
    return `
        <html>
            <head>
                <title>${cmpName}</title>
            </head>
            <body>
                <script type="module">
                    window.process = { env: { NODE_ENV: "development" } };
                </script>
                <script type="module" src="../../shared/shadow.js"></script>
                <script type="module">
                  import * as LWC from '../../shared/engine.js';
                  window.LWC = LWC;
                </script>
                <script type="module" src="./${cmpName}.js"></script>
            </body>
        </html>
    `;
};
