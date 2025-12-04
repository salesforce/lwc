(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input class="first-inside${0}"${"a0:tabindex"} placeholder="first (inside)"${2}>`;
    const $fragment2$1 = lwc.parseFragment`<input class="second-inside${0}"${"a0:tabindex"} placeholder="second (inside)"${2}>`;
    const $fragment3$1 = lwc.parseFragment`<input class="third-inside${0}"${"a0:tabindex"} placeholder="third (inside)"${2}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {ti: api_tab_index, sp: api_static_part, st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1, [api_static_part(0, {
        attrs: {
          "tabindex": api_tab_index($cmp.privateTabIndex)
        }
      }, null)]), api_static_fragment($fragment2$1, 3, [api_static_part(0, {
        attrs: {
          "tabindex": api_tab_index($cmp.privateTabIndex)
        }
      }, null)]), api_static_fragment($fragment3$1, 5, [api_static_part(0, {
        attrs: {
          "tabindex": api_tab_index($cmp.privateTabIndex)
        }
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    class Child extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.privateTabIndex = null;
      }
      set tabIndex(value) {
        this.privateTabIndex = value;
      }
      get tabIndex() {
        return this.privateTabIndex;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Child, {
      publicProps: {
        tabIndex: {
          config: 3
        }
      },
      track: {
        privateTabIndex: 1
      }
    });
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<button${3}>${"t1"}</button>`;
    const $fragment2 = lwc.parseFragment`<input class="first-outside${0}" placeholder="first (outside)"${2}>`;
    const $fragment3 = lwc.parseFragment`<input class="second-outside${0}" placeholder="second (outside)"${2}>`;
    const $fragment4 = lwc.parseFragment`<input class="third-outside${0}" placeholder="third (outside)"${2}>`;
    const $fragment5 = lwc.parseFragment`<input class="fourth-outside${0}" placeholder="fourth (outside)"${2}>`;
    const stc0 = {
      key: 6
    };
    const stc1 = {
      "integration-child": true
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, d: api_dynamic_text, sp: api_static_part, st: api_static_fragment, ti: api_tab_index, c: api_custom_element, h: api_element} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "click": api_bind($cmp.handleClick)
        })
      }, null), api_static_part(1, null, "toggle (current tabindex value: " + api_dynamic_text($cmp.privateTabIndex) + ")")]), api_static_fragment($fragment2, 3), api_static_fragment($fragment3, 5), api_element("div", stc0, [api_custom_element("integration-child", __lwc_component_class_internal$1, {
        classMap: stc1,
        props: {
          "tabIndex": api_tab_index($cmp.privateTabIndex)
        },
        key: 7
      })]), api_static_fragment($fragment4, 9), api_static_fragment($fragment5, 11)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-ac8nf7osk4";
    tmpl.legacyStylesheetToken = "integration-manual-delegation_manual-delegation";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.privateTabIndex = 0;
      }
      handleClick() {
        this.privateTabIndex = this.privateTabIndex === 0 ? -1 : 0;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Container, {
      track: {
        privateTabIndex: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-manual-delegation",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-manual-delegation', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
