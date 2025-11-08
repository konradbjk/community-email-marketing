'use client';

import { useEffect, useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const isProd = process.env.NODE_ENV === 'production';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKeycloak, setHasKeycloak] = useState(false);

  // In development, detect if Keycloak provider is configured; in production we assume it's present (fail-fast on server)
  useEffect(() => {
    if (!isProd) {
      getProviders()
        .then((providers) => setHasKeycloak(!!providers?.keycloak))
        .catch(() => setHasKeycloak(false));
    }
  }, [isProd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        setIsLoading(false);
      } else if (result?.ok) {
        // Redirect to chat page
        router.push('/chat');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Sign in</CardTitle>
        <CardDescription>
          {isProd
            ? 'Use Merck SSO to access Merck OmniA Chat'
            : 'Enter your credentials to access Merck OmniA Chat'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isProd && (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                type='text'
                placeholder='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoComplete='username'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete='current-password'
              />
            </div>

            {error && (
              <div className='flex items-center gap-2 text-sm text-destructive'>
                <AlertCircle className='h-4 w-4' />
                <span>{error}</span>
              </div>
            )}

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        )}

        {/* Dev: optional SSO if configured */}
        {!isProd && hasKeycloak && (
          <Button
            type='button'
            className='w-full mt-4'
            variant='outline'
            onClick={() => signIn('keycloak')}
          >
            Sign in with Merck SSO
          </Button>
        )}

        {/* Prod: SSO only */}
        {isProd && (
          <Button
            type='button'
            className='w-full'
            onClick={() => signIn('keycloak')}
          >
            Sign in with Merck SSO
          </Button>
        )}

        {/* Dev-only helper hint */}
        {!isProd && (
          <div className='mt-6 text-center text-sm text-muted-foreground'>
            <p>POC Version - For testing use:</p>
            <p className='mt-1 font-mono text-xs'>alex.johnson / password</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
