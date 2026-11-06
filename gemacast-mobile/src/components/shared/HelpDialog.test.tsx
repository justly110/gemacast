import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, renderHook, act } from '@testing-library/react';
import { HelpDialog } from './HelpDialog';
import { useHelpDialog } from '../../hooks/use-help-dialog';
import { __resetModalHistoryForTest, dispatchPopState, pendingModalEntries } from '../../core/modal-history';
import { HELP_CONTENT as actualHelpContent } from '../../core/help-content';

mock.module('../../core/help-content', () => ({
  HELP_CONTENT: {
    ...actualHelpContent,
    'test-key': {
      title: 'Test Title',
      body: 'Test Body',
    },
  },
}));

beforeEach(() => {
  cleanup();
  __resetModalHistoryForTest();
  HTMLDialogElement.prototype.showModal = mock();
  HTMLDialogElement.prototype.close = mock();
});

describe('HelpDialog Component', () => {
  it('renders nothing when activeKey is null', () => {
    const { container } = render(
      <HelpDialog activeKey={null} onClose={mock()} dialogRef={{ current: null }} />,
    );
    expect(container.textContent).toBe('');
  });

  it('renders content when activeKey is valid', () => {
    render(<HelpDialog activeKey="test-key" onClose={mock()} dialogRef={{ current: null }} />);
    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = mock();
    render(<HelpDialog activeKey="test-key" onClose={onClose} dialogRef={{ current: null }} />);
    fireEvent.click(screen.getByLabelText('关闭帮助'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('useHelpDialog Hook', () => {
  it('initializes with null activeKey', () => {
    const { result } = renderHook(() => useHelpDialog());
    expect(result.current.activeKey).toBeNull();
  });

  it('renderHelpButton returns a button that opens dialog', () => {
    const { result } = renderHook(() => useHelpDialog());

    render(<>{result.current.renderHelpButton('test-key')}</>);
    const btn = screen.getByLabelText('帮助');

    const mockDialog = document.createElement('dialog');
    mockDialog.showModal = mock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.current.dialogRef as any).current = mockDialog;

    fireEvent.click(btn);

    expect(mockDialog.showModal).toHaveBeenCalled();
  });

  it('closes dialog and clears activeKey when the router attributes a back press to it', () => {
    const { result } = renderHook(() => useHelpDialog());
    const mockDialog = document.createElement('dialog');
    mockDialog.showModal = mock();
    mockDialog.close = mock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.current.dialogRef as any).current = mockDialog;

    act(() => {
      result.current.openHelp('test-key');
    });
    expect(result.current.activeKey).toBe('test-key');

    // The tab router is what receives the real `popstate`; the dialog hears about
    // it through this module rather than its own listener.
    act(() => {
      dispatchPopState();
    });

    expect(result.current.activeKey).toBeNull();
    expect(mockDialog.close).toHaveBeenCalled();
  });

  it('does not leave a history entry behind once the dialog is closed', () => {
    const { result } = renderHook(() => useHelpDialog());
    const mockDialog = document.createElement('dialog');
    mockDialog.showModal = mock();
    mockDialog.close = mock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.current.dialogRef as any).current = mockDialog;

    act(() => {
      result.current.openHelp('test-key');
    });
    expect(pendingModalEntries()).toBe(1);

    act(() => {
      result.current.closeHelp();
    });
    expect(pendingModalEntries()).toBe(0);
  });
});
