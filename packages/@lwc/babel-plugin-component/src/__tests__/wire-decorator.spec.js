/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('Transform property', () => {
    pluginTest(
        'transforms wired field',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: ["key1"],
                      config: function($cmp) {
                        return {
                          key2: ["fixed", "array"],
                          key1: $cmp.prop1
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
            },
        }
    );

    pluginTest(
        'transforms named imports from static imports',
        `
        import { wire } from 'lwc';
        import importedValue from "ns/module";
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: importedValue })
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
                import importedValue from "ns/module";
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
                      dynamic: [],
                      config: function($cmp) {
                        return {
                          key1: importedValue
                        };
                      }
                    }
                  }
                });
                
                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
            },
        }
    );

    pluginTest(
        'transforms parameters with 2 levels deep (foo.bar)',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1.prop2", key2: ["fixed", 'array'], key3: "$p1.p2" })
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: ["key1","key3"],
                      config: function($cmp) {
                        let v1 = $cmp.prop1;
                        let v2 = $cmp.p1;
                        return {
                          key2: ["fixed", "array"],
                          key1: v1 != null ? v1.prop2 : undefined,
                          key3: v2 != null ? v2.p2 : undefined
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
            },
        }
    );

    pluginTest(
        'transforms parameters with multiple levels deep',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1.prop2.prop3.prop4", key2: ["fixed", 'array']})
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: ["key1"],
                      config: function($cmp) {
                        let v1 = $cmp.prop1;
                        return {
                          key2: ["fixed", "array"],
                          key1: 
                            v1 != null &&
                            (v1 = v1.prop2) != null &&
                            (v1 = v1.prop3) != null
                              ? v1.prop4
                              : undefined
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
            },
        }
    );

    pluginTest(
        'transforms multiple dynamic params',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop", key2: "$prop", key3: "fixed", key4: ["fixed", 'array']})
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: ["key1","key2"],
                      config: function($cmp) {
                        return {
                          key3: "fixed",
                          key4: ["fixed", "array"],
                          key1: $cmp.prop,
                          key2: $cmp.prop
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
            },
        }
    );

    pluginTest(
        'transforms object properties as string literal',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { "key 1": "$prop", "key 2": ["fixed", 'array']})
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: ["key 1"],
                      config: function($cmp) {
                        return {
                          "key 2": ["fixed", "array"],
                          "key 1": $cmp.prop,
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
            },
        }
    );

    pluginTest(
        'decorator expects wire adapter to be imported',
        `
        import { LightningElement, wire } from 'lwc';
        export default class PublicMethods extends LightningElement {
          @wire(adapter) foo;
        }
        `,
        {
            error: {
                message: 'Failed to resolve @wire adapter "adapter". Ensure it is imported',
                loc: {
                    line: 3,
                    column: 6,
                    length: 7,
                    start: 114,
                },
            },
        }
    );
    pluginTest(
        'decorator expects wire adapter as first parameter',
        `
        import { wire } from 'lwc';
        export default class Test {
            @wire() wiredProp;
        }
    `,
        {
            error: {
                message:
                    '@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).',
                loc: {
                    line: 3,
                    column: 0,
                    length: 7,
                    start: 56,
                },
            },
        }
    );

    pluginTest(
        'decorator accepts a function identifier as first parameter',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, {}) wiredProp;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: [],
                      config: function($cmp) {
                        return {};
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'decorator accepts a member expression',
        `
      import { wire } from 'lwc';
      import { Foo } from 'data-service';
      export default class Test {
          @wire(Foo.Bar, {}) wiredProp;
      }
  `,
        {
            output: {
                code: `
              import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
              import _tmpl from "./test.html";
              import { Foo } from "data-service";

              class Test {
                constructor() {
                  this.wiredProp = void 0;
                }
              }

              _registerDecorators(Test, {
                wire: {
                  wiredProp: {
                    adapter: Foo.Bar,
                    dynamic: [],
                    config: function($cmp) {
                      return {};
                    }
                  }
                }
              });

              export default _registerComponent(Test, {
                tmpl: _tmpl
              });
              `,
            },
        }
    );

    pluginTest(
        'decorator allows wire provider member expression',
        `
    import { wire } from 'lwc';
    import { Foo } from 'data-service';
    export default class Test {
        @wire(Foo.Bar, {}) wiredProp;
    }
`,
        {
            output: {
                code: `
            import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
            import _tmpl from "./test.html";
            import { Foo } from "data-service";

            class Test {
              constructor() {
                this.wiredProp = void 0;
              }
            }

            _registerDecorators(Test, {
              wire: {
                wiredProp: {
                  adapter: Foo.Bar,
                  dynamic: [],
                  config: function($cmp) {
                    return {};
                  }
                }
              }
            });

            export default _registerComponent(Test, {
              tmpl: _tmpl
            });
            `,
            },
        }
    );

    pluginTest(
        'decorator rejects nested member expression',
        `
        import { wire } from 'lwc';
        import Foo from 'foo';
        export default class Test {
            @wire(Foo.Bar.Buzz, {}) wiredProp;
        }
    `,
        {
            error: {
                message: '@wire identifier cannot contain nested member expressions',
                loc: {
                    line: 4,
                    column: 6,
                    length: 12,
                    start: 85,
                },
            },
        }
    );

    pluginTest(
        'decorator accepts an optional config object as second parameter',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo) wiredProp;
        }
    `,
        {
            output: {
                code: `
                    import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                    import _tmpl from "./test.html";
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
                          config: function($cmp) {
                            return {};
                          }
                        }
                      }
                    });

                    export default _registerComponent(Test, {
                      tmpl: _tmpl
                    });
`,
            },
        }
    );

    pluginTest(
        'decorator expects an imported identifier as first parameter',
        `
        import { wire } from 'lwc';
        const ID = "adapterId"
        export default class Test {
            @wire(ID, {}) wiredProp;
        }
    `,
        {
            error: {
                message: '@wire expects a function identifier to be imported as first parameter.',
                loc: {
                    line: 4,
                    column: 6,
                    length: 2,
                    start: 85,
                },
            },
        }
    );

    pluginTest(
        'decorator expects an object as second parameter',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, '$prop', ['fixed', 'array']) wiredProp
        }
    `,
        {
            error: {
                message: '@wire expects a configuration object expression as second parameter.',
                loc: {
                    line: 4,
                    column: 14,
                    length: 7,
                    start: 109,
                },
            },
        }
    );

    pluginTest(
        'throws when wired property is combined with @api',
        `
        import { api, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @api
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            wiredPropWithApi;
        }
    `,
        {
            error: {
                message: '@wire method or property cannot be used with @api',
                loc: {
                    line: 5,
                    column: 0,
                    length: 58,
                    start: 105,
                },
            },
        }
    );

    pluginTest(
        "config function should use bracket notation for param when it's definition has invalid identifier as segment",
        `
        import { api, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1.a b", key2: "$p1.p2" })
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                    import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                    import _tmpl from "./test.html";
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
                          dynamic: ["key1","key2"],
                          config: function($cmp) {
                            let v1 = $cmp["prop1"];
                            let v2 = $cmp.p1;
                            return {
                              key1: v1 != null ? v1["a b"] : undefined,
                              key2: v2 != null ? v2.p2 : undefined
                            };
                          }
                        }
                      }
                    });

                    export default _registerComponent(Test, {
                      tmpl: _tmpl
                    });
