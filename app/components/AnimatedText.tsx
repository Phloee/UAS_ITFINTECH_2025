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
              const delay = (baseDelay + currentIndex) / (totalChars + baseDelay);
              const opacity = Math.max(0.2, Math.min(1, (safeScrollProgress - delay * 0.4) / 0.25));
              
              return (
                <span
                  key={charIndex}
                  className="char-animation"
                  style={{ 
                    opacity,
                    color: opacity > 0.85 ? '#16a085' : `rgba(100, 100, 100, ${opacity})`
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
