import { describe, it, expect, beforeEach } from 'vitest';
import { ClassList } from '../class-list';
import type { LightningElement } from '../lightning-element';

describe('ClassList SSR Polyfill', () => {
    let mockElement: LightningElement;
    let classList: ClassList;

    beforeEach(() => {
        mockElement = { className: 'apple banana' } as unknown as LightningElement;
        classList = new ClassList(mockElement);
    });

    it('adds new classes without duplicating', () => {
        classList.add('orange', 'apple');
        expect(mockElement.className).toBe('apple banana orange');
    });

    it('checks if a class exists using contains()', () => {
        expect(classList.contains('apple')).toBe(true);
        expect(classList.contains('orange')).toBe(false);
    });

    it('removes classes correctly', () => {
        classList.remove('apple', 'orange');
        expect(mockElement.className).toBe('banana');
    });

    it('replaces an old class with a new class', () => {
        const wasReplaced = classList.replace('apple', 'orange');
        expect(wasReplaced).toBe(true);
        expect(mockElement.className).toBe('orange banana');
    });

    it('toggles a class on and off', () => {
        const isApplePresent = classList.toggle('apple');
        expect(isApplePresent).toBe(false);
        expect(mockElement.className).toBe('banana');

        const isGrapePresent = classList.toggle('grape');
        expect(isGrapePresent).toBe(true);
        expect(mockElement.className).toBe('banana grape');
    });

    it('returns the className for value and toString()', () => {
        expect(classList.value).toBe('apple banana');
        expect(classList.toString()).toBe('apple banana');
    });

    it('returns the correct length', () => {
        expect(classList.length).toBe(2);
    });

    it('returns the correct item by index', () => {
        expect(classList.item(0)).toBe('apple');
        expect(classList.item(1)).toBe('banana');
        expect(classList.item(2)).toBeNull();
    });

    it('iterates over classes using forEach', () => {
        const result: string[] = [];
        classList.forEach((val) => {
            result.push(val);
        });
        expect(result).toEqual(['apple', 'banana']);
    });

    it('throws a TypeError when supports() is called', () => {
        expect(() => {
            classList.supports('anything');
        }).toThrowError('DOMTokenList has no supported tokens.');
    });

    it('handles empty or null classNames gracefully', () => {
        const emptyElement = {} as unknown as LightningElement;
        const emptyClassList = new ClassList(emptyElement);

        expect(emptyClassList.length).toBe(0);
        expect(emptyClassList.item(0)).toBeNull();

        let count = 0;
        emptyClassList.forEach(() => {
            count++;
        });
        expect(count).toBe(0);
    });
});
