(function (lwc) {
    'use strict';

    const $fragment1$2 = lwc.parseFragment`<button${3}>child button (should never be tabbed to)</button>`;
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$2, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-74484v40a3r";
    tmpl$2.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$2);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Child.delegatesFocus = true;
    const __lwc_component_class_internal$2 = lwc.registerComponent(Child, {
      tmpl: _tmpl$2,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1$1 = lwc.parseFragment`<input placeholder="parent input" class="parent${0}"${2}>`;
    const stc0$1 = {
      props: {
        "tabIndex": "-1"
      },
      key: 0
    };
    const stc1 = {
      props: {
        "tabIndex": "-1"
      },
      key: 3
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {c: api_custom_element, st: api_static_fragment} = $api;
      return [api_custom_element("integration-child", __lwc_component_class_internal$2, stc0$1), api_static_fragment($fragment1$1, 2), api_custom_element("integration-child", __lwc_component_class_internal$2, stc1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-5etg9jssjsj";
    tmpl$1.legacyStylesheetToken = "integration-parent_parent";
    lwc.freezeTemplate(tmpl$1);

    class Parent extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    Parent.delegatesFocus = true;
    const __lwc_component_class_internal$1 = lwc.registerComponent(Parent, {
      tmpl: _tmpl$1,
      sel: "integration-parent",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input placeholder="first outer input" class="first${0}"${2}>`;
    const $fragment2 = lwc.parseFragment`<input placeholder="last outer input" class="last${0}"${2}>`;
    const stc0 = {
      props: {
        "tabIndex": "0"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-parent", __lwc_component_class_internal$1, stc0), api_static_fragment($fragment2, 4)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-g0st2ccsti";
    tmpl.legacyStylesheetToken = "integration-tabindex-zero-internal-tabindex-negative_tabindex-zero-internal-tabindex-negative";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-tabindex-zero-internal-tabindex-negative",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-tabindex-zero-internal-tabindex-negative', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
