import { parseStyleText, parseClassNames } from '../style';

describe('parseStyleText', () => {
    it('should parse simple style text', () => {
        const res = parseStyleText('color: blue');
        expect(res).toEqual({ color: 'blue' });
    });

    it('should parse simple style text with trailing coma', () => {
        const res = parseStyleText('color: blue;');
        expect(res).toEqual({
            color: 'blue'
        });
    });

    it('should parse simple style with multiple values', () => {
        const res = parseStyleText('box-shadow: 10px 5px 5px black;');
        expect(res).toEqual({
            boxShadow: '10px 5px 5px black'
        });
    });

    it('should parse multiple declaration', () => {
        const res = parseStyleText(`font-size: 12px;background: blue; color:red  ;`);
        expect(res).toEqual({
            fontSize: '12px',
            background: 'blue',
            color: 'red'
        });
    });

    it('should parse css functions', () => {
        const res = parseStyleText(`background-color:rgba(255,0,0,0.3)`);
        expect(res).toEqual({
            backgroundColor: 'rgba(255,0,0,0.3)'
        });
    });

    it('should support base 64 encoded strings', () => {
        const image = 'url("data:image/webp;base64,AAAAAAAAAAA")';
        const res = parseStyleText(`background: ${image}`);
        expect(res).toEqual({
            background: image
        });
    });
});

describe('parseClassNames', () => {
    it('should support a single class', () => {
        const res = parseClassNames('foo');
        expect(res).toEqual({ foo: true });
    });

    it('should support simple class list', () => {
        const res = parseClassNames('foo bar');
        expect(res).toEqual({ foo: true, bar: true });
    });

    it('should support simple class list with trailing spaces', () => {
        const res = parseClassNames('  foo bar ');
        expect(res).toEqual({ foo: true, bar: true });
    });

    it('should support simple class list multiple spaces', () => {
        const res = parseClassNames('foo  bar');
        expect(res).toEqual({ foo: true, bar: true });
    });
});
