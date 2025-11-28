// @ts-nocheck
'use client';

interface AnimatedTextProps {
  text: string;
  scrollProgress: number;
  paragraphIndex?: number;
  totalParagraphs?: number;
  className?: string;
  as?: 'h3' | 'p';
}

export default function AnimatedText({
  text,
  scrollProgress,
  paragraphIndex = 0,
  totalParagraphs = 1,
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
              // Calculate character position ACROSS ALL PARAGRAPHS for continuous animation
              const charsBeforeWord = words.slice(0, wordIndex).join('').length;
              const charIndexInParagraph = charsBeforeWord + charIndex;
              const totalCharsInParagraph = text.replace(/ /g, '').length;

              // Calculate position as percentage across all paragraphs
              const paragraphProgress = paragraphIndex / totalParagraphs;
              const charProgressInParagraph = charIndexInParagraph / totalCharsInParagraph;
              const globalProgress = paragraphProgress + (charProgressInParagraph / totalParagraphs);

              // Smooth scroll-based opacity (continuous across paragraphs)
              // Adjusted: 0.5 multiplier and 0.4 divisor ensures full visibility at scrollProgress ~0.9
              const opacity = Math.max(0.2, Math.min(1, (safeScrollProgress - globalProgress * 0.5) / 0.4));

              // Color transition: from wordColor to white based on opacity
              const isFullyVisible = opacity > 0.85;
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
