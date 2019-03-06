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
                    line: 2,
                    column: 4,
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
                    line: 2,
                    column: 4,
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
                `,
            },
        }
    );

    pluginTest(
        'decorator accepts a default import function identifier as first parameter',
        `
        import { wire } from 'lwc';
        import getFoo from 'foo';
        export default class Test {
            @wire(getFoo, {}) wiredProp;
        }
    `,
        {
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
`,
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
                    line: 2,
                    column: 20,
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
                    line: 2,
                    column: 20,
                },
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
                    line: 2,
                    column: 20,
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
                    line: 2,
                    column: 20,
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
                    line: 2,
                    column: 20,
                },
            },
        }
    );
});
