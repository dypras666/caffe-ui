import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlogPosts } from '../hooks/useApi';
import { mediaUrl } from '../lib/utils';
import { Search as SearchIcon, Clock, Eye, ChevronLeft, ChevronRight, Loader, FileText, Video, HelpCircle, TrendingUp, Globe, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Blog.css';

const TYPE_ICONS = { article: FileText, video: Video, faq: HelpCircle, news: TrendingUp, page: Globe };

const TYPE_LABELS = { article: 'Artikel', news: 'Berita', video: 'Video', faq: 'FAQ', page: 'Halaman' };

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading } = useBlogPosts({ type, search: search || undefined, limit: 9, page });

  const posts = data?.posts || [];
  const pagination = data?.pagination || {};

  return (
    <div className="app">
      <SEO title="Blog & Berita" description="Cerita, tips, dan informasi terbaru dari Café Azzura. Baca artikel, berita, dan FAQ seputar kopi dan cafe kami." canonical="https://cafeazzura.com/blog" />
      <Navbar scrollToSection={() => {}} />
      <main className="min-h-screen blog-page">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="blog-header">
          <div className="blog-header-content">
            <h1>Blog & Berita</h1>
            <p>Cerita, tips, dan informasi terbaru dari Café Azzura</p>
          </div>
          <div className="blog-header-decoration" />
        </motion.div>

        <section className="max-w-6xl mx-auto px-4 py-6">
          {/* Filter Bar */}
          <div className="blog-filter-bar">
            {['', 'article', 'news', 'video', 'faq'].map(t => (
              <button key={t} onClick={() => { setType(t); setPage(1); }}
                className={`blog-filter-btn ${type === t ? 'active' : ''}`}>
                {t ? TYPE_LABELS[t] : 'Semua'}
              </button>
            ))}
            <div className="blog-search-wrap">
              <SearchIcon className="search-icon" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari artikel..." />
            </div>
          </div>

          {loading ? (
            <div className="blog-loading">
              <Loader className="w-8 h-8 animate-spin text-[var(--cafe-brown)]" />
              <p>Memuat artikel...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="blog-empty">
              <BookOpen className="blog-empty-icon" />
              <p>Belum ada artikel untuk kategori ini</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post, i) => {
                const TypeIcon = TYPE_ICONS[post.post_type] || FileText;
                const imgSrc = post.cover_image ? mediaUrl(post.cover_image) : null;
                return (
                  <motion.article key={post.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="blog-card">
                    <Link to={`/blog/${post.slug}`} className="blog-card-image">
                      {imgSrc ? (
                        <img src={imgSrc} alt={post.title} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TypeIcon style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.5)' }} />
                        </div>
                      )}
                      <span className="type-badge">
                        <TypeIcon /> {TYPE_LABELS[post.post_type] || post.post_type}
                      </span>
                    </Link>
                    <div className="blog-card-body">
                      {(post.categories || []).length > 0 && (
                        <div className="blog-card-categories">
                          {(post.categories || []).slice(0, 2).map(c => (
                            <span key={c.id} className="blog-card-category"
                              style={{ backgroundColor: (c.color || '#6F4E37') + '20', color: c.color || '#6F4E37' }}>
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="blog-card-title">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                      <div className="blog-card-footer">
                        <span><Clock />{formatDate(post.created_at)}</span>
                        <span><Eye />{post.views || 0}</span>
                        {(post.tags || []).length > 0 && (
                          <span className="blog-card-tag">#{post.tags[0].name}</span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="blog-pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="blog-page-btn">
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <span className="blog-page-info">{pagination.page} / {pagination.total_pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.total_pages}
                className="blog-page-btn">
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
