// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// this fixes the [Error: Not implemented: window.scrollTo] { type: 'not implemented' }
const noop = () => {};
Object.defineProperty(window, "scrollTo", { value: noop, writable: true });
