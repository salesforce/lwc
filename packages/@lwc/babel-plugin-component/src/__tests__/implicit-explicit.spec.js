/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTestFactory = require('./utils/test-transform').pluginTest;
const pluginTestImplicit = pluginTestFactory(require('../index'), { isExplicitImport: false });

describe('Transforms', () => {
    pluginTestImplicit(
        'test cmp anonymous class',
        `
    import { LightningElement, api } from 'lwc';
    export default class extends LightningElement { }
    `,
        {
            output: {
                code: `
            import _tmpl from "./test.html";
            import { registerComponent as _registerComponent, LightningElement } from "lwc";
            export default _registerComponent(class extends LightningElement {}, {
              tmpl: _tmpl
            });

        `,
            },
        }
    );
    pluginTestImplicit(
        'test cmp named class with decorators',
        `
    import { LightningElement, api } from 'lwc';
    export default class Test extends LightningElement { @api foo = 1 }
    `,
        {
            output: {
                code: `
            import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
            import _tmpl from "./test.html";

            class Test extends LightningElement {
              foo = 1;
            }

            _registerDecorators(Test, {
              publicProps: {
                foo: {
                  config: 0
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

describe('Implicit mode', () => {
    pluginTestImplicit(
        'noop - implicit export function',
        `
        export default function x() {}
    `,
        {
            output: {
                code: `export default function x() {}`,
            },
        }
    );

    pluginTestImplicit(
        'noop - implicit export const',
        `
        export default {
            foo: 1
        }
    `,
        {
            output: {
                code: `export default {
                foo: 1
            };`,
            },
        }
    );

    pluginTestImplicit(
        'wire',
        `
        import { LightningElement, wire } from 'lwc';
        import { getRecord } from 'recordDataService';

        export default class Test extends LightningElement {
            @wire(getRecord, { id: 1 })
            recordData;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
                import _tmpl from "./test.html";
                import { getRecord } from "recordDataService";

                class Test extends LightningElement {
                  recordData;
                }

                _registerDecorators(Test, {
                  wire: {
                    recordData: {
                      adapter: getRecord,
                      dynamic: [],
                      config: function($cmp) {
                        return {
                          id: 1
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

    pluginTestImplicit(
        'api decorator',
        `
        import { LightningElement, api } from 'lwc';
        export default class Test extends LightningElement {
            @api foo;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
                import _tmpl from "./test.html";

                class Test extends LightningElement {
                  foo;
                }

                _registerDecorators(Test, {
                  publicProps: {
                    foo: {
                      config: 0
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

    pluginTestImplicit(
        'mixin',
        `
        import { LightningElement, api } from 'lwc';
        export default class Test extends mixin(LightningElement) {
            @api foo;
        }
    `,
        {
            output: {
                code: `
                import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
                import _tmpl from "./test.html";

                class Test extends mixin(LightningElement) {
                  foo;
                }

                _registerDecorators(Test, {
                  publicProps: {
                    foo: {
                      config: 0
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
