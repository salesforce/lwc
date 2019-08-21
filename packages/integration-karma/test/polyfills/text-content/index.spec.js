describe('Node.textContent', () => {
    it('should not return comment text when Node.nodeType is ELEMENT_NODE', () => {
        const elm = document.createElement('div');
        elm.appendChild(document.createComment('Some comment'));
        elm.appendChild(document.createTextNode('text content'));
        elm.appendChild(document.createComment('Some other comment'));

        expect(elm.textContent).toBe('text content');
    });

    it('should return comment text when Node.nodeType is COMMENT_NODE', () => {
        const elm = document.createComment('Some comment');

        expect(elm.textContent).toBe('Some comment');
    });
});
