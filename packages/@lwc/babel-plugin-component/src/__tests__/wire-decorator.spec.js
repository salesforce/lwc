/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

const wireMetadataParameterTest =
    (testName, {declaration = '', wireParameters = '', expectedStaticParameters = {}, expectedVariableParameters = {}}) => {
        pluginTest(
            testName,
            `
        import { wire } from 'lwc';
        import { getRecord } from 'recordDataService';
        ${declaration};
        export default class Test {
            @wire(getRecord, { ${wireParameters.join(',')} })
            recordData;
        }
    `,
            {
                output: {
                    metadata: {
                        decorators: [{
                            type: 'wire',
                            targets: [
                                {
                                    adapter: { name: 'getRecord', reference: 'recordDataService' },
                                    name: 'recordData',
                                    params: expectedVariableParameters,
                                    static: expectedStaticParameters ,
                                    type: 'property',
                                }
                            ],
                        }],
                        exports: [
                            {
                                type: 'ExportDefaultDeclaration',
                            }
                        ],
                    },
                },
            },
        );
};

describe('Transform property', () => {
    pluginTest('transforms wired field', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            wiredProp;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { getFoo } from "data-service";
                
                class Test {
                  constructor() {
                    this.wiredProp = void 0;
                  }
                }
                
                _registerDecorators(Test, {
                  wire: {
                    wiredProp: {
                      adapter: getFoo,
                      params: {
                        key1: "prop1"
                      },
                      static: {
                        key2: ["fixed", "array"]
                      }
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`
        }
    });

    pluginTest('transforms multiple dynamic params', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop", key2: "$prop", key3: "fixed", key4: ["fixed", 'array']})
            wiredProp;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { getFoo } from "data-service";
                
                class Test {
                  constructor() {
                    this.wiredProp = void 0;
                  }
                }
                
                _registerDecorators(Test, {
                  wire: {
                    wiredProp: {
                      adapter: getFoo,
                      params: {
                        key1: "prop",
                        key2: "prop"
                      },
                      static: {
                        key3: "fixed",
                        key4: ["fixed", "array"]
                      }
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`
        }
    });

    pluginTest('decorator expects wire adapter as first parameter', `
        import { wire } from 'lwc';
        export default class Test {
            @wire() wiredProp;
        }
    `, {
        error: {
            message: '@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).',
            loc: {
                line: 2,
                column: 4,
            },
        }
    });

    pluginTest('decorator accepts a function identifier as first parameter', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, {}) wiredProp;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { getFoo } from "data-service";
                
                class Test {
                  constructor() {
                    this.wiredProp = void 0;
                  }
                }
                
                _registerDecorators(Test, {
                  wire: {
                    wiredProp: {
                      adapter: getFoo,
                      params: {},
                      static: {}
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('decorator accepts a default import function identifier as first parameter', `
        import { wire } from 'lwc';
        import getFoo from 'foo';
        export default class Test {
            @wire(getFoo, {}) wiredProp;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import getFoo from "foo";
                
                class Test {
                  constructor() {
                    this.wiredProp = void 0;
                  }
                }
                
                _registerDecorators(Test, {
                  wire: {
                    wiredProp: {
                      adapter: getFoo,
                      params: {},
                      static: {}
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`
        }
    });

    pluginTest('decorator accepts an optional config object as second parameter', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo) wiredProp;
        }
    `, {
            output: {
                code: `
                    import { registerDecorators as _registerDecorators } from "lwc";
                    import _tmpl from "./test.html";
                    import { registerComponent as _registerComponent } from "lwc";
                    import { getFoo } from "data-service";
                    
                    class Test {
                      constructor() {
                        this.wiredProp = void 0;
                      }
                    }
                    
                    _registerDecorators(Test, {
                      wire: {
                        wiredProp: {
                          adapter: getFoo
                        }
                      }
                    });
                    
                    export default _registerComponent(Test, {
                      tmpl: _tmpl
                    });
`
            }
        });

    pluginTest('decorator expects an imported identifier as first parameter', `
        import { wire } from 'lwc';
        const ID = "adapterId"
        export default class Test {
            @wire(ID, {}) wiredProp;
        }
    `, {
        error: {
            message: '@wire expects a function identifier to be imported as first parameter.',
            loc: {
                line: 4,
                column: 6,
            },
        }
    });

    pluginTest('decorator expects an object as second parameter', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, '$prop', ['fixed', 'array']) wiredProp
        }
    `, {
        error: {
            message: '@wire expects a configuration object expression as second parameter.',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when wired property is combined with @api', `
        import { api, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @api
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            wiredPropWithApi;
        }
    `, {
        error: {
            message: '@wire method or property cannot be used with @api',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when wired property is combined with @track', `
        import { track, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @track
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            wiredWithTrack
        }
    `, {
        error: {
            message: '@wire method or property cannot be used with @track',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when using 2 wired decorators', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            multipleWire
        }
    `, {
        error: {
            message: 'Method or property can only have 1 @wire decorator',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('should not throw when using 2 separate wired decorators', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wired1;
            @wire(getFoo, { key1: "$prop1", key2: ["array"]})
            wired2;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { getFoo } from "data-service";
                
                class Test {
                  constructor() {
                    this.wired1 = void 0;
                    this.wired2 = void 0;
                  }
                }
                
                _registerDecorators(Test, {
                  wire: {
                    wired1: {
                      adapter: getFoo,
                      params: {
                        key1: "prop1"
                      },
                      static: {
                        key2: ["fixed"]
                      }
                    },
                    wired2: {
                      adapter: getFoo,
                      params: {
                        key1: "prop1"
                      },
                      static: {
                        key2: ["array"]
                      }
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });
});

describe('Transform method', () => {
    pluginTest('transforms wired method', `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wiredMethod() {}
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { getFoo } from "data-service";
                
                class Test {
                  wiredMethod() {}
                }
                
                _registerDecorators(Test, {
                  wire: {
                    wiredMethod: {
                      adapter: getFoo,
                      params: {
                        key1: "prop1"
                      },
                      static: {
                        key2: ["fixed"]
                      },
                      method: 1
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('throws when wired method is combined with @api', `
        import { api, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @api
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wiredWithApi() {}
        }
    `, {
        error: {
            message: '@wire method or property cannot be used with @api',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });
});

describe('Metadata', () => {
    pluginTest(
        'gather wire metadata',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wiredProp;

            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wiredMethod() {}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [{
                        type: 'wire',
                        targets: [{
                            adapter: { name: 'getFoo', reference: 'data-service' },
                            name: 'wiredProp',
                            params: { key1: 'prop1' },
                            static: { key2: { value: ['fixed'], type: 'array' } },
                            type: 'property',
                        },
                        {
                            adapter: { name: 'getFoo', reference: 'data-service' },
                            name: 'wiredMethod',
                            params: { key1: 'prop1' },
                            static: { key2: { value: ['fixed'], type: 'array' } },
                            type: 'method',
                        }],
                    }],
                    exports: [
                        {
                            type: 'ExportDefaultDeclaration',
                        }
                    ],
                },
            },
        },
    );

    wireMetadataParameterTest('when constant initialised to a string-literal should extract the value',
        { declaration: `const stringConstant = '123';`,
            wireParameters: ['userId: stringConstant'],
            expectedStaticParameters: { userId: { value: '123', type: 'string'} } });

    wireMetadataParameterTest('when constant initialised to a number-literal should extract the value',
        { declaration: `const numberConstant = 100;`,
            wireParameters: ['size: numberConstant'],
            expectedStaticParameters: { size: { value: 100, type: 'number'} } });

    wireMetadataParameterTest('when constant initialised to a boolean-literal should extract the value',
        { declaration: `const booleanConstant = true;`,
            wireParameters: ['isRegistered: booleanConstant'],
            expectedStaticParameters: { isRegistered: { value: true, type: 'boolean'} } });

    wireMetadataParameterTest('when constant initialised as a reference to another should mark as unresolved',
        { declaration: `const stringConstant = '123'; const referenceConstant = stringConstant;`,
            wireParameters: ['recordId: referenceConstant'],
            expectedStaticParameters: { recordId: { type: 'unresolved', value: 'identifier' } } });

    wireMetadataParameterTest('when importing a default export from a module should reference the name of the module',
        { declaration: `import id from '@salesforce/user/Id';`,
            wireParameters: ['recordId: id'],
            expectedStaticParameters: { recordId: { value: '@salesforce/user/Id', type: 'module' } } });

    wireMetadataParameterTest('when parameter reference missing should mark as unresolved',
        { wireParameters: ['recordId: id'],
            expectedStaticParameters: { recordId: { type: 'unresolved', value: 'identifier'} } });

    wireMetadataParameterTest('when importing named export with "as" from a module should reference the name of the module',
        { declaration: `import { id as currentUserId } from '@salesforce/user/Id';`,
            wireParameters: ['recordId: currentUserId'],
            expectedStaticParameters: { recordId: { value: '@salesforce/user/Id', type: 'module' } } });

    wireMetadataParameterTest('when importing a named export from a module should reference the name of the module',
        { declaration: `import { id } from '@salesforce/user/Id';`,
            wireParameters: ['recordId: id'],
            expectedStaticParameters: { recordId: { value: '@salesforce/user/Id', type: 'module' } } });

    wireMetadataParameterTest('when importing from a relative module should reference the name of the module',
        { declaration: `import id from './someReference.js';`,
            wireParameters: ['recordId: id'],
            expectedStaticParameters: { recordId: { value: './someReference.js', type: 'module' } } });

    wireMetadataParameterTest('when referencing a "let" variable should mark as unresolved',
        { declaration: `let userId = '123';`,
            wireParameters: ['recordId: userId'],
            expectedStaticParameters: { recordId: { type: 'unresolved', value: 'identifier'} } });

    wireMetadataParameterTest('when referencing a member expression, should mark as unresolved',
        { declaration: `const data = {userId: '123'};`,
            wireParameters: ['recordId: data.userId'],
            expectedStaticParameters: { recordId: { type: 'unresolved', value: 'member_expression' } } });

    wireMetadataParameterTest('when an inline string-literal initialization is used, should use value',
        { wireParameters: ['recordId: "123"'],
            expectedStaticParameters: { recordId: { value: '123', type: 'string' } } });

    wireMetadataParameterTest('when an inline numeric-literal initialization is used, should use value',
        { wireParameters: ['size: 100'],
            expectedStaticParameters: { size: { value: 100, type: 'number' } } });

    wireMetadataParameterTest('when an inline float-literal initialization is used, should use value',
        { wireParameters: ['underPrice: 50.50'],
            expectedStaticParameters: { underPrice: { value: 50.50, type: 'number' } } });

    wireMetadataParameterTest('when an inline boolean-literal initialization is used, should use value',
        { wireParameters: ['isRegistered: true'],
            expectedStaticParameters: { isRegistered: { value: true, type: 'boolean' } } });

    wireMetadataParameterTest('when $foo parameters are used, should use name of the parameter',
        { wireParameters: ['recordId: "$userId"'],
            expectedVariableParameters: { recordId: 'userId' } });

    wireMetadataParameterTest('when $foo parameters with dots are used, should use name of the parameter',
        { wireParameters: ['recordId: "$userRecord.Id"'],
            expectedVariableParameters: { recordId: 'userRecord.Id' } });

    wireMetadataParameterTest('when inline array with a non-string literal is used, should mark as unresolved',
        { declaration: `const bar = '123';`,
            wireParameters: ['fields: ["foo", bar]'],
            expectedStaticParameters: { fields: {type: 'unresolved', value: 'array_expression'} } });

    wireMetadataParameterTest('when inline array with literals is used, should have the array',
        {wireParameters: ['data: ["foo", 123, false]'],
            expectedStaticParameters: { data: {type: 'array', value: ['foo', 123, false]} } });
});
