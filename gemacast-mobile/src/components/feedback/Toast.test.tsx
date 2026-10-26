import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useToastStore } from '../../stores/toast-store';
import { Toast } from './Toast';

beforeEach(() => {
  cleanup();
  useToastStore.setState({ toasts: [] });
  HTMLDialogElement.prototype.showModal = mock();
  HTMLDialogElement.prototype.close = mock();
});

describe('Toast', () => {
  it('renders normal toast correctly', () => {
    const toast = { id: '1', type: 'info' as const, message: 'Just info' };
    render(<Toast toast={toast} />);
    expect(screen.getByText('Just info')).toBeTruthy();
    expect(screen.queryByText('点击查看详情')).toBeNull();
  });

  it('calls dismiss on close button click', () => {
    const toast = { id: '1', type: 'success' as const, message: 'Done' };
    const dismissSpy = mock();
    useToastStore.setState({ dismiss: dismissSpy, toasts: [toast] });

    render(<Toast toast={toast} />);
    const closeBtn = screen.getByLabelText('关闭提示');
    fireEvent.click(closeBtn);

    expect(dismissSpy).toHaveBeenCalledWith('1');
  });

  it('renders error toast without log correctly', () => {
    const toast = { id: '1', type: 'error' as const, message: 'Failed' };
    render(<Toast toast={toast} />);
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.queryByText('点击查看详情')).toBeNull();
  });

  it('renders error toast with fullLog correctly', () => {
    const toast = {
      id: '1',
      type: 'error' as const,
      message: 'Failed',
      fullLog: 'Stack trace here',
    };
    render(<Toast toast={toast} />);

    expect(screen.getByText('Failed')).toBeTruthy();
    const detailsBtn = screen.getByText('点击查看详情');
    expect(detailsBtn).toBeTruthy();

    expect(screen.getByText('Stack trace here')).toBeTruthy();
  });

  it('opens dialog when details button is clicked', () => {
    const toast = { id: '1', type: 'error' as const, message: 'Failed', fullLog: 'Log text' };
    render(<Toast toast={toast} />);

    const detailsBtn = screen.getByText('点击查看详情');
    fireEvent.click(detailsBtn);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('closes dialog when close button inside dialog is clicked', () => {
    const toast = { id: '1', type: 'error' as const, message: 'Failed', fullLog: 'Log text' };
    render(<Toast toast={toast} />);

    const closeBtn = screen.getByRole('button', { name: '关闭', hidden: true });
    fireEvent.click(closeBtn);

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
