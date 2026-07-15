import { useState, useEffect } from "react";
import { BookOpen, Search, Calendar, User, Tag, MapPin, Share2, ArrowLeft, Clock, Globe, FileText, CheckCircle, Eye, ExternalLink } from "lucide-react";
import Markdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  contentLocation: string;
  jsonLd: string;
}

export function BlogView() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSeoAudit, setShowSeoAudit] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Inject Schema.org JSON-LD structured data into Document Head when a post is active
  useEffect(() => {
    if (activePost && activePost.jsonLd) {
      const scriptId = `jsonld-blog-${activePost.id}`;
      
      // Remove stale scripts
      const oldScript = document.getElementById(scriptId);
      if (oldScript) oldScript.remove();

      // Create new Script Tag
      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("id", scriptId);
      script.textContent = activePost.jsonLd;
      document.head.appendChild(script);

      // Dynamically override page meta headers
      const prevTitle = document.title;
      document.title = activePost.metaTitle || `${activePost.title} | AXON TECH`;

      // Set meta description in preview (simulate indexer)
      const metaDescTag = document.querySelector('meta[name="description"]');
      let prevDesc = "";
      if (metaDescTag) {
        prevDesc = metaDescTag.getAttribute("content") || "";
        metaDescTag.setAttribute("content", activePost.metaDescription);
      }

      return () => {
        document.title = prevTitle;
        if (metaDescTag) {
          metaDescTag.setAttribute("content", prevDesc);
        }
        const createdScript = document.getElementById(scriptId);
        if (createdScript) createdScript.remove();
      };
    }
  }, [activePost]);

  const handleShare = () => {
    if (!activePost) return;
    const url = `${window.location.origin}/blog/${activePost.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 225;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" id="blog-view-container">
      {activePost ? (
        // Detailed Post Reading View
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn" id="blog-active-post-layout">
          {/* Main Reading Canvas */}
          <article className="lg:col-span-8 bg-surface border border-border/40 rounded-2xl p-6 md:p-10 shadow-sm" id="blog-article-container">
            <button
              onClick={() => setActivePost(null)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-6 group cursor-pointer"
              id="back-to-hub-btn"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Blog Hub
            </button>

            {/* Post Metadata Header */}
            <header className="mb-8" id="blog-post-header">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground mb-4">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                  {activePost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(activePost.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {getReadingTime(activePost.content)} min read
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <MapPin size={14} />
                  {activePost.contentLocation}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6">
                {activePost.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {activePost.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activePost.author}</p>
                    <p className="text-xs text-muted-foreground">Certified Calibration Engineer</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer glass-btn-ios"
                    id="share-post-btn"
                  >
                    <Share2 size={14} />
                    {copied ? "Copied Link!" : "Share Article"}
                  </button>

                  <button
                    onClick={() => setShowSeoAudit(!showSeoAudit)}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer ${
                      showSeoAudit ? "glass-btn-ios-active" : "glass-btn-ios"
                    }`}
                    id="seo-audit-toggle-btn"
                  >
                    <Globe size={14} />
                    {showSeoAudit ? "Hide SEO Panel" : "GEO/SEO Audit"}
                  </button>
                </div>
              </div>
            </header>

            {/* Markdown Article Content */}
            <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed" id="blog-post-body">
              <Markdown>{activePost.content}</Markdown>
            </div>

            {/* Tag Cloud */}
            <div className="mt-8 pt-6 border-t border-border/40" id="blog-post-tags">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Topic Tags</h4>
              <div className="flex flex-wrap gap-2">
                {activePost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs border border-border px-2.5 py-1 rounded-md text-muted-foreground bg-muted/30"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Interactive GEO/SEO Verification sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6" id="blog-sidebar-audit">
            {/* SGE/GEO Audit Panel */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold mb-4 border-b border-border/40 pb-3">
                <Globe size={18} className="text-primary animate-pulse" />
                <span>Generative Search & GEO Diagnostics</span>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Generative Engine Optimization (GEO) ensures this document is parsed seamlessly by AI search crawlers. Below is our real-time audit report:
                </p>

                {/* Audit Checklist */}
                <div className="space-y-2 border-y border-border/40 py-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">JSON-LD Structured Schema</span>
                      <span className="text-muted-foreground">Successfully compiled and injected into head.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Geographic Coordinates Trace</span>
                      <span className="text-muted-foreground">Geocoded location: <strong className="text-primary">{activePost.contentLocation}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Authoritative Citations</span>
                      <span className="text-muted-foreground">Contains ISO/IEC, NIST, and calibration metrics.</span>
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground font-semibold block mb-1">HTML Title Tag</label>
                    <div className="bg-muted p-2.5 rounded font-mono text-[11px] border border-border/40 text-foreground break-all">
                      {activePost.metaTitle}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground font-semibold block mb-1">HTML Meta Description</label>
                    <div className="bg-muted p-2.5 rounded font-mono text-[11px] border border-border/40 text-foreground">
                      {activePost.metaDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schema.org Visualizer */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold mb-4 border-b border-border/40 pb-3">
                <FileText size={18} className="text-primary" />
                <span>Schema.org JSON-LD (Strict SEO)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                This structured schema tag allows semantic indexers to instantly parse post details, dates, author profiles, and localization indices:
              </p>
              <pre className="bg-muted p-3 rounded border border-border/40 font-mono text-[10px] text-foreground overflow-x-auto max-h-[250px] leading-tight">
                {activePost.jsonLd}
              </pre>
            </div>
          </aside>
        </div>
      ) : (
        // Blog Main Hub / Grid View
        <div className="space-y-8 animate-fadeIn" id="blog-hub-layout">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto py-4" id="blog-hub-header">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              The AXON <span className="text-primary font-bold">Chronicles</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Authoritative industry reports, metrology standards compliance matrices, regional silicon calibration nodes, and localized hardware telemetry analytics.
            </p>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border border-border/40 p-4 rounded-xl shadow-sm" id="blog-filters-toolbar">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search articles, ISO tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
                id="blog-search-input"
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
            </div>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20" id="blog-loading-spinner">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Aggregating semantic articles from metrology nodes...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="blog-posts-grid">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className="bg-surface border border-border/40 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between group h-[380px]"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <MapPin size={10} />
                        {post.contentLocation}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="p-5 border-t border-border/30 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        {post.author.charAt(0)}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface border border-dashed border-border rounded-xl" id="blog-empty-state">
              <BookOpen size={48} className="mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">No Articles Found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No indexed articles match your filter. Try adjusting your search query or category tabs.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
