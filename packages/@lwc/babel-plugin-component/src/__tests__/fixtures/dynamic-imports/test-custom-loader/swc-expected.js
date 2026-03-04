import { load } from '@custom/loader';
export async function test() {
    const x = await load('foo');
    return x + 'yay';
}
