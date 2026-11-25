import { useState } from 'react'

// Shows the user's photo if there is one, otherwise whatever children you pass (initials).
export default function Avatar({ as: Tag = 'div', url, style, children, ...rest }) {
  const [badUrl, setBadUrl] = useState(null)
  const showPhoto = url && url !== badUrl

  return (
    <Tag {...rest} style={showPhoto ? { ...style, background: 'transparent', overflow: 'hidden' } : style}>
      {showPhoto ? (
        <img
          src={url} alt="" loading="lazy"
          onError={() => setBadUrl(url)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : children}
    </Tag>
  )
}