`,
            },
        }
    );

    pluginTest(
        'config function should use bracket notation when param definition has empty segment',
        `
        import { api, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1..prop2", key2: ["fixed", 'array']})
            wiredProp;
        }
    `,
        {
            output: {
                code: `
                    import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                    import _tmpl from "./test.html";
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
                          dynamic: ["key1"],
                          config: function($cmp) {
                            let v1 = $cmp["prop1"];
                            return {
                              key2: ["fixed", "array"],
                              key1: v1 != null && (v1 = v1[""]) != null ? v1["prop2"] : undefined
                            };
                          }
                        }
                      }
                    });

                    export default _registerComponent(Test, {
                      tmpl: _tmpl
                    });
`,
            },
        }
    );

    pluginTest(
        'throws when wired property is combined with @track',
        `
        import { track, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @track
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            wiredWithTrack
        }
    `,
        {
            error: {
                message: '@wire method or property cannot be used with @track',
                loc: {
                    line: 5,
                    column: 0,
                    length: 58,
                    start: 109,
                },
            },
        }
    );

    pluginTest(
        'throws when using 2 wired decorators',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            @wire(getFoo, { key1: "$prop1", key2: ["fixed", 'array']})
            multipleWire
        }
    `,
        {
            error: {
                message: 'Method or property can only have 1 @wire decorator',
                loc: {
                    line: 4,
                    column: 0,
                    length: 58,
                    start: 95,
                },
            },
        }
    );

    pluginTest(
        'should not throw when using 2 separate wired decorators',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wired1;
            @wire(getFoo, { key1: "$prop1", key2: ["array"]})
            wired2;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
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
                      dynamic: ["key1"],
                      config: function($cmp) {
                        return {
                          key2: ["fixed"],
                          key1: $cmp.prop1
                        };
                      }
                    },
                    wired2: {
                      adapter: getFoo,
                      dynamic: ["key1"],
                      config: function($cmp) {
                        return {
                          key2: ["array"],
                          key1: $cmp.prop1
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );
});

describe('Transform method', () => {
    pluginTest(
        'transforms wired method',
        `
        import { wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wiredMethod() {}
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
                import _tmpl from "./test.html";
                import { getFoo } from "data-service";

                class Test {
                  wiredMethod() {}
                }

                _registerDecorators(Test, {
                  wire: {
                    wiredMethod: {
                      adapter: getFoo,
                      dynamic: ["key1"],
                      method: 1,
                      config: function($cmp) {
                        return {
                          key2: ["fixed"],
                          key1: $cmp.prop1
                        };
                      }
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'throws when wired method is combined with @api',
        `
        import { api, wire } from 'lwc';
        import { getFoo } from 'data-service';
        export default class Test {
            @api
            @wire(getFoo, { key1: "$prop1", key2: ["fixed"]})
            wiredWithApi() {}
        }
    `,
        {
            error: {
                message: '@wire method or property cannot be used with @api',
                loc: {
                    line: 5,
                    column: 0,
                    length: 49,
                    start: 105,
                },
            },
        }
    );
});
