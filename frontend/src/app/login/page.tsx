'use client';

import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
}