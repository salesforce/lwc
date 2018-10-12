const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('export metadata', () => {
    describe('ExportNamedDeclaration', () => {
        pluginTest(
            'export references',
            `
                export { namedExportOne, namedExportTwo };
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'namedExportOne'
                            },
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'namedExportTwo',
                            },
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export references as',
            `
                export { variable1 as exportedAsOne, variable2 as exportedAsTwo };
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'exportedAsOne'
                            },
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'exportedAsTwo',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export let, var, const declaration with assigned value',
            `
                export const nameConst = "constValue";
                export let nameLet = "letValue";
                export var nameVar = "varValue";
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'nameConst'
                            },
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'nameLet',
                            },
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'nameVar',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export named function',
            `
                export function FunctionName(){}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: "FunctionName",
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export class',
            `
                export class ClassName {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'ClassName',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export references from an import',
            `
                export { namedExportOne, namedExportTwo } from 'bar';
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'namedExportOne'
                            },
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'namedExportTwo',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export reference "as" from an import',
            `
                export { name1 as exportedAsOne, name2 as exportedAsTwo } from 'bar';
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'exportedAsOne'
                            },
                            {
                                type: 'ExportNamedDeclaration',
                                value: 'exportedAsTwo',
                            }
                        ]
                    }
                }
            }
        );
    });

    describe('ExportDefaultDeclaration', () => {
        pluginTest(
            'export class',
            `
                export default 1 + 2;
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportDefaultDeclaration',
                            }
                        ]
                    }
                }
            }
        );
    });

    describe('ExportAllDeclaration', () => {
        pluginTest(
            'export all from the import',
            `
                export * from 'foo';
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        exports: [
                            {
                                type: 'ExportAllDeclaration',
                            }
                        ]
                    }
                }
            }
        );
    });
});
