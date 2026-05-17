export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#D8F3DC" />
        <path d="M16 6C16 6 10 10 10 17C10 20.3137 12.6863 23 16 23C19.3137 23 22 20.3137 22 17C22 10 16 6 16 6Z" fill="#2D6A4F" />
        <path d="M16 14V26" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 18L16 15L19 18" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        fontSize: size * 0.75,
        fontWeight: 700,
        color: '#2D6A4F',
        letterSpacing: '0.1em',
      }}>FUTUR</span>
    </div>
  )
}
