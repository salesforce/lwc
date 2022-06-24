import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<img src="http://www.example.com/image.png" crossorigin="anonymous"${3}>`;
const $fragment2 = parseFragment`<video src="http://www.example.com/video.mp4" crossorigin="anonymous"${3}></video>`;
const $fragment3 = parseFragment`<audio src="http://www.example.com/video.mp3" crossorigin="anonymous"${3}></audio>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_static_fragment($fragment3(), 5),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
