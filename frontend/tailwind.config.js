// ============================================
// ⚙️ TAILWIND CONFIGURATION
// ============================================
// This file configures Tailwind CSS for your project.
//
// 📚 WHAT YOU'LL LEARN:
// - Tailwind configuration
// - Content paths
// - Theme customization
// - Plugins
//
// ============================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ============================================
  // CONTENT PATHS
  // ============================================
  // Tell Tailwind where to look for class names
  // It scans these files and generates only the CSS you use
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // All JS/JSX files in src/
    "./public/index.html"           // HTML file
  ],
  
  // LEARNING NOTE:
  // Tailwind uses "tree-shaking" to remove unused styles.
  // Only classes you actually use in these files will be in the final CSS.
  // This keeps your CSS file small!

  // ============================================
  // THEME CUSTOMIZATION
  // ============================================
  // Extend or override Tailwind's default theme
  
  theme: {
    extend: {
      // TODO: Add custom colors (optional)
      // Hint:
      // colors: {
      //   'brand-blue': '#1DA1F2',
      //   'brand-green': '#00BA7C',
      // },
      
      // TODO: Add custom fonts (optional)
      // Hint:
      // fontFamily: {
      //   'sans': ['Inter', 'sans-serif'],
      //   'heading': ['Poppins', 'sans-serif'],
      // },
      
      // TODO: Add custom spacing (optional)
      // Hint:
      // spacing: {
      //   '128': '32rem',
      //   '144': '36rem',
      // },
      
      // TODO: Add custom animations (optional)
      // Hint:
      // animation: {
      //   'spin-slow': 'spin 3s linear infinite',
      //   'bounce-slow': 'bounce 2s infinite',
      // },
      
      // TODO: Add custom breakpoints (optional)
      // Hint:
      // screens: {
      //   'xs': '475px',
      //   '3xl': '1920px',
      // },
    },
  },
  
  // ============================================
  // PLUGINS
  // ============================================
  // Add Tailwind plugins for extra functionality
  
  plugins: [
    // TODO: Add plugins (optional)
    // Hint:
    // require('@tailwindcss/forms'),        // Better form styles
    // require('@tailwindcss/typography'),   // Prose classes for content
    // require('@tailwindcss/aspect-ratio'), // Aspect ratio utilities
  ],
  
  // ============================================
  // DARK MODE (Optional)
  // ============================================
  // Uncomment to enable dark mode
  
  // darkMode: 'class',  // or 'media' for system preference
  
  // LEARNING NOTE:
  // With 'class' mode, add 'dark' class to <html> to enable dark mode
  // Then use: <div className="bg-white dark:bg-gray-900">
};

// ============================================
// 📝 LEARNING NOTES:
// ============================================
//
// Q: What is this file for?
// A: It configures how Tailwind generates CSS for your project.
//    You can customize colors, fonts, spacing, etc.
//
// Q: What is the content array?
// A: Paths to files that contain Tailwind classes.
//    Tailwind scans these to know which styles to generate.
//
// Q: What is theme.extend?
// A: Adds to Tailwind's default theme without replacing it.
//    Use 'theme' (without extend) to replace defaults.
//
// Q: What are plugins?
// A: Official or community packages that add features to Tailwind.
//    Example: @tailwindcss/forms improves form styling.
//
// Q: How do I use custom colors?
// A: After adding to config:
//    <div className="bg-brand-blue text-brand-green">
//
// ============================================
// 🎨 CUSTOMIZATION EXAMPLES:
// ============================================
//
// CUSTOM COLORS:
// colors: {
//   primary: {
//     50: '#eff6ff',
//     100: '#dbeafe',
//     500: '#3b82f6',
//     900: '#1e3a8a',
//   },
// }
// Use: bg-primary-500
//
// CUSTOM FONTS:
// fontFamily: {
//   display: ['Poppins', 'sans-serif'],
//   body: ['Inter', 'sans-serif'],
// }
// Use: font-display, font-body
//
// CUSTOM SPACING:
// spacing: {
//   '18': '4.5rem',
//   '88': '22rem',
// }
// Use: p-18, m-88
//
// CUSTOM ANIMATIONS:
// animation: {
//   'fade-in': 'fadeIn 0.5s ease-in-out',
// },
// keyframes: {
//   fadeIn: {
//     '0%': { opacity: '0' },
//     '100%': { opacity: '1' },
//   },
// }
// Use: animate-fade-in
//
// ============================================
// 🚀 USEFUL PLUGINS:
// ============================================
//
// @tailwindcss/forms
// - Better default styles for form elements
// - Install: npm install @tailwindcss/forms
//
// @tailwindcss/typography
// - Prose classes for rich text content
// - Install: npm install @tailwindcss/typography
// - Use: <article className="prose">
//
// @tailwindcss/aspect-ratio
// - Maintain aspect ratios for responsive media
// - Install: npm install @tailwindcss/aspect-ratio
// - Use: <div className="aspect-w-16 aspect-h-9">
//
// @tailwindcss/line-clamp
// - Truncate text to specific number of lines
// - Install: npm install @tailwindcss/line-clamp
// - Use: <p className="line-clamp-3">
//
// ============================================
// 🎯 DARK MODE SETUP:
// ============================================
//
// 1. Enable in config:
//    darkMode: 'class',
//
// 2. Add toggle in your app:
//    const [dark, setDark] = useState(false);
//    useEffect(() => {
//      if (dark) {
//        document.documentElement.classList.add('dark');
//      } else {
//        document.documentElement.classList.remove('dark');
//      }
//    }, [dark]);
//
// 3. Use dark variants:
//    <div className="bg-white dark:bg-gray-900">
//    <p className="text-gray-900 dark:text-white">
//
// ============================================
// 📚 RESOURCES:
// ============================================
//
// - Tailwind Docs: https://tailwindcss.com/docs
// - Config Reference: https://tailwindcss.com/docs/configuration
// - Theme Reference: https://tailwindcss.com/docs/theme
// - Plugins: https://tailwindcss.com/docs/plugins
// - Color Palette: https://tailwindcss.com/docs/customizing-colors
//
// ============================================
