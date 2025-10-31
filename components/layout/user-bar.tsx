'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserBarProps {
  className?: string;
}

export function UserBar({ className }: UserBarProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className={cn('flex items-center gap-2 min-w-[240px]', className)}>
        <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { name, surname, email, merck_id, image } = session.user;
  const fullName = `${name} ${surname}`;
  const initials = `${name[0]}${surname[0]}`.toUpperCase();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className={cn('flex items-center gap-2 min-w-[240px]', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex items-center gap-3 h-10 py-2 px-3 hover:bg-accent rounded-md'
          >
            <Avatar className='h-8 w-8'>
              {image && <AvatarImage src={image} alt={fullName} />}
              <AvatarFallback className='bg-primary text-primary-foreground text-sm font-medium'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col items-start min-w-0'>
              <span className='text-sm font-medium truncate max-w-[180px]'>
                {fullName}
              </span>
              <span className='text-xs text-muted-foreground truncate max-w-[180px]'>
                {merck_id}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[240px]'>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium'>{fullName}</p>
              <p className='text-xs text-muted-foreground'>{email}</p>
              <p className='text-xs text-muted-foreground'>ID: {merck_id}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleProfileClick}
            className='cursor-pointer'
          >
            <User className='mr-2 h-4 w-4' />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className='cursor-pointer text-destructive focus:text-destructive'
          >
            <LogOut className='mr-2 h-4 w-4 text-destructive' />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
