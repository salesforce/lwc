(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input class="first-inside${0}" placeholder="first (inside)"${2}>`;
    const $fragment2$1 = lwc.parseFragment`<input class="second-inside${0}" placeholder="second (inside)"${2}>`;
    const $fragment3$1 = lwc.parseFragment`<input class="third-inside${0}" placeholder="third (inside)"${2}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1), api_static_fragment($fragment2$1, 3), api_static_fragment($fragment3$1, 5)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Child.delegatesFocus = true;
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input class="first-outside${0}" placeholder="first (outside)"${2}>`;
    const $fragment2 = lwc.parseFragment`<input class="second-outside${0}" placeholder="second (outside)"${2}>`;
    const $fragment3 = lwc.parseFragment`<input class="third-outside${0}" placeholder="third (outside)"${2}>`;
    const $fragment4 = lwc.parseFragment`<input class="fourth-outside${0}" placeholder="fourth (outside)"${2}>`;
    const stc0 = {
      key: 4
    };
    const stc1 = {
      classMap: {
        "should-never-receive-focus": true
      },
      props: {
        "tabIndex": "-1"
      },
      key: 5
    };
    const stc2 = {
      classMap: {
        "should-never-receive-focus": true
      },
      props: {
        "tabIndex": "-1"
      },
      key: 6
    };
    const stc3 = {
      classMap: {
        "should-never-receive-focus": true
      },
      attrs: {
        "data-id": "click-target"
      },
      props: {
        "tabIndex": "-1"
      },
      key: 7
    };
    const stc4 = {
      classMap: {
        "should-never-receive-focus": true
      },
      props: {
        "tabIndex": "-1"
      },
      key: 8
    };
    const stc5 = {
      classMap: {
        "should-never-receive-focus": true
      },
      props: {
        "tabIndex": "-1"
      },
      key: 9
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element, h: api_element} = $api;
      return [api_static_fragment($fragment1, 1), api_static_fragment($fragment2, 3), api_element("div", stc0, [api_custom_element("integration-child", __lwc_component_class_internal$1, stc1), api_custom_element("integration-child", __lwc_component_class_internal$1, stc2), api_custom_element("integration-child", __lwc_component_class_internal$1, stc3), api_custom_element("integration-child", __lwc_component_class_internal$1, stc4), api_custom_element("integration-child", __lwc_component_class_internal$1, stc5)]), api_static_fragment($fragment3, 11), api_static_fragment($fragment4, 13)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-1339n17u3b8";
    tmpl.legacyStylesheetToken = "integration-tabindex-negative-after-inside-click_tabindex-negative-after-inside-click";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-tabindex-negative-after-inside-click",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-tabindex-negative-after-inside-click', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
