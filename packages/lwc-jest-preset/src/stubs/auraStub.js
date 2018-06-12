export const dispatchGlobalEvent = jest.fn();

export const labels = jest.fn();

export const executeGlobalController = jest.fn().mockImplementation(() => Promise.resolve());

export const registerModule = jest.fn().mockImplementation(() => '');

export const hasModule = jest.fn().mockImplementation(() => false);

export const getModule = jest.fn().mockImplementation(() => {});

export const sanitizeDOM = jest.fn().mockImplementation(() => '');

export const createComponent = jest.fn();

export const logInteraction = jest.fn();
