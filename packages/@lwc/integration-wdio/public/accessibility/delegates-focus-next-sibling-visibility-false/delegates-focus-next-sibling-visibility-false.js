(function (lwc) {
    'use strict';

    function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
      var shadowSelector = token ? ("[" + token + "]") : "";
      return ".invisible-button" + shadowSelector + " {visibility: hidden;}";
      /*LWC compiler v8.24.0*/
    }
    var _implicitStylesheets = [stylesheet];

    const $fragment1$1 = lwc.parseFragment`<input type="text"${3}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1)];
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

    const $fragment1 = lwc.parseFragment`<span tabindex="0"${3}>Tabbable span</span>`;
    const $fragment2 = lwc.parseFragment`<br${3}>`;
    const $fragment3 = lwc.parseFragment`<button class="invisible-button${0}"${2}>Invisible Button</button>`;
    const stc0 = {
      props: {
        "tabIndex": "-1"
      },
      key: 4
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_static_fragment($fragment2, 3), api_custom_element("integration-child", __lwc_component_class_internal$1, stc0), api_static_fragment($fragment3, 6)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-788obhmjkr0";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-next-sibling-visibility-false_delegates-focus-next-sibling-visibility-false";
    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    lwc.freezeTemplate(tmpl);

    class Cmp extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(Cmp, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-next-sibling-visibility-false",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-next-sibling-visibility-false', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
