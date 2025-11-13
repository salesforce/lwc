(function (lwc) {
    'use strict';

    function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
      var shadowSelector = token ? ("[" + token + "]") : "";
      return ":focus" + shadowSelector + " {border-color: red;}";
      /*LWC compiler v8.24.0*/
    }
    var _implicitStylesheets = [stylesheet];

    const $fragment1$2 = lwc.parseFragment`<div${3}>integration-child content</div>`;
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
    const __lwc_component_class_internal$2 = lwc.registerComponent(Child, {
      tmpl: _tmpl$2,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1$1 = lwc.parseFragment`<button class="span-button${0}"${2}><span${3}>span content</span></button>`;
    const stc0$1 = {
      classMap: {
        "integration-child-button": true
      },
      key: 0
    };
    const stc1 = {
      key: 1
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {c: api_custom_element, h: api_element, st: api_static_fragment} = $api;
      return [api_element("button", stc0$1, [api_custom_element("integration-child", __lwc_component_class_internal$2, stc1)]), api_static_fragment($fragment1$1, 3)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-5etg9jssjsj";
    tmpl$1.legacyStylesheetToken = "integration-parent_parent";
    if (_implicitStylesheets) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets);
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

    const $fragment1 = lwc.parseFragment`<input class="head${0}" placeholder="head"${2}>`;
    const $fragment2 = lwc.parseFragment`<input class="tail${0}" placeholder="tail"${2}>`;
    const stc0 = {
      props: {
        "tabIndex": "-1"
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
    tmpl.stylesheetToken = "lwc-2iurl0ll293";
    tmpl.legacyStylesheetToken = "integration-delegates-focus-click-target-natively-non-focusable_delegates-focus-click-target-natively-non-focusable";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-delegates-focus-click-target-natively-non-focusable",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-delegates-focus-click-target-natively-non-focusable', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
