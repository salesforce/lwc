(function (lwc) {
    'use strict';

    const $fragment1$2 = lwc.parseFragment`<input placeholder="delegates-focus-true"${3}>`;
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1$2, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleShadowFocus)
        })
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-93rmj5hq87";
    tmpl$2.legacyStylesheetToken = "integration-delegatesFocusTrue_delegatesFocusTrue";
    lwc.freezeTemplate(tmpl$2);

    class DelegatesFocusTrue extends lwc.LightningElement {
      handleShadowFocus() {
        this.dispatchEvent(new CustomEvent('shadowfocus'));
      }
      /*LWC compiler v8.24.0*/
    }
    DelegatesFocusTrue.delegatesFocus = true;
    const __lwc_component_class_internal$2 = lwc.registerComponent(DelegatesFocusTrue, {
      tmpl: _tmpl$2,
      sel: "integration-delegates-focus-true",
      apiVersion: 66
    });

    const $fragment1$1 = lwc.parseFragment`<input placeholder="delegates-focus-false"${3}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1$1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleShadowFocus)
        })
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-7uqfirrin4l";
    tmpl$1.legacyStylesheetToken = "integration-delegatesFocusFalse_delegatesFocusFalse";
    lwc.freezeTemplate(tmpl$1);

    class DelegatesFocusFalse extends lwc.LightningElement {
      handleShadowFocus() {
        this.dispatchEvent(new CustomEvent('shadowfocus'));
      }
      /*LWC compiler v8.24.0*/
    }
    DelegatesFocusFalse.delegatesFocus = false;
    const __lwc_component_class_internal$1 = lwc.registerComponent(DelegatesFocusFalse, {
      tmpl: _tmpl$1,
      sel: "integration-delegates-focus-false",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<p${3}>${"t1"}</p>`;
    const $fragment2 = lwc.parseFragment`<p${3}>${"t1"}</p>`;
    const $fragment3 = lwc.parseFragment`<h2${3}>delegatesFocus: true, tabindex: -1</h2>`;
    const $fragment4 = lwc.parseFragment`<input class="head${0}"${2}>`;
    const $fragment5 = lwc.parseFragment`<input class="tail${0}"${2}>`;
    const $fragment6 = lwc.parseFragment`<h2${3}>delegatesFocus: true, tabindex: 0</h2>`;
    const $fragment7 = lwc.parseFragment`<input class="head${0}"${2}>`;
    const $fragment8 = lwc.parseFragment`<input class="tail${0}"${2}>`;
    const $fragment9 = lwc.parseFragment`<h2${3}>delegatesFocus: true, tabindex: none</h2>`;
    const $fragment10 = lwc.parseFragment`<input class="head${0}"${2}>`;
    const $fragment11 = lwc.parseFragment`<input class="tail${0}"${2}>`;
    const $fragment12 = lwc.parseFragment`<h2${3}>delegatesFocus: false, tabindex: -1</h2>`;
    const $fragment13 = lwc.parseFragment`<input class="head${0}"${2}>`;
    const $fragment14 = lwc.parseFragment`<input class="tail${0}"${2}>`;
    const $fragment15 = lwc.parseFragment`<h2${3}>delegatesFocus: false, tabindex: 0</h2>`;
    const $fragment16 = lwc.parseFragment`<input class="head${0}"${2}>`;
    const $fragment17 = lwc.parseFragment`<input class="tail${0}"${2}>`;
    const $fragment18 = lwc.parseFragment`<h2${3}>delegatesFocus: false, tabindex: none</h2>`;
    const $fragment19 = lwc.parseFragment`<input class="head${0}"${2}>`;
    const $fragment20 = lwc.parseFragment`<input class="tail${0}"${2}>`;
    const stc0 = {
      classMap: {
        "delegates-true-tabindex-negative": true
      },
      key: 4
    };
    const stc1 = {
      "tabIndex": "-1"
    };
    const stc2 = {
      classMap: {
        "delegates-true-tabindex-zero": true
      },
      key: 12
    };
    const stc3 = {
      "tabIndex": "0"
    };
    const stc4 = {
      classMap: {
        "delegates-true-tabindex-none": true
      },
      key: 20
    };
    const stc5 = {
      classMap: {
        "delegates-false-tabindex-negative": true
      },
      key: 28
    };
    const stc6 = {
      classMap: {
        "delegates-false-tabindex-zero": true
      },
      key: 36
    };
    const stc7 = {
      classMap: {
        "delegates-false-tabindex-none": true
      },
      key: 44
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {d: api_dynamic_text, sp: api_static_part, st: api_static_fragment, b: api_bind, c: api_custom_element, h: api_element} = $api;
      const {_m0, _m1, _m2, _m3, _m4, _m5} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(1, null, "host focus count: " + api_dynamic_text($cmp.renderedHostFocusCount))]), api_static_fragment($fragment2, 3, [api_static_part(1, null, "shadow focus count: " + api_dynamic_text($cmp.renderedShadowFocusCount))]), api_element("section", stc0, [api_static_fragment($fragment3, 6), api_static_fragment($fragment4, 8), api_custom_element("integration-delegates-focus-true", __lwc_component_class_internal$2, {
        props: stc1,
        key: 9,
        on: _m0 || ($ctx._m0 = {
          "focus": api_bind($cmp.handleHostFocus),
          "shadowfocus": api_bind($cmp.handleShadowFocus)
        })
      }), api_static_fragment($fragment5, 11)]), api_element("section", stc2, [api_static_fragment($fragment6, 14), api_static_fragment($fragment7, 16), api_custom_element("integration-delegates-focus-true", __lwc_component_class_internal$2, {
        props: stc3,
        key: 17,
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleHostFocus),
          "shadowfocus": api_bind($cmp.handleShadowFocus)
        })
      }), api_static_fragment($fragment8, 19)]), api_element("section", stc4, [api_static_fragment($fragment9, 22), api_static_fragment($fragment10, 24), api_custom_element("integration-delegates-focus-true", __lwc_component_class_internal$2, {
        key: 25,
        on: _m2 || ($ctx._m2 = {
          "focus": api_bind($cmp.handleHostFocus),
          "shadowfocus": api_bind($cmp.handleShadowFocus)
        })
      }), api_static_fragment($fragment11, 27)]), api_element("section", stc5, [api_static_fragment($fragment12, 30), api_static_fragment($fragment13, 32), api_custom_element("integration-delegates-focus-false", __lwc_component_class_internal$1, {
        props: stc1,
        key: 33,
        on: _m3 || ($ctx._m3 = {
          "focus": api_bind($cmp.handleHostFocus),
          "shadowfocus": api_bind($cmp.handleShadowFocus)
        })
      }), api_static_fragment($fragment14, 35)]), api_element("section", stc6, [api_static_fragment($fragment15, 38), api_static_fragment($fragment16, 40), api_custom_element("integration-delegates-focus-false", __lwc_component_class_internal$1, {
        props: stc3,
        key: 41,
        on: _m4 || ($ctx._m4 = {
          "focus": api_bind($cmp.handleHostFocus),
          "shadowfocus": api_bind($cmp.handleShadowFocus)
        })
      }), api_static_fragment($fragment17, 43)]), api_element("section", stc7, [api_static_fragment($fragment18, 46), api_static_fragment($fragment19, 48), api_custom_element("integration-delegates-focus-false", __lwc_component_class_internal$1, {
        key: 49,
        on: _m5 || ($ctx._m5 = {
          "focus": api_bind($cmp.handleHostFocus),
          "shadowfocus": api_bind($cmp.handleShadowFocus)
        })
      }), api_static_fragment($fragment20, 51)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-54fqhkal1c5";
    tmpl.legacyStylesheetToken = "integration-focus-event-while-navigating_focus-event-while-navigating";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._hostFocusCount = 0;
        this._shadowFocusCount = 0;
      }
      reset() {
        this._hostFocusCount = 0;
        this._shadowFocusCount = 0;
      }
      hostFocusCount() {
        return this._hostFocusCount;
      }
      shadowFocusCount() {
        return this._shadowFocusCount;
      }
      get renderedHostFocusCount() {
        return this._hostFocusCount;
      }
      get renderedShadowFocusCount() {
        return this._shadowFocusCount;
      }
      handleHostFocus() {
        this._hostFocusCount += 1;
      }
      handleShadowFocus() {
        this._shadowFocusCount += 1;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Container, {
      publicMethods: ["reset", "hostFocusCount", "shadowFocusCount"],
      track: {
        _hostFocusCount: 1,
        _shadowFocusCount: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-focus-event-while-navigating",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-focus-event-while-navigating', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
