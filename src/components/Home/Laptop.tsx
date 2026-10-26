"use client";

/**
 * Silver laptop resting by the pass card's top-right corner, screen reading
 * "Stacks & Projects". Floats gently; hover lifts it; click jumps to the Stack section.
 * Drawn as inline SVG (same white/silver shading as the earbud case) so the screen text
 * uses the site font.
 */
const SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 240 210\">\n  <defs>\n    <linearGradient id=\"lpLid\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#eef1f4\"/><stop offset=\".5\" stop-color=\"#d6dce1\"/><stop offset=\"1\" stop-color=\"#b9c1c8\"/>\n    </linearGradient>\n    <linearGradient id=\"lpScreen\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#0b1f33\"/><stop offset=\".6\" stop-color=\"#0d2a42\"/><stop offset=\"1\" stop-color=\"#14395a\"/>\n    </linearGradient>\n    <linearGradient id=\"lpRibbon1\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n      <stop offset=\"0\" stop-color=\"#1b4f72\" stop-opacity=\"0\"/><stop offset=\".5\" stop-color=\"#3a99c9\"/><stop offset=\"1\" stop-color=\"#75c2e6\"/>\n    </linearGradient>\n    <linearGradient id=\"lpRibbon2\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#75c2e6\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#1b4f72\" stop-opacity=\"0\"/>\n    </linearGradient>\n    <linearGradient id=\"lpGlass\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".16\"/><stop offset=\".45\" stop-color=\"#fff\" stop-opacity=\"0\"/>\n    </linearGradient>\n    <linearGradient id=\"lpDeck\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#e3e8ec\"/><stop offset=\".55\" stop-color=\"#f4f6f8\"/><stop offset=\"1\" stop-color=\"#ffffff\"/>\n    </linearGradient>\n    <linearGradient id=\"lpEdge\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n      <stop offset=\"0\" stop-color=\"#9aa4ad\"/><stop offset=\".5\" stop-color=\"#c3cad0\"/><stop offset=\"1\" stop-color=\"#8d98a3\"/>\n    </linearGradient>\n    <linearGradient id=\"lpPad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#e6eaee\"/><stop offset=\"1\" stop-color=\"#f3f5f7\"/>\n    </linearGradient>\n    <clipPath id=\"lpDisp\"><rect x=\"5\" y=\"5\" width=\"150\" height=\"92\" rx=\"2.5\"/></clipPath>\n    <filter id=\"lpBlur\" x=\"-30%\" y=\"-100%\" width=\"160%\" height=\"300%\"><feGaussianBlur stdDeviation=\"6\"/></filter>\n  </defs>\n\n  <!-- floating shadow -->\n  <ellipse class=\"lp-shadow\" cx=\"112\" cy=\"196\" rx=\"78\" ry=\"7\" fill=\"#0d2a42\" opacity=\".22\" filter=  <g class=\"lp-body\">\n\"url(#lpBlur)\"/>\n\n  <!-- deck (keyboard half), drawn in its own plane -->\n  <g transform=\"matrix(0.975,-0.1375,-0.3,0.58,40,140)\">\n    <rect x=\"0\" y=\"0\" width=\"160\" height=\"100\" rx=\"7\" fill=\"url(#lpDeck)\"/>\n    <rect x=\"0.5\" y=\"0.5\" width=\"159\" height=\"99\" rx=\"6.5\" fill=\"none\" stroke=\"#8d98a3\" stroke-opacity=\".45\"/>\n    <!-- speaker grilles -->\n    <rect x=\"5\" y=\"8\" width=\"8\" height=\"46\" rx=\"2\" fill=\"#cfd5da\"/>\n    <rect x=\"147\" y=\"8\" width=\"8\" height=\"46\" rx=\"2\" fill=\"#cfd5da\"/>\n    <!-- keyboard well -->\n    <rect x=\"17\" y=\"7\" width=\"126\" height=\"48\" rx=\"3\" fill=\"#1d232a\"/>\n    <g fill=\"#2f363e\">\n      <rect x=\"20.0\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"28.3\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"36.6\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"44.9\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"53.2\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"61.5\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"69.8\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"78.1\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"86.4\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"94.7\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"103.0\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"111.3\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"119.6\" y=\"10.0\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"20.0\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"28.3\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"36.6\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"44.9\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"53.2\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"61.5\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"69.8\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"78.1\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"86.4\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"94.7\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"103.0\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"111.3\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"119.6\" y=\"18.6\" width=\"6.9\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"20.0\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"29.1\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"38.2\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"47.3\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"56.4\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"65.5\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"74.6\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"83.7\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"92.8\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"101.9\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"111.0\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"120.1\" y=\"27.2\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"20.0\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"29.1\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"38.2\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"47.3\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"56.4\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"65.5\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"74.6\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"83.7\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"92.8\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"101.9\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"111.0\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"120.1\" y=\"35.8\" width=\"7.7\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"20.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"31.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"42.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"53.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"64.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"75.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"86.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"97.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"108.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n      <rect x=\"119.0\" y=\"44.4\" width=\"9.6\" height=\"6.6\" rx=\"1.1\"/>\n    </g>\n    <!-- trackpad -->\n    <rect x=\"48\" y=\"61\" width=\"64\" height=\"33\" rx=\"3.5\" fill=\"url(#lpPad)\" stroke=\"#a3adb6\" stroke-opacity=\".55\" stroke-width=\".8\"/>\n    <!-- front lip highlight -->\n    <path d=\"M7 99.2 H153\" stroke=\"#fff\" stroke-width=\"1.2\"/>\n  </g>\n  <!-- deck thickness: front and right edges -->\n  <path d=\"M10 198 L166 176 L166 180.5 Q165.5 182 163.5 182.3 L13 203.3 Q10.4 203.4 10 201.5 Z\" fill=\"url(#lpEdge)\"/>\n  <path d=\"M166 176 L196 118 L196 121.5 L166 180.5 Z\" fill=\"#a9b2ba\"/>\n\n  <!-- hinge -->\n  <path d=\"M40 140 L196 118\" stroke=\"#6f7a85\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>\n\n  <!-- lid -->\n  <g transform=\"matrix(0.975,-0.1375,-0.08,1.12,48,28)\">\n    <!-- lid back edge peeking (thickness) -->\n    <rect x=\"1.6\" y=\"-1.8\" width=\"160\" height=\"102\" rx=\"7\" fill=\"#aeb6bd\"/>\n    <rect x=\"0\" y=\"0\" width=\"160\" height=\"102\" rx=\"7\" fill=\"#151b21\"/>\n    <rect x=\"0.4\" y=\"0.4\" width=\"159.2\" height=\"101.2\" rx=\"6.6\" fill=\"none\" stroke=\"#c3cad0\" stroke-width=\".8\"/>\n    <!-- display -->\n    <rect x=\"5\" y=\"5\" width=\"150\" height=\"92\" rx=\"2.5\" fill=\"url(#lpScreen)\"/>\n    <g clip-path=\"url(#lpDisp)\">\n      <path d=\"M-10 70 C30 40 70 95 120 50 S170 20 175 10 L175 -5 L-10 -5 Z\" fill=\"url(#lpRibbon2)\" opacity=\".55\"/>\n      <path d=\"M20 110 C50 60 90 70 115 40 C135 18 150 12 175 14 L175 34 C150 30 138 40 122 58 C95 90 60 85 40 110 Z\" fill=\"url(#lpRibbon1)\" opacity=\".9\"/>\n      <path d=\"M60 110 C85 80 120 86 140 60 C152 46 165 42 175 42 L175 52 C165 52 155 58 145 70 C125 95 95 92 78 110 Z\" fill=\"#75c2e6\" opacity=\".35\"/>\n      <rect x=\"5\" y=\"5\" width=\"150\" height=\"92\" fill=\"url(#lpGlass)\"/>\n    </g>\n    <text x=\"16\" y=\"58\" style=\"font-family: var(--font-geist-sans), Inter, -apple-system, Helvetica, Arial, sans-serif\" font-size=\"15\" font-weight=\"800\" fill=\"#fff\" letter-spacing=\"-0.4\">Stacks &amp;</text>\n    <text x=\"16\" y=\"75\" style=\"font-family: var(--font-geist-sans), Inter, -apple-system, Helvetica, Arial, sans-serif\" font-size=\"15\" font-weight=\"800\" fill=\"#fff\" letter-spacing=\"-0.4\">Projects</text>\n    <rect x=\"16\" y=\"81\" width=\"22\" height=\"2.2\" rx=\"1.1\" fill=\"#75c2e6\"/>\n    <!-- camera -->\n    <circle cx=\"80\" cy=\"2.6\" r=\"0.9\" fill=\"#3a434c\"/>\n  </g>\n  </g>\n</svg>\n";

