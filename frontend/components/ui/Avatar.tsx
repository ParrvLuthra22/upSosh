'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 64,
  xl: 96,
};

const fontSizeMap: Record<AvatarSize, string> = {
  xs: '8px',
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '28px',
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? '?';
  return ((words[0][0] ?? '') + (words[words.length - 1][0] ?? '')).toUpperCase();
}

type AvatarProps = {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
};

export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const px = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const initials = getInitials(name);

  const base = cn('rounded-full object-cover flex-shrink-0', className);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn('rounded-full object-cover flex-shrink-0', className)}
        onError={() => setImgError(true)}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-lime text-void font-display font-bold flex items-center justify-center flex-shrink-0',
        className,
      )}
      style={{ width: px, height: px, fontSize }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

type AvatarGroupUser = { name: string; src?: string };

type AvatarGroupProps = {
  users: AvatarGroupUser[];
  max?: number;
  size?: AvatarSize;
};

export const AvatarGroup = ({ users, max = 4, size = 'md' }: AvatarGroupProps) => {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={i}
          className={cn('ring-2 ring-void rounded-full', i > 0 && '-ml-2')}
        >
          <Avatar src={user.src} name={user.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="-ml-2 rounded-full bg-surface-2 border border-border text-cream-dim font-mono font-medium flex items-center justify-center ring-2 ring-void"
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            fontSize: fontSizeMap[size],
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
