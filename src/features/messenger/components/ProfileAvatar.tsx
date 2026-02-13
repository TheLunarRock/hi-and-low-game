'use client'

interface ProfileAvatarProps {
  readonly text: string
  readonly color: string
  readonly size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
} as const

export function ProfileAvatar({ text, color, size = 'md' }: ProfileAvatarProps) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: color }}
    >
      {text}
    </div>
  )
}
