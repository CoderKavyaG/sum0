// ============================================
// 📦 POSTCSS CONFIGURATION
// ============================================
// PostCSS is a tool that processes CSS with JavaScript plugins.
// Tailwind CSS uses PostCSS to generate styles.
//
// 📚 WHAT YOU'LL LEARN:
// - What PostCSS is
// - How Tailwind integrates with PostCSS
// - What Autoprefixer does
//
// ============================================

module.exports = {
  plugins: {
    // ============================================
    // TAILWIND CSS
    // ============================================
    // Processes @tailwind directives in your CSS
    // Generates utility classes based on your config
    tailwindcss: {},
    
    // ============================================
    // AUTOPREFIXER
    // ============================================
    // Automatically adds vendor prefixes to CSS
    // Example: transform → -webkit-transform, -ms-transform, transform
    // Ensures compatibility with older browsers
    autoprefixer: {},
  },
};

// ============================================
// 📝 LEARNING NOTES:
// ============================================
//
// Q: What is PostCSS?
// A: A tool for transforming CSS with JavaScript plugins.
//    Think of it like Babel for CSS.
//
// Q: Why do we need this?
// A: Tailwind CSS is a PostCSS plugin.
//    This config tells PostCSS to use Tailwind.
//
// Q: What is Autoprefixer?
// A: A plugin that adds vendor prefixes automatically.
//    You write: display: flex;
//    It outputs: display: -webkit-flex; display: flex;
//
// Q: Do I need to modify this file?
// A: Usually no! This default config works for most projects.
//
// Q: What other PostCSS plugins exist?
// A: - cssnano: Minifies CSS
//    - postcss-nested: Allows nested CSS
//    - postcss-import: Import CSS files
//    - And many more!
//
// ============================================
// 🎯 HOW IT WORKS:
// ============================================
//
// 1. You write CSS with @tailwind directives
// 2. PostCSS processes your CSS
// 3. Tailwind plugin generates utility classes
// 4. Autoprefixer adds vendor prefixes
// 5. Final CSS is output to your build
//
// ============================================
// 🚀 ADVANCED CONFIGURATION (Optional):
// ============================================
//
// Add more plugins:
// module.exports = {
//   plugins: {
//     tailwindcss: {},
//     autoprefixer: {},
//     ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
//   },
// };
//
// This adds cssnano (CSS minifier) only in production.
//
// ============================================
