define("x/comments",["lwc"],function(e){var t=[function(e,t,s){return[s?":host{color:#00f}":[e,"{color:#00f}"].join(""),"x-comments",t,"{color:green}"].join("")}];function s(e,t,s,n){const{d:o,h:r}=e;return[r("h1",{key:1},[o(t.myname,0)])]}var n=e.registerTemplate(s);s.stylesheets=[],t&&s.stylesheets.push.apply(s.stylesheets,t),s.stylesheetTokens={hostAttribute:"x-comments_comments-host",shadowAttribute:"x-comments_comments"};class o extends e.LightningElement{constructor(...e){super(...e),this.myname="default value"}}return e.registerDecorators(o,{track:{myname:1}}),e.registerComponent(o,{tmpl:n})});