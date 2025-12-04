(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<span${3}>Non-tabbable text</span>`;
    const $fragment2$1 = lwc.parseFragment`<input type="text"${3}>`;
    const $fragment3 = lwc.parseFragment`<span${3}>Non-tabbable text</span>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1), api_static_fragment($fragment2$1, 3), api_static_fragment($fragment3, 5)];
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

    const $fragment1 = lwc.parseFragment`<button${3}>first button</button>`;
    const $fragment2 = lwc.parseFragment`<button${3}>second button</button>`;
    const stc0 = {
      props: {
        "tabIndex": "0"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-child", __lwc_component_class_internal$1, stc0), api_static_fragment($fragment2, 4)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-3svu85bhq6l";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-tabindex-zero_delegates-focus-tabindex-zero";
    lwc.freezeTemplate(tmpl);

    class DelegatesFocusTabIndexZero extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(DelegatesFocusTabIndexZero, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-tabindex-zero",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-tabindex-zero', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
