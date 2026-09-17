const fs = require('fs');
let css = fs.readFileSync('src/pages/Blog.css', 'utf8');

// Fix Image Display
css = css.replace(
  /\.blog-card-image \{\s*position: relative;\s*height: 200px;/,
  ".blog-card-image {\n  display: block;\n  position: relative;\n  height: 200px;"
);

// Fix Typography for Blog Card Title
css = css.replace(
  /\.blog-card-title \{\s*font-size: 1.15rem;/,
  ".blog-card-title {\n  font-family: 'Raleway', sans-serif !important;\n  letter-spacing: normal !important;\n  font-size: 1.15rem;"
);

// Fix Typography for Blog Header H1
css = css.replace(
  /\.blog-header h1 \{\s*font-size: 3rem;/,
  ".blog-header h1 {\n  font-family: 'Raleway', sans-serif !important;\n  letter-spacing: normal !important;\n  font-size: 3rem;"
);

// Fix Typography for Post Detail H1
css = css.replace(
  /\.post-detail-header-content h1 \{\s*font-size: 2\.5rem;/,
  ".post-detail-header-content h1 {\n  font-family: 'Raleway', sans-serif !important;\n  letter-spacing: normal !important;\n  font-size: 2.5rem;"
);

// Fix Typography for Post Detail H2
css = css.replace(
  /\.post-detail-content h2 \{\s*font-size: 1\.6rem;/,
  ".post-detail-content h2 {\n  font-family: 'Raleway', sans-serif !important;\n  letter-spacing: normal !important;\n  font-size: 1.6rem;"
);

// Fix Typography for Post Detail H3
css = css.replace(
  /\.post-detail-content h3 \{\s*font-size: 1\.3rem;/,
  ".post-detail-content h3 {\n  font-family: 'Raleway', sans-serif !important;\n  letter-spacing: normal !important;\n  font-size: 1.3rem;"
);

fs.writeFileSync('src/pages/Blog.css', css);
