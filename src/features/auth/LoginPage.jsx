import React from 'react';
import { AuthPage } from './AuthPage.jsx';

export { AuthPage };

export function LoginPage() {
  return <AuthPage initialMode="login" />;
}

export function RegisterPage() {
  return <AuthPage initialMode="register" />;
}
