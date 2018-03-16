const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('Transform property', () => {
    pluginTest('transforms wired field', `
        import { wire } from 'engine';
        export default class Test {
            @wire("adapterId", { key1: "$prop1", key2: ["fixed", 'array']})
            wiredProp;
        }
    `, {
        output: {
            code: `export default class Test {
  constructor() {
    this.wiredProp = void 0;
  }

}
Test.wire = {
  wiredProp: {
    params: {
      key1: "prop1"
    },
    static: {
      key2: ["fixed", 'array']
    },
    type: "adapterId"
  }
};`
        }
    });

    pluginTest('transforms multiple dynamic params', `
        import { wire } from 'engine';
        export default class Test {
            @wire("adapterId", { key1: "$prop", key2: "$prop", key3: "fixed", key4: ["fixed", 'array']})
            wiredProp;
        }
    `, {
        output: {
            code: `export default class Test {
  constructor() {
    this.wiredProp = void 0;
  }

}
Test.wire = {
  wiredProp: {
    params: {
      key1: "prop",
      key2: "prop"
    },
    static: {
      key3: "fixed",
      key4: ["fixed", 'array']
    },
    type: "adapterId"
  }
};`
        }
    });

    pluginTest('decorator expects 2 parameters', `
        import { wire } from 'engine';
        export default class Test {
            @wire() wiredProp;
        }
    `, {
        error: {
            message: 'test.js: @wire(<adapterId>, <adapterConfig>) expects 2 parameters.',
            loc: {
                line: 2,
                column: 4,
            },
        }
    });

    pluginTest('decorator expects a function identifier as first parameter', `
        import { wire } from 'engine';
        import { getFoo } from 'data-service';
        export default class Test {
            @wire(getFoo, {}) wiredProp;
        }
    `, {
        output: {
            code: `import { getFoo } from 'data-service';
export default class Test {
  constructor() {
    this.wiredProp = void 0;
  }

}
Test.wire = {
  wiredProp: {
    params: {},
    static: {},
    adapter: getFoo
  }
};`
        }
    });

    pluginTest('decorator expects an imported identifier as first parameter', `
        import { wire } from 'engine';
        const ID = "adapterId"
        export default class Test {
            @wire(ID, {}) wiredProp;
        }
    `, {
        error: {
            message: 'test.js: @wire expects a function identifier to be imported as first parameter.',
            loc: {
                line: 4,
                column: 6,
            },
        }
    });

    pluginTest('decorator expects an object as second parameter', `
        import { wire } from 'engine';
        export default class Test {
            @wire('adapterId', '$prop', ['fixed', 'array']) wiredProp
        }
    `, {
        error: {
            message: 'test.js: @wire expects a configuration object expression as second parameter.',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when wired property is combined with @api', `
        import { api, wire } from 'engine';
        export default class Test {
            @api
            @wire("adapterId", { key1: "$prop1", key2: ["fixed", 'array']})
            wiredPropWithApi;
        }
    `, {
        error: {
            message: 'test.js: @wire method or property cannot be used with @api',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when wired property is combined with @track', `
        import { track, wire } from 'engine';
        export default class Test {
            @track
            @wire("adapterId", { key1: "$prop1", key2: ["fixed", 'array']})
            wiredWithTrack
        }
    `, {
        error: {
            message: 'test.js: @wire method or property cannot be used with @track',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when using 2 wired decorators', `
        import { wire } from 'engine';
        export default class Test {
            @wire("adapterId", { key1: "$prop1", key2: ["fixed", 'array']})
            @wire("adapterId", { key1: "$prop1", key2: ["fixed", 'array']})
            multipleWire
        }
    `, {
        error: {
            message: 'test.js: Method or property can only have 1 @wire decorator',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('should not throw when using 2 separate wired decorators', `
        import { wire } from 'engine';
        export default class Test {
            @wire("adapterId", { key1: "$prop1", key2: ["fixed"]})
            wired1;
            @wire("adapterId", { key1: "$prop1", key2: ["array"]})
            wired2;
        }
    `, {
        output: {
            code: `export default class Test {
  constructor() {
    this.wired1 = void 0;
    this.wired2 = void 0;
  }

}
Test.wire = {
  wired1: {
    params: {
      key1: "prop1"
    },
    static: {
      key2: ["fixed"]
    },
    type: "adapterId"
  },
  wired2: {
    params: {
      key1: "prop1"
    },
    static: {
      key2: ["array"]
    },
    type: "adapterId"
  }
};`
        }
    });
});

describe('Transform method', () => {
    pluginTest('transforms wired method', `
        import { wire } from 'engine';
        export default class Test {
            @wire("adapterId", { key1: "$prop1", key2: ["fixed"]})
            wiredMethod() {}
        }
    `, {
        output: {
            code: `export default class Test {
  wiredMethod() {}

}
Test.wire = {
  wiredMethod: {
    params: {
      key1: "prop1"
    },
    static: {
      key2: ["fixed"]
    },
    type: "adapterId",
    method: 1
  }
};`
        }
    });

    pluginTest('throws when wired method is combined with @api', `
        import { api, wire } from 'engine';
        export default class Test {
            @api
            @wire("adapterId", { key1: "$prop1", key2: ["fixed"]})
            wiredWithApi() {}
        }
    `, {
        error: {
            message: 'test.js: @wire method or property cannot be used with @api',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });
});

describe('Metadata', () => {
    pluginTest(
        'gather track metadata',
        `
        import { wire } from 'engine';

        export default class Test {
            @wire("adapterId", { key1: "$prop1", key2: ["fixed"]})
            wiredProp;

            @wire("adapterId", { key1: "$prop1", key2: ["fixed"]})
            wiredMethod() {}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [{
                        type: 'wire',
                        targets: [{
                            adapter: undefined,
                            name: 'wiredProp',
                            params: { key1: 'prop1' },
                            static: { key2: ['fixed'] },
                            type: 'property',
                        },
                        {
                            adapter: undefined,
                            name: 'wiredMethod',
                            params: { key1: 'prop1' },
                            static: { key2: ['fixed'] },
                            type: 'method',
                        }],
                    }]
                },
            },
        },
    );
});
