/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Snippet {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    category: string;
    tags: string;
    preview_image_url?: string;
    playground_url?: string;
    integration_vanilla?: string;
    integration_react?: string;
    created_at: string;
}

export function getPlaygroundUrl(snippet: Snippet): string {
    if (snippet.playground_url) return snippet.playground_url;
    const t = snippet.title.toLowerCase();
    if (t.includes("scroll") || t.includes("reveal")) return "/snippet-playground/preview-scroll.html";
    if (t.includes("magnetic") || t.includes("hover")) return "/snippet-playground/preview-magnetic.html";
    if (t.includes("clipboard") || t.includes("copy")) return "/snippet-playground/preview-clipboard.html";
    if (t.includes("debounce") || t.includes("cancel")) return "/snippet-playground/preview-debounce.html";
    if (t.includes("glass") || t.includes("morphism")) return "/snippet-playground/preview-glass.html";
    return "/snippet-playground/preview-scroll.html";
}

/** Tiny single-pass tokenizer: returns escaped HTML with token spans (tok-keyword, tok-string, ...). */
const TOKENS =
    /((?<!:)\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|(["'`])(?:\\.|(?!\2)[^\\\n])*\2|\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|async|await|try|catch|new|this|typeof|void|public|private|string|number|boolean|any|unknown|never|null|undefined|true|false)\b|\b([a-zA-Z_$][\w$]*)(?=\()|\b(\d+(?:\.\d+)?)\b/g;
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function highlight(code: string): string {
    let out = "";
    let last = 0;
    for (const m of code.matchAll(TOKENS)) {
        const at = m.index ?? 0;
        out += esc(code.slice(last, at));
        const kind = m[1] ? "comment" : m[2] ? "string" : m[3] ? "keyword" : m[4] ? "function" : "number";
        out += `<span class="tok-${kind}">${esc(m[0])}</span>`;
        last = at + m[0].length;
    }
    return out + esc(code.slice(last));
}

export function getIntegrationCode(snippet: Snippet, config: Record<string, any>, tab: "vanilla" | "react"): string {
        if (tab === "vanilla" && snippet.integration_vanilla) return snippet.integration_vanilla;
        if (tab === "react" && snippet.integration_react) return snippet.integration_react;

        const titleLower = snippet.title.toLowerCase();

        if (titleLower.includes("glass") || titleLower.includes("morphism")) {
            const bgOpacity = config.bgOpacity ?? "0.65";
            const blurValue = config.blurValue ?? "20px";
            const borderOpacity = config.borderOpacity ?? "0.80";
            const shadowOpacity = config.shadowOpacity ?? "0.06";

            if (tab === "vanilla") {
                return `<!-- Glassmorphism Card HTML -->
<div class="glass-card">
  <h3>Card Title</h3>
  <p>Native GPU-accelerated frosted glass card component.</p>
</div>

<!-- Glassmorphism CSS -->
<style>
.glass-card {
  background: rgba(255, 255, 255, ${bgOpacity});
  backdrop-filter: blur(${blurValue});
  -webkit-backdrop-filter: blur(${blurValue});
  border: 1px solid rgba(255, 255, 255, ${borderOpacity});
  border-radius: 1.5rem;
  padding: 1.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${shadowOpacity});
  color: #0f172a;
}
</style>`;
            } else {
                return `import React from 'react';

export function GlassCard() {
  return (
    <div 
      className="p-7 rounded-[1.5rem] text-slate-900 transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, ${bgOpacity})',
        backdropFilter: 'blur(${blurValue})',
        WebkitBackdropFilter: 'blur(${blurValue})',
        border: '1px solid rgba(255, 255, 255, ${borderOpacity})',
        boxShadow: '0 8px 32px rgba(0, 0, 0, ${shadowOpacity})'
      }}
    >
      <h3 className="font-extrabold text-lg mb-2">Card Title</h3>
      <p className="text-slate-600 text-sm">Native GPU-accelerated frosted glass card component.</p>
    </div>
  );
}`;
            }
        }

        if (titleLower.includes("scroll") || titleLower.includes("reveal")) {
            const staggerDelay = config.staggerDelay ?? 120;
            const threshold = config.threshold ?? 0.15;

            if (tab === "vanilla") {
                return `<!-- HTML Element with reveal markers -->
<div class="reveal-container">
  <div class="reveal-card" data-reveal>Card 1</div>
  <div class="reveal-card" data-reveal>Card 2</div>
  <div class="reveal-card" data-reveal>Card 3</div>
</div>

<!-- CSS Transition Styles -->
<style>
.reveal-card {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-card.revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>

<!-- JavaScript Intersection Observer -->
<script>
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".reveal-container");
  const delay = ${staggerDelay};

  const observer = new IntersectionObserver((entries) => {
    let index = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, index * delay);
        index++;
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: ${threshold},
    rootMargin: "0px 0px -50px 0px"
  });

  document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
});
</script>`;
            } else {
                return `import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
}

export function useScrollReveal<T extends HTMLElement>({
  threshold = ${threshold},
  rootMargin = "0px 0px -50px 0px",
  staggerDelay = ${staggerDelay},
}: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);

          const children = el.querySelectorAll("[data-reveal]");
          children.forEach((child, i) => {
            (child as HTMLElement).style.transitionDelay = \`\${i * staggerDelay}ms\`;
            child.classList.add("revealed");
          });
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, staggerDelay]);

  return { ref, isVisible };
}

// Usage Example:
// const { ref } = useScrollReveal({ threshold: ${threshold}, staggerDelay: ${staggerDelay} });
// return <div ref={ref}><div data-reveal className="reveal-card">Card</div></div>;`;
            }
        }

        if (titleLower.includes("magnetic") || titleLower.includes("hover")) {
            const strength = config.strength ?? 0.35;
            const ease = config.ease ?? 0.15;

            if (tab === "vanilla") {
                return `<!-- HTML Element -->
<button class="magnetic-btn">Hover Me</button>

<!-- JavaScript Magnetic Hover Animation -->
<script>
document.querySelectorAll(".magnetic-btn").forEach((btn) => {
  const strength = ${strength};
  const ease = ${ease};
  let pos = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let raf = null;

  function animate() {
    pos.x += (target.x - pos.x) * ease;
    pos.y += (target.y - pos.y) * ease;
    btn.style.transform = \`translate(\${pos.x}px, \${pos.y}px)\`;

    if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
      raf = requestAnimationFrame(animate);
    } else {
      raf = null;
    }
  }

  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    target = {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    };
    if (!raf) raf = requestAnimationFrame(animate);
  });

  btn.addEventListener("mouseleave", () => {
    target = { x: 0, y: 0 };
    if (!raf) raf = requestAnimationFrame(animate);
  });
});
</script>`;
            } else {
                return `import { useRef, useCallback } from "react";

interface MagneticOptions {
  strength?: number;
  ease?: number;
}

export function useMagneticHover({ strength = ${strength}, ease = ${ease} }: MagneticOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number>();

  const animate = useCallback(() => {
    pos.current.x += (target.current.x - pos.current.x) * ease;
    pos.current.y += (target.current.y - pos.current.y) * ease;

    if (ref.current) {
      ref.current.style.transform = \`translate(\${pos.current.x}px, \${pos.current.y}px)\`;
    }

    if (
      Math.abs(target.current.x - pos.current.x) > 0.1 ||
      Math.abs(target.current.y - pos.current.y) > 0.1
    ) {
      raf.current = requestAnimationFrame(animate);
    }
  }, [ease]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      target.current = {
        x: (e.clientX - centerX) * strength,
        y: (e.clientY - centerY) * strength,
      };

      if (!raf.current) raf.current = requestAnimationFrame(animate);
    },
    [strength, animate]
  );

  const onMouseLeave = useCallback(() => {
    target.current = { x: 0, y: 0 };
    raf.current = requestAnimationFrame(animate);
  }, [animate]);

  return { ref, onMouseMove, onMouseLeave };
}

// Usage Example:
// const magnetic = useMagneticHover({ strength: ${strength}, ease: ${ease} });
// return <button {...magnetic}>Hover Me</button>;`;
            }
        }

        if (titleLower.includes("clipboard") || titleLower.includes("copy")) {
            const defaultCopyText = config.defaultCopyText ? config.defaultCopyText.replace(/"/g, '\\"') : 'ssh-keygen -t ed25519 -C \\"naufal@dev\\"';

            if (tab === "vanilla") {
                return `<!-- HTML Trigger -->
<button onclick="handleCopy('${defaultCopyText}')">Copy Command</button>

<!-- Clipboard JavaScript Utility -->
<script>
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;left:-9999px;opacity:0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch {}
  document.body.removeChild(textarea);
  return ok;
}

async function handleCopy(text) {
  const success = await copyToClipboard(text);
  if (success) alert("Copied: " + text);
}
</script>`;
            } else {
                return `import React, { useState } from 'react';

// Copy utility function
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }
  document.body.removeChild(textarea);
  return success;
}

// React Component Example
export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const textToCopy = "${defaultCopyText}";

  const handleCopy = async () => {
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition"
    >
      {copied ? "✓ Copied!" : "Copy Command"}
    </button>
  );
}`;
            }
        }

        if (titleLower.includes("debounce") || titleLower.includes("cancel")) {
            const delay = config.delay ?? 500;
            const leading = config.leading ?? false;
            const trailing = config.trailing ?? true;

            if (tab === "vanilla") {
                return `<!-- JS Debounce utility function -->
<script>
function debounce(fn, delay, options = {}) {
  const { leading = ${leading}, trailing = ${trailing} } = options;
  let timer = null;
  let lastArgs = null;
  let isLeadingInvoked = false;

  return function(...args) {
    lastArgs = args;

    if (leading && !isLeadingInvoked) {
      fn(...args);
      isLeadingInvoked = true;
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (trailing && lastArgs) {
        fn(...lastArgs);
      }
      timer = null;
      lastArgs = null;
      isLeadingInvoked = false;
    }, delay);
  };
}

// Usage:
// const myInput = document.getElementById("search");
// const handleSearch = debounce((e) => {
//   console.log("Searching for:", e.target.value);
// }, ${delay});
// myInput.addEventListener("input", handleSearch);
</script>`;
            } else {
                return `import { useMemo, useEffect } from "react";

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) {
  const { leading = ${leading}, trailing = ${trailing} } = options;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let isLeadingInvoked = false;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (leading && !isLeadingInvoked) {
      fn(...args);
      isLeadingInvoked = true;
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (trailing && lastArgs) {
        fn(...lastArgs);
      }
      timer = null;
      lastArgs = null;
      isLeadingInvoked = false;
    }, delay);
  };
}

// React Search Component Example:
// export function SearchInput() {
//   const debouncedSearch = useMemo(() => {
//     return debounce((query) => apiSearch(query), ${delay});
//   }, []);
//
//   return <input type="text" onChange={(e) => debouncedSearch(e.target.value)} />;
// }`;
            }
        }

        return snippet.code;
    }
