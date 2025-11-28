// @ts-nocheck
'use client';

interface AnimatedTextProps {
  text: string;
  scrollProgress: number;
  baseDelay?: number;
  className?: string;
  as?: 'h3' | 'p';
}

export default function AnimatedText({
  text,
  scrollProgress,
  baseDelay = 0,
  className = '',
  as: Component = 'p'
}: AnimatedTextProps) {
  // SSR-safe: Use 0 if scrollProgress is undefined during server rendering
  const safeScrollProgress = scrollProgress ?? 0;

  const words = text.split(' ');

  // Define color palette for words (Tokopedia-style: green gradient to white)
  const wordColors = [
    '#16a085', // teal
    '#1abc9c', // turquoise
    '#2ecc71', // emerald
    '#27ae60', // green
    '#3498db', // blue
    '#9b59b6', // purple
  ];

  return (
    <Component className={className}>
      {words.map((word, wordIndex) => {
        // Calculate word color based on index
        const wordColor = wordColors[wordIndex % wordColors.length];

        return (
          <span key={wordIndex} className="word-wrapper">
            {word.split('').map((char, charIndex) => {
              // Calculate global character index across all text
              const charsBeforeWord = words.slice(0, wordIndex).join('').length;
              const globalCharIndex = charsBeforeWord + charIndex;
              const totalChars = text.replace(/ /g, '').length;

              // Smooth scroll-based opacity (Tokopedia pattern)
              const progress = globalCharIndex / totalChars;
              const opacity = Math.max(0.2, Math.min(1, (safeScrollProgress - progress * 0.7) / 0.3));

              // Color transition: from wordColor to white based on opacity
              const isFullyVisible = opacity > 0.9;
              const finalColor = isFullyVisible ? '#ffffff' : wordColor;

              return (
                <span
                  key={charIndex}
                  className="char-animation"
                  style={{
                    opacity,
                    color: finalColor,
                    transition: 'opacity 0.3s ease-out, color 0.3s ease-out'
                  }}
                >
                  {char}
                </span>
              );
            })}
            {' '}
          </span>
        );
      })}
    </Component>
  );
}
