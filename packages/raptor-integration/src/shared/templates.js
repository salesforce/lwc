exports.app = function (cmpName) {
    return `
        import { createElement } from 'engine';
        import Cmp from '${cmpName}';

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
