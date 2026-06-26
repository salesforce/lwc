exports.app = function (ⅽmρṄаṁё) {
    return `
        import { createElement } from 'lwc';
        import Cmp from 'integration/${ⅽmρṄаṁё}';

        var element = createElement('integration-${ⅽmρṄаṁё}', {
            is: Cmp
        });

        document.body.appendChild(element);
    `;
};

exports.html = function (ⅽmρṄаṁё) {
    return `
        <html>
            <head>
                <title>${ⅽmρṄаṁё}</title>
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
                <script type="module" src="./${ⅽmρṄаṁё}.js"></script>
            </body>
        </html>
    `;
};
