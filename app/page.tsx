'use client';

import { useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect authenticated users to the chat dashboard
      router.replace('/chat');
      return;
    }

    if (status === 'unauthenticated' && !initiatedRef.current) {
      initiatedRef.current = true;
      // Auto-login via Merck SSO (Keycloak)
      // Callback URL uses NextAuth default unless configured in env
      signIn('keycloak');
    }
  }, [status, router]);

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

        {/* Auto SSO loader */}
        <div className='flex items-center justify-center py-6'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          <span className='ml-2 text-sm text-muted-foreground'>
            Connecting to Merck SSO...
          </span>
        </div>

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
