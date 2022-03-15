import { load as _load } from "@custom/loader";
export async function test() {
  const x = await _load("foo");
  const y = await _load("bar");
  return x + y + "yay";
}