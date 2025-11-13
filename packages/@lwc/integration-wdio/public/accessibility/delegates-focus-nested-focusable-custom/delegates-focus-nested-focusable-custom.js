(function (lwc) {
    'use strict';

    function stylesheet$1(token, useActualHostSelector, useNativeDirPseudoclass) {
      var hostSelector = token ? ("[" + token + "-host]") : "";
      return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "display: block;}";
      /*LWC compiler v8.24.0*/
    }
    var _implicitStylesheets$1 = [stylesheet$1];

    function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
      var hostSelector = token ? ("[" + token + "-host]") : "";
      return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "border: 1px solid red;padding: 10px;}";
      /*LWC compiler v8.24.0*/
    }
    var _implicitStylesheets = [stylesheet];

    const $fragment1$2 = lwc.parseFragment`<span${3}>No focusable content</span>`;
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$2, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-74484v40a3r";
    tmpl$2.legacyStylesheetToken = "integration-child_child";
    if (_implicitStylesheets) {
      tmpl$2.stylesheets.push.apply(tmpl$2.stylesheets, _implicitStylesheets);
    }
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

    const $fragment1$1 = lwc.parseFragment`<span class="focusable-span${0}" tabindex="0"${2}>Focusable span</span>`;
    const stc0$1 = {
      props: {
        "tabIndex": "0"
      },
      key: 2
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1$1, 1), api_custom_element("integration-child", __lwc_component_class_internal$2, stc0$1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-5etg9jssjsj";
    tmpl$1.legacyStylesheetToken = "integration-parent_parent";
    if (_implicitStylesheets$1) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets$1);
    }
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

    const $fragment1 = lwc.parseFragment`<span${3}>Not focusable</span>`;
    const stc0 = {
      props: {
        "tabIndex": "-1"
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-parent", __lwc_component_class_internal$1, stc0)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-2vinrljov48";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-nested-focusable-custom_delegates-focus-nested-focusable-custom";
    lwc.freezeTemplate(tmpl);

    class DelegatesFocus extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(DelegatesFocus, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-nested-focusable-custom",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-nested-focusable-custom', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
