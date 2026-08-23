import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useToast, useToastStore } from '../src/hooks/useToast';

describe('useToast Hook & Store', () => {
  beforeEach(() => {
    act(() => {
      useToastStore.getState().clearToasts();
    });
  });

  it('should initialize with an empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a success toast correctly', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast.success('Task created successfully', 'Success');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[0].message).toBe('Task created successfully');
    expect(result.current.toasts[0].title).toBe('Success');
  });

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      toastId = result.current.toast.error('Something went wrong');
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      result.current.removeToast(toastId!);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it('should clear all toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast.info('Message 1');
      result.current.toast.warning('Message 2');
    });

    expect(result.current.toasts.length).toBe(2);

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts.length).toBe(0);
  });
});
