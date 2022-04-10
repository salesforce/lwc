import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<img src="http://www.example.com/image.png" crossorigin="anonymous"${1}${2}>`;
let $fragment2;
const $hoisted2 = parseFragment`<video src="http://www.example.com/video.mp4" crossorigin="anonymous"${1}${2}></video>`;
let $fragment3;
const $hoisted3 = parseFragment`<audio src="http://www.example.com/video.mp3" crossorigin="anonymous"${1}${2}></audio>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1),
    api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3),
    api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 5),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
