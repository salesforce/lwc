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
        import { serviceTodo } from 'todo';
        import registerWireService from 'wire-service';
        import { createElement, register } from 'engine';
        import Cmp from '${cmpName}';

        registerWireService(register, () => {
            return {
                serviceTodo
            };
        });

        const element = createElement('${cmpName}', { is: Cmp });
        document.body.appendChild(element);
    `;
}

const COMPAT = ``;

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
            <script src="/shared/engine.js"></script>
            <script src="/shared/todo.js"></script>
            <script src="/shared/wire-service.js"></script>
            <script src="./${cmpName}.js"></script>
        </body>
    </html>
`;
}
