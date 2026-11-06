import { describe, it, expect, beforeEach } from 'bun:test';
import {
  __resetModalHistoryForTest,
  dispatchPopState,
  onModalPopState,
  pendingModalEntries,
  pushModalEntry,
  releaseAllModalEntries,
  releaseModalEntry,
} from './modal-history';

beforeEach(() => {
  __resetModalHistoryForTest();
  window.history.replaceState(null, '', window.location.href);
});

describe('modal history entries', () => {
  it('counts an entry for each open modal', () => {
    pushModalEntry();
    expect(pendingModalEntries()).toBe(1);
    pushModalEntry();
    expect(pendingModalEntries()).toBe(2);
  });

  it('attributes a back press to the dialog while an entry is on top', () => {
    pushModalEntry();

    expect(dispatchPopState()).toBe(true);
    expect(pendingModalEntries()).toBe(0);
  });

  it('leaves tab navigation alone when no entry is pending', () => {
    expect(dispatchPopState()).toBe(false);
  });

  it('notifies subscribed dialogs so each can close itself', () => {
    let calls = 0;
    const unsubscribe = onModalPopState(() => {
      calls += 1;
    });
    pushModalEntry();

    dispatchPopState();
    expect(calls).toBe(1);

    unsubscribe();
    pushModalEntry();
    dispatchPopState();
    expect(calls).toBe(1);
  });

  it('releases every outstanding entry when the view underneath changes', () => {
    pushModalEntry();
    pushModalEntry();

    expect(releaseAllModalEntries()).toBe(2);
    expect(pendingModalEntries()).toBe(0);
    // A second call must be inert rather than stepping further back.
    expect(releaseAllModalEntries()).toBe(0);
  });

  it('does not record an entry when nothing is outstanding to release', () => {
    expect(releaseModalEntry()).toBe(false);
  });

  it('never counts below zero', () => {
    pushModalEntry();
    releaseModalEntry();
    releaseModalEntry();
    expect(pendingModalEntries()).toBe(0);
  });
});
