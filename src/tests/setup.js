import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;
if (typeof window !== 'undefined') {
  window.ResizeObserver = ResizeObserverMock;
}
if (typeof document !== 'undefined' && document.defaultView) {
  document.defaultView.ResizeObserver = ResizeObserverMock;
}
