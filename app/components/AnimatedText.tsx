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
  const textWithoutSpaces = text.replace(/ /g, '').replace(/[.,!?]/g, '');
  const totalChars = textWithoutSpaces.length;

  return (
    <Component className={className}>
      {words.map((word, wordIndex) => {
        const wordStart = text.substring(0, text.indexOf(word)).replace(/ /g, '').replace(/[.,!?]/g, '').length;

        return (
          <span key={wordIndex} className="word-wrapper">
            {word.split('').map((char, charIndex) => {
              const currentIndex = wordStart + charIndex;
              // Slower animation: use 0.8 multiplier for spread, 0.5 for transition speed
              const normalizedDelay = currentIndex / totalChars;
              const opacity = Math.max(0.15, Math.min(1, (safeScrollProgress - normalizedDelay * 0.8) / 0.5));

              return (
                <span
                  key={charIndex}
                  className="char-animation"
                  style={{
                    opacity,
                    color: opacity > 0.9 ? '#ffffff' : `rgba(255, 255, 255, ${opacity})`
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
