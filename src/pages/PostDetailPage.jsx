import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlogPost } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../lib/utils';
import { Clock, Eye, User, ChevronLeft, Loader, MessageSquare, Send, ShieldCheck, Calendar, Tag } from 'lucide-react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import './Blog.css';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function CommentSection({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!postId) return;
    api.get(`/posts/${postId}/comments`)
      .then(r => setComments(r.data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post(`/posts/${postId}/comments`, { content: content.trim() });
      setContent('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch { alert('Gagal mengirim komentar. Pastikan Anda login sebagai member.'); }
    finally { setSending(false); }
  };

  return (
    <div className="post-comments">
      <h3>
        <MessageSquare /> Komentar ({comments.length})
      </h3>

      {loading ? (
        <div className="blog-loading" style={{ padding: '2rem' }}>
          <Loader className="w-5 h-5 animate-spin text-[var(--cafe-brown)]" />
        </div>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          {comments.length === 0 && (
            <p style={{ color: 'var(--cafe-mocha)', fontSize: '0.875rem', fontStyle: 'italic' }}>
              Belum ada komentar. Jadilah yang pertama!
            </p>
          )}
          {comments.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="comment-card">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="comment-avatar">{(c.user_name || '?')[0]}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cafe-dark)' }}>{c.user_name}</span>
                    {c.role === 'member' && c.member_level && (
                      <span className="comment-level">{c.member_level}</span>
                    )}
                    {c.role === 'admin' && (
                      <span className="comment-admin-badge"><ShieldCheck style={{ width: 10, height: 10 }} /> Admin</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--cafe-mocha)', marginTop: '1px' }}>{formatDate(c.created_at)}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--cafe-dark)', lineHeight: 1.6 }}>{c.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Tulis komentar Anda..." rows={3} />
          <div className="comment-form-footer">
            <p>Komentar akan dimoderasi sebelum tampil</p>
            <button type="submit" disabled={sending || !content.trim()} className="comment-submit-btn">
              {sending ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Kirim
            </button>
          </div>
          {sent && <p className="comment-success">Komentar terkirim dan menunggu moderasi ✓</p>}
        </form>
      ) : (
        <div className="comment-login-cta">
          <p>Login sebagai member untuk berkomentar</p>
          <Link to="/member/login" className="comment-submit-btn">
            Login Member
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage() {
  const { slug } = useParams();
  const { data, loading } = useBlogPost(slug);
  const { user } = useAuth();
  const post = data?.post;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="app">
        <Navbar scrollToSection={() => {}} />
        <div className="flex justify-center items-center min-h-screen"><Loader className="w-8 h-8 animate-spin text-[var(--cafe-brown)]" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="app">
        <Navbar scrollToSection={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-[var(--cafe-mocha)] text-lg">Post tidak ditemukan</p>
          <Link to="/blog" className="text-[var(--cafe-brown)] hover:underline">← Kembali ke Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <SEO
        title={post.title}
        description={post.excerpt || post.seo_description || `Baca ${post.title} di Cafe Azzura`}
        canonical={`https://cafeazzura.com/blog/${post.slug}`}
        image={post.cover_image ? (mediaUrl(post.cover_image)) : undefined}
        type="article"
        published_time={post.published_at || post.created_at}
        author={post.created_by_name}
        articleSection={post.categories?.[0]?.name}
        tags={post.tags?.map(t => t.name)}
      />
      <Navbar scrollToSection={() => {}} />
      <main className="min-h-screen">
        {/* Hero header */}
        <div className={`post-detail-header ${post.cover_image ? 'has-cover' : ''}`}>
          {post.cover_image && (
            <img src={mediaUrl(post.cover_image)}
              alt="" className="post-detail-cover" />
          )}
          <div className="post-detail-header-content">
            <Link to="/blog" className="post-breadcrumb">
              <ChevronLeft className="w-4 h-4" /> Kembali ke Blog
            </Link>
            <div className="post-meta-top">
              <span className="type-badge" style={{ position: 'relative', top: 'auto', left: 'auto', background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                {post.post_type}
              </span>
              {(post.categories || []).map(c => (
                <span key={c.id} className="blog-card-category"
                  style={{ backgroundColor: (c.color || '#6F4E37') + '60', color: '#fff' }}>
                  {c.name}
                </span>
              ))}
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {post.title}
            </motion.h1>
            <div className="post-detail-meta">
              {post.created_by_name && <span><User />{post.created_by_name}</span>}
              <span><Calendar />{formatDate(post.created_at)}</span>
              <span><Eye />{post.views || 0} dilihat</span>
            </div>
          </div>
        </div>

        <div className="post-detail-body">
          {/* Tags */}
          {(post.tags || []).length > 0 && (
            <div className="post-detail-tags">
              {(post.tags || []).map(t => (
                <span key={t.id}>#{t.name}</span>
              ))}
            </div>
          )}

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="post-detail-content">
            {post.content ? (
              post.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
                if (line.trim()) return <p key={i}>{line}</p>;
                return <br key={i} />;
              })
            ) : (
              <p style={{ color: 'var(--cafe-mocha)', fontStyle: 'italic' }}>Tidak ada konten</p>
            )}
          </motion.div>

          {/* Gallery */}
          {(post.gallery || []).length > 0 && (
            <div className="post-detail-gallery">
              <h3>Galeri Foto</h3>
              <div className="post-detail-gallery-grid">
                {(post.gallery || []).map((g, i) => (
                  <img key={i} src={mediaUrl(g.image_url)}
                    alt="" loading="lazy" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments section */}
        {post.allow_comments !== false && (
          <CommentSection postId={post.id} user={user} />
        )}
      </main>
      <Footer />
    </div>
  );
}
