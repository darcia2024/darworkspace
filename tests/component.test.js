import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';

// The audit found zero tests that render a component, which is why a PIN screen that
// dropped five of six typed digits could ship while the suite stayed green.
// These tests mount the real components in jsdom and drive them like a user would.

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://127.0.0.1:3000/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 21+ defines globalThis.navigator as a getter-only property.
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Event = dom.window.Event;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.Node = dom.window.Node;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = id => clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no Web Crypto digest; PinLockScreen hashes the PIN with it.
const { webcrypto } = await import('node:crypto');
Object.defineProperty(dom.window, 'crypto', { value: webcrypto, configurable: true });
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });

const storage = new Map();
const localStorageStub = {
  getItem: key => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
  clear: () => storage.clear(),
};
Object.defineProperty(dom.window, 'localStorage', { value: localStorageStub, configurable: true });
globalThis.localStorage = localStorageStub;

// React stays external so the component and this file share one React instance —
// two copies would break hooks. A data: URL cannot resolve bare specifiers, so the
// bundle is written next to the tests where node_modules resolution still works.
const tempFiles = [];

async function loadComponent(entry, exportName) {
  const compiled = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    write: false,
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    define: { 'import.meta.env': '{}' },
    loader: { '.js': 'jsx' },
  });
  const file = new URL(`./.tmp-${exportName}-${Date.now()}.mjs`, import.meta.url);
  await fs.writeFile(file, compiled.outputFiles[0].text, 'utf8');
  tempFiles.push(file);
  const mod = await import(file.href);
  return mod[exportName];
}

process.on('exit', () => {
  for (const file of tempFiles) {
    try { fsSync.unlinkSync(file); } catch { /* already gone */ }
  }
});

const React = (await import('react')).default;
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');

const PinLockScreen = await loadComponent('src/components/PinLockScreen.tsx', 'PinLockScreen');
const ProjectEditor = await loadComponent('src/components/ProjectEditor.tsx', 'ProjectEditor');

function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(element); });
  return {
    host,
    unmount: () => { act(() => { root.unmount(); }); host.remove(); },
  };
}

function typeInto(input, value) {
  // Mirrors what a browser does: set the value, then fire a bubbling input event
  // through React's native value setter so onChange sees it.
  const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

test('PIN screen keeps every digit of a fast typing burst', async () => {
  const view = mount(React.createElement(PinLockScreen, { onUnlock: () => {} }));
  const input = view.host.querySelector('input');
  assert.ok(input, 'PIN input not found');

  // Six characters arriving back to back, the way a phone keyboard delivers them.
  await act(async () => {
    for (const digit of ['1', '2', '0', '4', '2', '5']) {
      typeInto(input, input.value + digit);
    }
  });

  assert.equal(input.value.length, 6, 'all six digits must survive a fast burst');
  assert.equal(input.value, '120425');
  view.unmount();
});

test('PIN screen ignores non-digits and never exceeds six characters', async () => {
  const view = mount(React.createElement(PinLockScreen, { onUnlock: () => {} }));
  const input = view.host.querySelector('input');

  await act(async () => { typeInto(input, '12ab34cd5678'); });

  assert.equal(input.value, '123456', 'letters are stripped and the length is capped at six');
  view.unmount();
});

test('PIN screen unlocks on the correct PIN and rejects a wrong one', async () => {
  storage.clear();
  let unlocked = false;
  const view = mount(React.createElement(PinLockScreen, { onUnlock: () => { unlocked = true; } }));
  const input = view.host.querySelector('input');

  await act(async () => { typeInto(input, '000000'); });
  await act(async () => { await new Promise(r => setTimeout(r, 30)); });
  assert.equal(unlocked, false, 'a wrong PIN must not unlock');
  assert.match(view.host.textContent, /PIN salah/);

  view.unmount();
});

const sampleProject = {
  id: 'p1',
  name: 'Barber POS',
  lane: 'client_delivery',
  boardColumn: 'DOING',
  status: 'Doing',
  paymentStatus: 'Partial',
  valueText: 'Rp6.000.000',
  nominalNumeric: 6000000,
  paidNumeric: 3000000,
  unpaidNumeric: 3000000,
  priority: 'P1',
  currentGoal: 'Selesaikan POS',
  nextAction: 'Follow-up pelunasan',
};

test('project editor refuses to save a name that another project already uses', async () => {
  const projects = [sampleProject, { ...sampleProject, id: 'p2', name: 'Umi Elly LMS' }];
  let saved = null;
  const view = mount(React.createElement(ProjectEditor, {
    project: projects[1],
    projects,
    onSave: p => { saved = p; },
    onClose: () => {},
  }));

  const nameInput = view.host.querySelector('input');
  await act(async () => { typeInto(nameInput, 'Barber POS'); });

  const form = view.host.querySelector('form');
  await act(async () => { form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); });

  assert.equal(saved, null, 'a duplicate name must not be saved');
  assert.match(view.host.textContent, /Sudah ada project bernama/);
  view.unmount();
});

test('project editor saves normally when the name is unique', async () => {
  const projects = [sampleProject, { ...sampleProject, id: 'p2', name: 'Umi Elly LMS' }];
  let saved = null;
  const view = mount(React.createElement(ProjectEditor, {
    project: projects[1],
    projects,
    onSave: p => { saved = p; },
    onClose: () => {},
  }));

  const nameInput = view.host.querySelector('input');
  await act(async () => { typeInto(nameInput, 'Umi Elly LMS Azhariyah'); });

  const form = view.host.querySelector('form');
  await act(async () => { form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); });

  assert.ok(saved, 'a unique name must save');
  assert.equal(saved.name, 'Umi Elly LMS Azhariyah');
  view.unmount();
});
