/** Minimal glyphs for the channels the console demonstrates. */
export default function ChannelIcon({
  id,
  className = 'size-4',
}: {
  id: 'whatsapp' | 'instagram' | 'messenger' | 'shopify'
  className?: string
}) {
  if (id === 'whatsapp')
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.46 5.31L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4c5.44 0 9.84-4.4 9.84-9.84C21.88 6.4 17.48 2 12.04 2Zm5.72 13.9c-.24.68-1.4 1.3-1.93 1.34-.5.05-1.12.07-1.8-.12a15.6 15.6 0 0 1-1.64-.62c-2.88-1.25-4.76-4.17-4.9-4.37-.15-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36l.56.01c.18.01.42-.07.66.5.24.58.82 2 .9 2.15.07.15.12.32.02.51-.1.2-.15.32-.29.49l-.44.5c-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.45.29.14.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.68-.17 1.36Z" />
      </svg>
    )
  if (id === 'instagram')
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    )
  if (id === 'messenger')
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <path d="M12 2C6.3 2 2 6.2 2 11.7c0 3.1 1.4 5.9 3.7 7.7V23l3.4-1.9c.9.25 1.9.4 2.9.4 5.7 0 10-4.2 10-9.7S17.7 2 12 2Zm1 12.4-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7Z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M15.3 4.2c-.1-.1-.3-.1-.4-.1l-1 .2c-.3-.8-.8-1.6-1.7-1.6h-.2c-.3-.4-.7-.6-1-.6-1.6 0-2.4 2-2.7 3l-1.5.5c-.5.1-.5.2-.6.6L4.7 19.1l8.2 1.5 4.4-1-2-15.4ZM11.3 5l-1.5.5c.3-1.1.8-1.7 1.3-1.9.1.3.2.8.2 1.4Zm-1.7-2c.1 0 .2 0 .3.1-.6.5-1.2 1.5-1.5 3l-1.2.4c.3-1.1 1.1-3.5 2.4-3.5Zm.7 8c-.5-.2-1-.4-1-1.1 0-.9.7-1.4 1.7-1.4.6 0 1.1.2 1.1.2l.4-1.2s-.4-.3-1.5-.3c-1.9 0-3.2 1.1-3.2 2.7 0 1.3.9 1.9 1.6 2.3.6.3 1 .6 1 1.1 0 .4-.3.8-1 .8-.9 0-1.7-.5-1.7-.5l-.4 1.2s.8.5 1.9.5c2 0 3.3-1 3.3-2.8 0-1.2-.9-1.9-2.2-2.5Z" />
    </svg>
  )
}
