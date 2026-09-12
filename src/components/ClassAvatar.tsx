import { cn } from '@/lib/utils';

/**
 * Warna foto profile per kelas (tanpa kotak gelap — background transparan).
 * Lingkaran memakai warna kelas, inisial putih di tengahnya.
 */
const AVATAR_THEMES: Record<string, { circle: string }> = {
  Baby: { circle: '#ec4899' },
  Samuel: { circle: '#0ea5e9' },
  Yosua: { circle: '#10b981' },
  Musa: { circle: '#8b5cf6' },
};

interface ClassAvatarProps {
  memberClass: string;
  className?: string;
}

/**
 * Foto profile kelas (Baby/Samuel/Yosua/Musa): lingkaran warna kelas
 * dengan inisial kelas di tengah, background transparan.
 * SVG supaya tajam & proporsional di ukuran berapa pun.
 */
export function ClassAvatar({ memberClass, className }: ClassAvatarProps) {
  const theme = AVATAR_THEMES[memberClass] ?? AVATAR_THEMES.Baby;
  const initial = memberClass.charAt(0).toUpperCase();

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Foto kelas ${memberClass}`}
      className={cn('block shrink-0', className)}
    >
      <circle cx="32" cy="32" r="32" fill={theme.circle} />
      <text
        x="32"
        y="33.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="28"
        fontWeight={700}
        fill="#ffffff"
      >
        {initial}
      </text>
    </svg>
  );
}
