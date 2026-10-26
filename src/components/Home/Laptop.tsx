"use client";

/**
 * Navy laptop by the pass card's top-right corner. At rest it shows the back of the lid
 * (embossed FVL mark); on hover / focus it turns around to face you, screen reading
 * "Stacks & Projects". Click jumps to the Stack section. Drawn as inline SVG so the
 * text uses the site font; no brand marks.
 */
const BACK = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 240 170\">\n  <defs>\n    <linearGradient id=\"lpbShell\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#5a7fa6\"/><stop offset=\".35\" stop-color=\"#2f5378\"/><stop offset=\".8\" stop-color=\"#16314f\"/><stop offset=\"1\" stop-color=\"#0f2740\"/>\n    </linearGradient>\n    <linearGradient id=\"lpbSheen\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".22\"/><stop offset=\".35\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".7\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\".06\"/>\n    </linearGradient>\n    <linearGradient id=\"lpbSide\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".25\"/><stop offset=\".06\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".94\" stop-color=\"#000\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#000\" stop-opacity=\".25\"/>\n    </linearGradient>\n    <linearGradient id=\"lpbHinge\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#0b1d30\"/><stop offset=\"1\" stop-color=\"#1b3654\"/>\n    </linearGradient>\n  </defs>\n  <!-- lid shell -->\n  <rect x=\"26\" y=\"12\" width=\"188\" height=\"128\" rx=\"9\" fill=\"url(#lpbShell)\"/>\n  <rect x=\"26\" y=\"12\" width=\"188\" height=\"128\" rx=\"9\" fill=\"url(#lpbSide)\"/>\n  <rect x=\"26\" y=\"12\" width=\"188\" height=\"128\" rx=\"9\" fill=\"url(#lpbSheen)\"/>\n  <!-- edges: bright top rim, fine outline -->\n  <path d=\"M35 12.8 H205\" stroke=\"#9fc0de\" stroke-opacity=\".75\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>\n  <rect x=\"26.5\" y=\"12.5\" width=\"187\" height=\"127\" rx=\"8.5\" fill=\"none\" stroke=\"#0b1d30\" stroke-opacity=\".55\"/>\n  <!-- embossed FVL mark -->\n  <g style=\"font-family: var(--font-geist-sans), Inter, -apple-system, Helvetica, Arial, sans-serif\" font-size=\"22\" font-weight=\"800\" text-anchor=\"middle\" letter-spacing=\"1\">\n    <text x=\"120\" y=\"83.6\" fill=\"#9fc0de\" fill-opacity=\".22\">FVL</text>\n    <text x=\"120\" y=\"83\" fill=\"#0c2238\" fill-opacity=\".55\">FVL</text>\n  </g>\n  <!-- hinge lip + feet -->\n  <rect x=\"34\" y=\"138\" width=\"172\" height=\"5\" rx=\"2.5\" fill=\"url(#lpbHinge)\"/>\n  <rect x=\"44\" y=\"142.5\" width=\"18\" height=\"3.4\" rx=\"1.7\" fill=\"#0a1a2b\"/>\n  <rect x=\"178\" y=\"142.5\" width=\"18\" height=\"3.4\" rx=\"1.7\" fill=\"#0a1a2b\"/>\n</svg>\n";
const FRONT = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 240 170\">\n  <defs>\n    <linearGradient id=\"lpfScreen\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#0b1f33\"/><stop offset=\".6\" stop-color=\"#0d2a42\"/><stop offset=\"1\" stop-color=\"#14395a\"/>\n    </linearGradient>\n    <linearGradient id=\"lpfRib1\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n      <stop offset=\"0\" stop-color=\"#1b4f72\" stop-opacity=\"0\"/><stop offset=\".5\" stop-color=\"#3a99c9\"/><stop offset=\"1\" stop-color=\"#75c2e6\"/>\n    </linearGradient>\n    <linearGradient id=\"lpfRib2\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#75c2e6\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#1b4f72\" stop-opacity=\"0\"/>\n    </linearGradient>\n    <linearGradient id=\"lpfGlass\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".14\"/><stop offset=\".45\" stop-color=\"#fff\" stop-opacity=\"0\"/>\n    </linearGradient>\n    <linearGradient id=\"lpfBase\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0\" stop-color=\"#3f6489\"/><stop offset=\".45\" stop-color=\"#22426a\"/><stop offset=\"1\" stop-color=\"#11273f\"/>\n    </linearGradient>\n    <linearGradient id=\"lpfBaseSide\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">\n      <stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".18\"/><stop offset=\".05\" stop-color=\"#fff\" stop-opacity=\"0\"/><stop offset=\".95\" stop-color=\"#000\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#000\" stop-opacity=\".25\"/>\n    </linearGradient>\n    <clipPath id=\"lpfDisp\"><rect x=\"33\" y=\"19\" width=\"174\" height=\"111\" rx=\"3\"/></clipPath>\n  </defs>\n  <!-- lid: navy frame + black bezel -->\n  <rect x=\"26\" y=\"12\" width=\"188\" height=\"126\" rx=\"9\" fill=\"#1b3654\"/>\n  <rect x=\"27.2\" y=\"13.2\" width=\"185.6\" height=\"123.6\" rx=\"8\" fill=\"#0a0f15\"/>\n  <path d=\"M35 12.8 H205\" stroke=\"#9fc0de\" stroke-opacity=\".6\" stroke-width=\"1\" stroke-linecap=\"round\"/>\n  <!-- display -->\n  <rect x=\"33\" y=\"19\" width=\"174\" height=\"111\" rx=\"3\" fill=\"url(#lpfScreen)\"/>\n  <g clip-path=\"url(#lpfDisp)\">\n    <path d=\"M20 90 C60 60 100 115 150 70 S200 40 215 30 L215 10 L20 10 Z\" fill=\"url(#lpfRib2)\" opacity=\".5\"/>\n    <path d=\"M50 140 C80 85 120 92 148 60 C168 36 185 30 215 32 L215 54 C188 52 174 60 156 80 C126 114 92 108 72 140 Z\" fill=\"url(#lpfRib1)\" opacity=\".9\"/>\n    <path d=\"M95 140 C120 108 155 112 176 84 C188 68 202 64 215 64 L215 76 C202 76 192 82 182 96 C160 124 130 120 112 140 Z\" fill=\"#75c2e6\" opacity=\".33\"/>\n    <rect x=\"33\" y=\"19\" width=\"174\" height=\"111\" fill=\"url(#lpfGlass)\"/>\n  </g>\n  <g style=\"font-family: var(--font-geist-sans), Inter, -apple-system, Helvetica, Arial, sans-serif\" font-weight=\"800\" fill=\"#fff\" letter-spacing=\"-0.4\">\n    <text x=\"46\" y=\"72\" font-size=\"17\">Stacks &amp;</text>\n    <text x=\"46\" y=\"92\" font-size=\"17\">Projects</text>\n  </g>\n  <rect x=\"46\" y=\"99\" width=\"24\" height=\"2.4\" rx=\"1.2\" fill=\"#75c2e6\"/>\n  <!-- camera -->\n  <circle cx=\"120\" cy=\"16.2\" r=\"1\" fill=\"#2a3440\"/>\n  <!-- base (keyboard half seen edge-on) -->\n  <path d=\"M14 137.5 H226 Q229 137.5 228.4 140.5 L227.6 143.6 Q226.8 147 222.8 147 H17.2 Q13.2 147 12.4 143.6 L11.6 140.5 Q11 137.5 14 137.5 Z\" fill=\"url(#lpfBase)\"/>\n  <path d=\"M14 137.5 H226 Q229 137.5 228.4 140.5 L227.6 143.6 Q226.8 147 222.8 147 H17.2 Q13.2 147 12.4 143.6 L11.6 140.5 Q11 137.5 14 137.5 Z\" fill=\"url(#lpfBaseSide)\"/>\n  <path d=\"M16 138.2 H224\" stroke=\"#a9c6e2\" stroke-opacity=\".55\" stroke-width=\".9\" stroke-linecap=\"round\"/>\n  <!-- thumb notch -->\n  <path d=\"M104 137.5 H136 V138.8 Q136 140.4 134.4 140.4 H105.6 Q104 140.4 104 138.8 Z\" fill=\"#0f2337\" opacity=\".8\"/>\n  <!-- feet -->\n  <rect x=\"30\" y=\"146.4\" width=\"16\" height=\"3\" rx=\"1.5\" fill=\"#0a1a2b\"/>\n  <rect x=\"194\" y=\"146.4\" width=\"16\" height=\"3\" rx=\"1.5\" fill=\"#0a1a2b\"/>\n</svg>\n";

