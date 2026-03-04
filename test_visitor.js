const { transformSync } = require('./packages/@lwc/swc-plugin-component/node_modules/@swc/core');
const { Visitor } = require('./packages/@lwc/swc-plugin-component/node_modules/@swc/core/Visitor');

class TestVisitor extends Visitor {
    visitProgram(program) {
        this._program = program;
        const dummy = { start: 0, end: 0, ctxt: 0 };
        const makeId = (v) => ({
            type: 'Identifier',
            value: v,
            optional: false,
            span: dummy,
            ctxt: 0,
        });

        const newImport = {
            type: 'ImportDeclaration',
            span: dummy,
            specifiers: [
                {
                    type: 'ImportDefaultSpecifier',
                    span: dummy,
                    local: makeId('_tmpl'),
                },
            ],
            source: {
                type: 'StringLiteral',
                value: './foo.html',
                span: dummy,
                raw: '"./foo.html"',
            },
            typeOnly: false,
            with: null,
            phase: 'evaluation',
        };
        program.body.unshift(newImport);
        return super.visitProgram(program);
    }

    visitExportDefaultDeclaration(node) {
        const visited = super.visitExportDefaultDeclaration(node);
        const dummy = { start: 0, end: 0, ctxt: 0 };
        const makeId = (v) => ({
            type: 'Identifier',
            value: v,
            optional: false,
            span: dummy,
            ctxt: 0,
        });

        const varDecl = {
            type: 'VariableDeclaration',
            kind: 'const',
            declare: false,
            declarations: [
                {
                    type: 'VariableDeclarator',
                    span: dummy,
                    id: makeId('__lwc_component'),
                    init: {
                        type: 'CallExpression',
                        callee: makeId('registerComponent'),
                        arguments: [{ expression: visited.decl }],
                        typeArguments: null,
                        span: dummy,
                        ctxt: 0,
                    },
                    definite: false,
                },
            ],
            span: dummy,
            ctxt: 0,
        };

        const newExport = {
            type: 'ExportDefaultExpression',
            expression: makeId('__lwc_component'),
            span: node.span,
        };

        const body = this._program.body;
        const idx = body.indexOf(visited);
        if (idx !== -1) {
            body.splice(idx, 1, varDecl, newExport);
            return newExport;
        }
        return visited;
    }
}

const code =
    'import { LightningElement } from "lwc"; export default class Foo extends LightningElement {}';
try {
    const result = transformSync(code, {
        filename: 'foo.js',
        jsc: {
            parser: { syntax: 'ecmascript', decorators: true },
            transform: { legacyDecorator: true, useDefineForClassFields: false },
            target: 'es2022',
            preserveAllComments: true,
        },
        isModule: true,
        module: { type: 'es6' },
        plugin: (program) => {
            const visitor = new TestVisitor();
            return visitor.visitProgram(program);
        },
    });
    console.log('Success:', result.code.slice(0, 300));
} catch (e) {
    console.error('Error:', e.message.slice(0, 300));
}
