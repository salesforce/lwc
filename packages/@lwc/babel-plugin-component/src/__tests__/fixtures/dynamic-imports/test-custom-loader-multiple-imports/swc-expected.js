import { load } from "@custom/loader";
export async function test() {
    const x = await load("foo");
    const y = await load("bar");
    return x + y + "yay";
}
