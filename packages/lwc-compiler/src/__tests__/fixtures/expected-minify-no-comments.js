define("x/comments",["lwc"],function(a){function b(a,b){const{d:c,h:d}=a;return[d("h1",{key:2},[c(b.myname)])]}var c={factory:function(a,b){return`:host{color:blue}${a}{color:blue}x-comments${b}{color:green}`},hostAttribute:"x-comments_comments-host",shadowAttribute:"x-comments_comments"},d=a.registerTemplate(b);c&&(b.stylesheet=c);class e extends a.LightningElement{constructor(...a){super(...a),this.myname="default value"}render(){return d}}return e.track={myname:1},e});