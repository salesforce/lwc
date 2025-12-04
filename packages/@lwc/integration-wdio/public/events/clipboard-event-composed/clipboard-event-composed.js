(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<div${3}>foo</div>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1, 1)];
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
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, c: api_custom_element} = $api;
      const {_m0} = $ctx;
      return [api_custom_element("integration-child", __lwc_component_class_internal$1, {
        key: 0,
        on: _m0 || ($ctx._m0 = {
          "copy": api_bind($cmp.handleCopy),
          "cut": api_bind($cmp.handleCut),
          "paste": api_bind($cmp.handlePaste)
        })
      })];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-37045kuof03";
    tmpl.legacyStylesheetToken = "integration-clipboard-event-composed_clipboard-event-composed";
    lwc.freezeTemplate(tmpl);

    class Container extends lwc.LightningElement {
      didHandleCopy() {
        return this._didHandleCopy || false;
      }
      didHandleCut() {
        return this._didHandleCut || false;
      }
      didHandlePaste() {
        return this._didHandlePaste || false;
      }
      handleCopy() {
        this._didHandleCopy = true;
      }
      handleCut() {
        this._didHandleCut = true;
      }
      handlePaste() {
        this._didHandlePaste = true;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Container, {
      publicMethods: ["didHandleCopy", "didHandleCut", "didHandlePaste"]
    });
    const __lwc_component_class_internal = lwc.registerComponent(Container, {
      tmpl: _tmpl,
      sel: "integration-clipboard-event-composed",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-clipboard-event-composed', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
