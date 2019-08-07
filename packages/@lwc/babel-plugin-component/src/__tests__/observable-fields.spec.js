/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('observable fields', () => {
    pluginTest(
        'should be added to the registerComponentCall when a field is not decorated with @api, @track or @wire',
        `
        import { api, wire, track, createElement } from 'lwc';
        export default class Test {
            state;
            @track foo;
            @track bar;

            @api label;

            record = {
                value: 'test'
            };

            @api
            someMethod() {}

            @wire(createElement) wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { createElement } from "lwc";

                class Test {
                  constructor() {
                    this.state = void 0;
                    this.foo = void 0;
                    this.bar = void 0;
                    this.label = void 0;
                    this.record = {
                      value: "test"
                    };
                    this.wiredProp = void 0;
                  }

                  someMethod() {}
                }

                _registerDecorators(Test, {
                  publicProps: {
                    label: {
                      config: 0
                    }
                  },
                  publicMethods: ["someMethod"],
                  wire: {
                    wiredProp: {
                      adapter: createElement
                    }
                  },
                  track: {
                    foo: 1,
                    bar: 1
                  },
                  fields: ["state", "record"]
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'should transform export default that is not a class',
        `
        const DATA_FROM_NETWORK = [
            {
                id: '1',
            },
            {
                id: '2',
            },
        ];

        export default DATA_FROM_NETWORK;
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                const DATA_FROM_NETWORK = [
                  {
                    id: "1"
                  },
                  {
                    id: "2"
                  }
                ];
                export default _registerComponent(DATA_FROM_NETWORK, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'should add observed fields in class expression',
        `
        import { api, wire, track, createElement } from 'lwc';
        
        const Test = class {
            state;
            @track foo;
            @track bar;
            
            @api label;
            
            record = {
                value: 'test'
            };
            
            @api
            someMethod() {}
            
            @wire(createElement) wiredProp;
        }
        
        const foo = Test;
        
        export default foo;
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { registerDecorators as _registerDecorators } from "lwc";
                import { createElement } from "lwc";
                
                const Test = _registerDecorators(
                  class {
                    constructor() {
                      this.state = void 0;
                      this.foo = void 0;
                      this.bar = void 0;
                      this.label = void 0;
                      this.record = {
                        value: "test"
                      };
                      this.wiredProp = void 0;
                    }
                
                    someMethod() {}
                  },
                  {
                    publicProps: {
                      label: {
                        config: 0
                      }
                    },
                    publicMethods: ["someMethod"],
                    wire: {
                      wiredProp: {
                        adapter: createElement
                      }
                    },
                    track: {
                      foo: 1,
                      bar: 1
                    },
                    fields: ["state", "record"]
                  }
                );
                
                const foo = Test;
                export default _registerComponent(foo, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );
});
