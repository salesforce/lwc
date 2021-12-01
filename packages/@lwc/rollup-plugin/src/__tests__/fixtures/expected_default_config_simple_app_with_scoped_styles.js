(function (lwc) {
  'use strict';

  function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
    var shadowSelector = token ? ("." + token) : "";
    return ["div", shadowSelector, " {color: blue;}"].join('');
  }
  stylesheet.$scoped$ = true;
  var _implicitScopedStylesheets = [stylesheet];

  const stc0 = {
    key: 0
  };
  const stc1 = [];
  function tmpl($api, $cmp, $slotset, $ctx) {
    const {h: api_element} = $api;
    return [api_element("div", stc0, stc1)];
  }
  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.stylesheets = [];
  if (_implicitScopedStylesheets) {
    tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
  }
  tmpl.stylesheetToken = "x-app_app";

  class App extends lwc.LightningElement {}

  var App$1 = lwc.registerComponent(App, {
    tmpl: _tmpl
  });

  const container = document.getElementById('main');
  const element = lwc.createElement('x-app', {
    is: App$1
  });
  container.appendChild(element);

})(LWC);
