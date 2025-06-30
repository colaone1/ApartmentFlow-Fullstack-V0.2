'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
// eslint-disable-next-line no-unused-vars
import Input from '../../components/Input';
// eslint-disable-next-line no-unused-vars
import Button from '../../components/Button';
// eslint-disable-next-line no-unused-vars
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('You must fill in both email and password to continue.');
      return;
    }
    setLoading(true);
    try {
      // eslint-disable-next-line no-console
      console.log('Login attempt for:', formData.email);
      await login(formData.email, formData.password);
      router.push('/listings');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--color-primary)]">Login</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit">{loading ? 'Logging in...' : 'Login'}</Button>

        <p className="mt-4 text-center text-sm text-[var(--color-primary)]">
          Don't have an account?{' '}
          <Link href="/auth/register" className="underline hover:text-[var(--color-accent)]">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
