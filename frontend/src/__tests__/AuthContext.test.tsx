import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Minimal test component that exposes auth state
function AuthDisplay() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div data-testid="loading">Loading</div>;
  return (
    <div>
      <div data-testid="is-authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user-name">{user?.name ?? 'none'}</div>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({}),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('shows unauthenticated state when no token stored', async () => {
  await act(async () => {
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    );
  });

  expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  expect(screen.getByTestId('user-name').textContent).toBe('none');
});

test('shows authenticated state when token resolves to valid user', async () => {
  localStorage.setItem('iwhistle_token', 'valid-token');
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ user: { name: 'Test User', email: 'test@example.com', role: 'partner', organization: 'Test Org' } }),
  });

  await act(async () => {
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    );
  });

  expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
  expect(screen.getByTestId('user-name').textContent).toBe('Test User');
});

test('clears token when API returns invalid token response', async () => {
  localStorage.setItem('iwhistle_token', 'expired-token');

  await act(async () => {
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    );
  });

  expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  expect(localStorage.getItem('iwhistle_token')).toBeNull();
});
