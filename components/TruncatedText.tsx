'use client'

import { useState } from 'react'

interface TruncatedTextProps {
  text: string
  maxLength?: number
  className?: string
  readMoreClassName?: string
  size?: 'large' | 'small'
}

export function TruncatedText({ 
  text, 
  maxLength = 150, 
  className = '', 
  readMoreClassName = '',
  size = 'large'
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Decode HTML entities (for titles with &quot; etc.)
  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }
  
  const decodedText = decodeHtmlEntities(text)
  const shouldTruncate = decodedText.length > maxLength
  const displayText = shouldTruncate && !isExpanded 
    ? decodedText.substring(0, maxLength) + '...'
    : decodedText
  
  if (!shouldTruncate) {
    return (
      <p className={`text-gray-600 ${
        size === 'large' ? 'text-sm' : 'text-xs'
      } ${className}`}>
        {decodedText}
      </p>
    )
  }
  
  return (
    <div className={className}>
      <p className={`text-gray-600 ${
        size === 'large' ? 'text-sm' : 'text-xs'
      }`}>
        {displayText}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`ml-1 text-orange-600 hover:text-orange-700 font-medium transition-colors ${
              size === 'large' ? 'text-sm' : 'text-xs'
            } ${readMoreClassName}`}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
    </div>
  )
}