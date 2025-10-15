'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn, getProviders } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const initiatedRef = useRef(false);

  // Determine available providers at runtime instead of using process.env on client
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [hasKeycloak, setHasKeycloak] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProviders()
      .then((providers) => {
        if (!mounted) return;
        setHasCredentials(!!providers?.credentials);
        setHasKeycloak(!!providers?.keycloak);
        setProvidersLoaded(true);
      })
      .catch(() => {
        if (!mounted) return;
        setProvidersLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect authenticated users to the chat dashboard
      router.replace('/chat');
      return;
    }

    if (
      status === 'unauthenticated' &&
      providersLoaded &&
      !hasCredentials &&
      hasKeycloak &&
      !initiatedRef.current
    ) {
      initiatedRef.current = true;
      // Auto-login via Merck SSO (Keycloak) when only SSO is available
      // Callback URL uses NextAuth default unless configured in env
      signIn('keycloak');
    }
  }, [status, router, providersLoaded, hasCredentials, hasKeycloak]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8'>
        {/* Merck Branding */}
        <div className='text-center space-y-2'>
          <h1 className='text-4xl font-bold text-foreground'>
            Merck OmniA Chat
          </h1>
          <p className='text-lg text-muted-foreground'>Internal AI Assistant</p>
        </div>

        {!providersLoaded ? (
          <div className='flex items-center justify-center py-6'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='ml-2 text-sm text-muted-foreground'>
              Preparing sign-in...
            </span>
          </div>
        ) : hasCredentials ? (
          <div className='py-2'>
            <LoginForm />
          </div>
        ) : (
          <>
            {/* Auto SSO loader */}
            <div className='flex items-center justify-center py-6'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              <span className='ml-2 text-sm text-muted-foreground'>
                Connecting to Merck SSO...
              </span>
            </div>
          </>
        )}

        {/* Footer */}
        <div className='text-center text-sm text-muted-foreground'>
          <p>
            © {new Date().getFullYear()} Merck & Co., Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
