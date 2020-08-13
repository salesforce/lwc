/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('observed fields', () => {
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
                import {  registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
                import _tmpl from "./test.html";

                class Test {
                  state;
                  foo;
                  bar;
                  label;
                  record = {
                    value: "test"
                  };

                  someMethod() {}

                  wiredProp;
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
                      adapter: createElement,
                      config: function($cmp) {
                        return {};
                      }
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
        'should not process reserved words as field when decorated with @api, @track or @wire',
        `
        import { api, wire, track, createElement } from 'lwc';
        export default class Test {
            interface;
            @api static;
            @track for;
            @wire(createElement) function;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
                import _tmpl from "./test.html";
                
                class Test {
                  interface;
                  static;
                  for;
                  function;
                }
                
                _registerDecorators(Test, {
                  publicProps: {
                    static: {
                      config: 0
                    }
                  },
                  wire: {
                    function: {
                      adapter: createElement,
                      config: function($cmp) {
                         return {};
                      }
                    }
                  },
                  track: {
                    for: 1
                  },
                  fields: ["interface"]
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'should not observe changes in computed fields',
        `
        import { api, wire, track, createElement } from 'lwc';
        const PREFIX = 'prefix';
        export default class Test {
            interface;
            ['a'] = 0;
            [\`\${PREFIX}Field\`] = 'prefixed field';
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
                import _tmpl from "./test.html";
                const PREFIX = "prefix";
                
                class Test {
                  interface;
                  ["a"] = 0;
                  [\`\${PREFIX}Field\`] = "prefixed field";
                }
                
                _registerDecorators(Test, {
                  fields: ["interface"]
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'should not observe changes in a static fields',
        `
        import { api, wire, track, createElement } from 'lwc';
        export default class Test {
            interface;
            static foo = 3;
            static baz = 1;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
                import _tmpl from "./test.html";
                
                class Test {
                  interface;
                  static foo = 3;
                  static baz = 1;
                }
                
                
                _registerDecorators(Test, {
                  fields: ["interface"]
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
                import { registerComponent as _registerComponent, registerDecorators as _registerDecorators, createElement } from "lwc";
                
                const Test = _registerDecorators(
                  class {
                    state;
                    foo;
                    bar;
                    label;
                    record = {
                        value: "test"
                      };
                
                    someMethod() {}

                    wiredProp;
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
                        adapter: createElement,
                        config: function($cmp) {
                          return {};
                        }
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