export default function Laptop() {
    return (
        <a className="laptop" href="#tech-stack" aria-label="Stacks & Projects: see my tech stack and projects">
            <span className="lp-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SVG }} />
            <style jsx>{`
                .laptop {
                    display: block;
                    width: 224px;
                    text-decoration: none;
                    cursor: pointer;
                    outline: none;
                    -webkit-tap-highlight-color: transparent;
                }
                .laptop:hover {
                    opacity: 1; /* the site-wide link hover dims links */
                }
                .lp-art {
                    display: block;
                }
                .lp-art :global(svg) {
                    display: block;
                    width: 100%;
                    height: auto;
                    overflow: visible;
                }
                .lp-art :global(.lp-body) {
                    transform-box: fill-box;
                    transform-origin: 50% 60%;
                    animation: lp-float 6s ease-in-out infinite;
                    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .lp-art :global(.lp-shadow) {
                    transform-box: fill-box;
                    transform-origin: 50% 50%;
                    animation: lp-shadow 6s ease-in-out infinite;
                }
                @keyframes lp-float {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-7px) rotate(-1deg);
                    }
                }
                @keyframes lp-shadow {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.22;
                    }
                    50% {
                        transform: scale(0.9);
                        opacity: 0.15;
                    }
                }
                .laptop:hover .lp-art :global(.lp-body),
                .laptop:focus-visible .lp-art :global(.lp-body) {
                    animation-play-state: paused;
                }
                .laptop:hover .lp-art :global(svg),
                .laptop:focus-visible .lp-art :global(svg) {
                    transform: translateY(-6px) scale(1.04) rotate(-2deg);
                }
                .lp-art :global(svg) {
                    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .laptop:focus-visible .lp-art {
                    outline: 2px dashed #3a99c9;
                    outline-offset: 4px;
                    border-radius: 14px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .lp-art :global(.lp-body),
                    .lp-art :global(.lp-shadow) {
                        animation: none;
                    }
                }
            `}</style>
        </a>
    );
}
