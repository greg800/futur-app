export default function Logo({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-futur.png"
      alt="FUTUR"
      height={size}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
