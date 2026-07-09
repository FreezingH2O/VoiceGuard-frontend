import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Dark marketing/live surface (design.md §3 dark palette) ──
        ink: {
          950: '#050505', // page canvas — true near-black, per design.md
          900: '#0A0A0A', // raised sections / bands
          navy: '#0F0B1E', // optional deep-navy tint sections
        },
        surface: {
          800: '#161B3D', // cards on dark
          700: '#1F2650', // card hover / borders on dark
        },
        // secondary text tiers on dark (text-hi = white)
        mist: {
          300: '#B4B9D8', // text-mid — secondary text on dark
          500: '#7C82A8', // text-low — captions on dark
        },
        teal: { 400: '#34D6C4' }, // authentic / real voice / safe — glows on dark

        // ── VoiceGuard app-preview dark theme (matches the mobile mockup) ──
        night: '#0A0E20', // preview phone screen canvas — deep desaturated navy
        panel: '#161B33', // raised cards inside the preview phone
        'panel-2': '#1E2543', // nested / hover surface inside the preview phone
        gold: { 400: '#F7B53F', 500: '#E88B2C', 600: '#C9741F' }, // amber accent + status hero

        // ── Existing light-app tokens (kept — do not change) ──
        navy: {
          950: '#0d1545',
          900: '#1B2255',
          800: '#121f5a',
          700: '#111645',
          600: '#000a35',
          bar: '#0a1240',
        },
        blue: { 600: '#2B3A9F', 500: '#3B4CC0' }, // 500 = secondary accent / gradient depth
        coral: { 500: '#EB7449', 400: '#F58C63' }, // 400 = hover/lighter coral
        warn: { 500: '#EB7449', 100: '#FCEAE2' },
        slate: {
          900: '#14193B',
          600: '#4A5178',
          400: '#8B91B5',
          200: '#D9DCEA',
          100: '#EEF0F7',
          50: '#F7F8FC',
        },
        safe: { 500: '#2E9E6B', 100: '#E2F4EB' },
        // 600 = light-mode danger; 500 = brighter danger that reads on near-black (dark)
        danger: { 600: '#D93A3A', 500: '#F5455C', 100: '#FBE5E5' },
        card: '#121f5a',
      },
      fontFamily: {
        // Resolve to CSS vars set in index.css — swap with the lang toggle
        // (html[lang] selector), since Latin faces have no Thai glyphs.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // dark web display scale (design.md §3)
        'web-hero': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.02em' }],
        'web-section': ['clamp(2rem, 4vw, 2.5rem)', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.015em' }],
        'web-sub': ['20px', { lineHeight: '30px', fontWeight: '400' }],
        'web-body': ['17px', { lineHeight: '28px', fontWeight: '400' }],
        'web-caption': ['14px', { lineHeight: '22px', fontWeight: '500' }],

        'web-display': ['56px', { lineHeight: '64px', fontWeight: '700' }],
        'web-h1': ['36px', { lineHeight: '44px', fontWeight: '700' }],

        display: ['40px', { lineHeight: '48px', fontWeight: '700' }],
        h1: ['26px', { lineHeight: '34px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        small: ['13px', { lineHeight: '20px', fontWeight: '400' }],
        score: ['32px', { lineHeight: '40px', fontWeight: '700' }],

        'h1-mobile': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'alert-title': ['20px', { lineHeight: '26px', fontWeight: '700' }],
        'screen-header': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-sm': ['15px', { lineHeight: '20px', fontWeight: '600' }],
        label: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'ring-value': ['16px', { lineHeight: '20px', fontWeight: '700' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        micro: ['11px', { lineHeight: '14px', fontWeight: '500' }],
        tag: ['10px', { lineHeight: '13px', fontWeight: '600' }],
        'score-micro': ['9px', { lineHeight: '12px', fontWeight: '600' }],
      },
      borderRadius: {
        'web-card': '20px', // web cards (design.md §6)
        card: '16px',
        button: '12px',
        input: '10px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(27,34,85,0.08)',
        // dark cards use glow over heavy shadow (design.md §6)
        'glow-coral': '0 0 0 1px rgba(235,116,73,0.35), 0 12px 40px -12px rgba(235,116,73,0.45)',
        'glow-teal': '0 0 0 1px rgba(52,214,196,0.35), 0 12px 40px -12px rgba(52,214,196,0.35)',
        'glow-soft': '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'glow-grad': 'linear-gradient(135deg, #2B3A9F 0%, #EB7449 100%)',
        'glow-grad-soft': 'linear-gradient(135deg, rgba(43,58,159,0.9) 0%, rgba(235,116,73,0.9) 100%)',
        // App-preview amber hero + metric tiles (mobile mockup)
        'gold-grad': 'linear-gradient(135deg, #F7B53F 0%, #E17C2A 100%)',
        'metric-tile': 'linear-gradient(155deg, #3E2411 0%, #6E3A18 55%, #9C4C1E 100%)',
        'role-grad': 'linear-gradient(140deg, #F49A34 0%, #E4732A 100%)',
      },
      spacing: {
        tap: '44px',
        'tap-elder': '56px',
      },
      maxWidth: {
        phone: '428px',
        content: '1120px',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -3%) scale(1.08)' },
          '66%': { transform: 'translate(-3%, 4%) scale(0.96)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 24s ease-in-out infinite',
        shimmer: 'shimmer 5s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
