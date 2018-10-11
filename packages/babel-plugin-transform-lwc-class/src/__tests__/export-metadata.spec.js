const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('export metadata', () => {
    describe.only('ExportNamedDeclaration', () => {
        pluginTest.only(
            'export references',
            `
                import { LightningElement } from 'lwc';
                export { namedExportOne, namedExportTwo };
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 3, column: 0 },
                            end: { line: 3, column: 62 }
                        },
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
            'export references as',
            `
                import { LightningElement } from 'lwc';
                export { variable1 as exportedAsOne, variable2 as exportedAsTwo };
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
                                value: 'exportedAsOne'
                            },
                            {
                                type: 'named',
                                value: 'exportedAsTwo',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export let, var, const declaration without value',
            `
                import { LightningElement } from 'lwc';
                export const nameConst;
                export let nameLet;
                export var nameVar;
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
                                value: 'nameConst'
                            },
                            {
                                type: 'named',
                                value: 'nameLet',
                            },
                            {
                                type: 'named',
                                value: 'nameVar',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export let, var, const declaration with assigned value',
            `
                import { LightningElement } from 'lwc';
                export const nameConst = "constValue";
                export let nameLet = "letValue";
                export var nameVar = "varValue";
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
                                value: 'nameConst'
                            },
                            {
                                type: 'named',
                                value: 'nameLet',
                            },
                            {
                                type: 'named',
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
                import { LightningElement } from 'lwc';
                export function FunctionName(){}
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
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
                import { LightningElement } from 'lwc';
                export function ClassName {}
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
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
                import { LightningElement } from 'lwc';
                export { namedExportOne, namedExportTwo } from 'bar';
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
                                value: 'namedExportOne'
                            },
                            {
                                type: 'named',
                                value: 'namedExportTwo',
                            }
                        ]
                    }
                }
            }
        );

        pluginTest(
            'export reference as from an import',
            `
                import { LightningElement } from 'lwc';
                export { name1 as exportedAsOne, name2 as exportedAsTwo } from 'bar';
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'named',
                                value: 'exportedAsOne'
                            },
                            {
                                type: 'named',
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
                import { LightningElement } from 'lwc';
                export default 1 + 2;
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'default',
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
                import { LightningElement } from 'lwc';
                export * from 'foo';
                export default class ExportedClass extends LightningElement {}
            `,
            {
                output: {
                    metadata: {
                        decorators: [],
                        classMembers: [],
                        declarationLoc: {
                            start: { line: 6, column: 0 },
                            end: { line: 7, column: 1 }
                        },
                        exports: [
                            {
                                type: 'all',
                            }
                        ]
                    }
                }
            }
        );
    });
});
