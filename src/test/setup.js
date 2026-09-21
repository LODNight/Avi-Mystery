import '@testing-library/jest-dom';
import '../i18n.js';

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
