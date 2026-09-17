const fs = require('fs');

// Add .blog-container to Blog.css
let css = fs.readFileSync('src/pages/Blog.css', 'utf8');
const containerCSS = "\n.blog-container {\n  max-width: 1152px;\n  margin: 0 auto;\n  padding: 1.5rem 1rem;\n}\n";
css = css.replace("/* ─── Blog Page ─────────────────────────────────────────────── */", "/* ─── Blog Page ─────────────────────────────────────────────── */" + containerCSS);
fs.writeFileSync('src/pages/Blog.css', css);

// Replace Tailwind classes with blog-container in BlogPage.jsx
let jsx = fs.readFileSync('src/pages/BlogPage.jsx', 'utf8');
jsx = jsx.replace('className="max-w-6xl mx-auto px-4 py-6"', 'className="blog-container"');
fs.writeFileSync('src/pages/BlogPage.jsx', jsx);