export default function Laptop() {
    return (
        <a className="laptop" href="#tech-stack" aria-label="Stacks & Projects: see my tech stack and projects">
            <span className="lp-float" aria-hidden="true">
                <span className="lp-flip">
                    <span className="lp-face lp-back" dangerouslySetInnerHTML={{ __html: BACK }} />
                    <span className="lp-face lp-front" dangerouslySetInnerHTML={{ __html: FRONT }} />
                </span>
            </span>
            <span className="lp-shadow" aria-hidden="true" />
            <style jsx>{`
                .laptop {
                    position: relative;
                    display: block;
                    width: 232px;
                    aspect-ratio: 240 / 170;
                    text-decoration: none;
                    cursor: pointer;
                    outline: none;
                    perspective: 900px;
                    -webkit-tap-highlight-color: transparent;
                }
                .laptop:hover {
                    opacity: 1; /* the site-wide link hover dims links */
                }
                .lp-float {
                    position: absolute;
                    inset: 0;
                    transform-style: preserve-3d;
                    animation: lp-float 6s ease-in-out infinite;
                }
                .lp-flip {
                    position: absolute;
                    inset: 0;
                    transform-style: preserve-3d;
                    transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
                }
                .laptop:hover .lp-flip,
                .laptop:focus-visible .lp-flip {
                    transform: rotateY(180deg);
                }
                .lp-face {
                    position: absolute;
                    inset: 0;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .lp-front {
                    transform: rotateY(180deg);
                }
                .lp-face :global(svg) {
                    display: block;
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }
                /* soft floating shadow, like the earbud case and the file */
                .lp-shadow {
                    position: absolute;
                    left: 12%;
                    right: 12%;
                    bottom: -8%;
                    height: 12%;
                    border-radius: 50%;
                    background: radial-gradient(closest-side, rgba(13, 42, 66, 0.38), rgba(13, 42, 66, 0));
                    filter: blur(5px);
                    animation: lp-shadow 6s ease-in-out infinite;
                    pointer-events: none;
                }
                @keyframes lp-float {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-7px);
                    }
                }
                @keyframes lp-shadow {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(0.9);
                        opacity: 0.7;
                    }
                }
                .laptop:focus-visible .lp-float {
                    outline: 2px dashed #3a99c9;
                    outline-offset: 6px;
                    border-radius: 14px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .lp-float,
                    .lp-shadow {
                        animation: none;
                    }
                    .lp-flip {
                        transition-duration: 0.01ms;
                    }
                }
            `}</style>
        </a>
    );
}
