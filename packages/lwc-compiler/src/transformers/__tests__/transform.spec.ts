import { transform } from '../../transformers/transformer';

const transformEntry: any = transform;

it('should validate presence of src', () => {
    expect(() => transformEntry()).toThrow(
        /Expect a string for source. Received undefined/,
    );
});

it('should validate presence of id', () => {
    expect(() => transformEntry(`console.log('Hello')`)).toThrow(
        /Expect a string for id. Received undefined/,
    );
});
