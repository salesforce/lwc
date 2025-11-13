(function (lwc) {
    'use strict';

    function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
      var hostSelector = token ? ("[" + token + "-host]") : "";
      return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "position: absolute;top: 0;left: 0;border: 2px solid #000;}";
      /*LWC compiler v8.24.0*/
    }
    var _implicitStylesheets = [stylesheet];

    const $fragment1 = lwc.parseFragment`<button class="shadow-element-from-point${0}"${2}>Click to run shadow dom element from point</button>`;
    const $fragment2 = lwc.parseFragment`<button class="document-from-point${0}"${2}>Click to run document element from point</button>`;
    const $fragment3 = lwc.parseFragment`<div class="correct-shadow-element-indicator${0}"${2}>Correct shadow element selected</div>`;
    const $fragment4 = lwc.parseFragment`<div class="correct-document-element-indicator${0}"${2}>Correct document element selected</div>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1, _m2, _m3} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "click": api_bind($cmp.handleShadowElementFromPointClick)
        })
      }, null)]), api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m3 || ($ctx._m3 = {
          "click": api_bind($cmp.handleDocumentElementFromPointClick)
        })
      }, null)]), $cmp.didSelectCorrectShadowElement ? api_static_fragment($fragment3, 5) : null, $cmp.didSelectCorrectDocumentElement ? api_static_fragment($fragment4, 7) : null];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-4ivv3266nop";
    tmpl.legacyStylesheetToken = "integration-element-from-point_element-from-point";
    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    lwc.freezeTemplate(tmpl);

    class ShadowRootFromPoint extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.didSelectCorrectShadowElement = null;
        this.didSelectCorrectDocumentElement = null;
      }
      handleShadowElementFromPointClick() {
        const match = this.template.elementFromPoint(5, 5);
        this.didSelectCorrectShadowElement = match === this.template.querySelector('.shadow-element-from-point');
      }
      handleDocumentElementFromPointClick() {
        const match = document.elementFromPoint(5, 5);
        this.didSelectCorrectDocumentElement = match === this.template.host;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(ShadowRootFromPoint, {
      track: {
        didSelectCorrectShadowElement: 1,
        didSelectCorrectDocumentElement: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(ShadowRootFromPoint, {
      tmpl: _tmpl,
      sel: "integration-element-from-point",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-element-from-point', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
