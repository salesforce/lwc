(function (lwc) {
    'use strict';

    const stc0$1 = {
      key: 0
    };
    const stc1 = [];
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {s: api_slot} = $api;
      return [api_slot("", stc0$1, stc1, $slotset)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.slots = [""];
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

    const $fragment1 = lwc.parseFragment`<input type="text"${3}>`;
    const stc0 = {
      key: 0
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_custom_element("integration-child", __lwc_component_class_internal$1, stc0, [api_static_fragment($fragment1, 2)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-20ql3tmtesl";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-slot_delegates-focus-slot";
    lwc.freezeTemplate(tmpl);

    class DelegatesFocus extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    DelegatesFocus.delegatesFocus = true;
    const __lwc_component_class_internal = lwc.registerComponent(DelegatesFocus, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-slot",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-slot', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
