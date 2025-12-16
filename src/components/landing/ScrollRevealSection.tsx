import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible 
          ? "opacity-100 translate-y-0 blur-0" 
          : "opacity-0 translate-y-8 blur-sm"
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface FloatingTextProps {
  words: string[];
  className?: string;
}

export function FloatingText({ words, className = "" }: FloatingTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          words.forEach((_, index) => {
            setTimeout(() => {
              setVisibleIndices((prev) => [...prev, index]);
            }, index * 200);
          });
        } else {
          setVisibleIndices([]);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [words]);

  return (
    <div ref={ref} className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`text-primary/70 text-sm font-medium px-4 py-2 rounded-full border border-primary/20 bg-primary/5 transition-all duration-500 ${
            visibleIndices.includes(index)
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
