// src/pages/CareerBlog.tsx
// ============================================
// CAREER HUB - Real-time Job Board & Career Blog
// Institutional Level with Auto-updating Jobs
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdSearch, MdLocationOn, MdWork, MdBusiness, MdArrowForward,
  MdBookmark, MdShare, MdAccessTime, MdPeople, MdVerified,
  MdTrendingUp, MdFlashOn, MdRefresh, MdFilterList,
  MdClose, MdKeyboardArrowDown, MdKeyboardArrowUp,
  MdLink, MdCalendarToday, MdPerson, MdCategory,
  MdRssFeed, MdPublic, MdLanguage, MdAttachMoney,
  MdStar, MdStarBorder, MdInfo, MdCheckCircle,
} from 'react-icons/md';
import { FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import Loading from '../components/Loading';
import { jobScraper, JobListing } from '../api/jobScraper';
import toast from 'react-hot-toast';

// ============================================
// BLOG POSTS - Admin Created (3 with 400+ words)
// ============================================

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorTitle: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
  views: number;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Work: How AI is Reshaping the Global Job Market in 2024',
    excerpt: 'Artificial intelligence is transforming industries at an unprecedented pace. Discover how to future-proof your career and leverage AI for professional growth.',
    content: `
      <p>The global job market is experiencing a seismic shift as artificial intelligence and automation technologies continue to evolve at breakneck speed. By 2024, AI has become an integral part of virtually every industry, from healthcare and finance to manufacturing and creative arts. This transformation brings both challenges and unprecedented opportunities for professionals worldwide.</p>

      <h3>The AI Revolution: Understanding the Landscape</h3>
      <p>According to recent studies, over 85% of organizations have accelerated their AI adoption in the past year alone. This rapid integration is creating entirely new job categories while simultaneously transforming existing roles. The World Economic Forum predicts that AI will displace 85 million jobs by 2025, but it will also create 97 million new roles across 26 countries.</p>

      <p>What does this mean for the average professional? The key lies in adaptability and continuous learning. Skills that were once considered niche are becoming mainstream requirements. Data literacy, prompt engineering, and AI ethics are emerging as critical competencies across sectors.</p>

      <h3>High-Demand Skills for the AI Era</h3>
      <p>Our analysis of over 50,000 job postings reveals a clear pattern: employers are actively seeking candidates who can bridge the gap between technology and business strategy. The most sought-after skills include:</p>
      <ul>
        <li><strong>AI/ML Literacy:</strong> Understanding core AI concepts and applications</li>
        <li><strong>Data Analysis:</strong> Ability to interpret and derive insights from data</li>
        <li><strong>Critical Thinking:</strong> Evaluating AI outputs and making informed decisions</li>
        <li><strong>Digital Communication:</strong> Effective collaboration in hybrid environments</li>
        <li><strong>Ethical AI:</strong> Understanding bias, fairness, and responsible AI implementation</li>
      </ul>

      <h3>Industries Leading the AI Transformation</h3>
      <p>While AI is touching every sector, certain industries are leading the charge. Technology remains at the forefront, with companies investing heavily in AI research and development. Healthcare is seeing revolutionary advancements in diagnostic AI, personalized medicine, and drug discovery. Financial services are leveraging AI for risk assessment, fraud detection, and algorithmic trading.</p>

      <p>The green energy sector is also embracing AI for optimizing renewable energy distribution, while education is using AI to personalize learning experiences at scale. These industries represent exciting opportunities for professionals who can combine domain expertise with AI skills.</p>

      <h3>Strategies for Future-Proofing Your Career</h3>
      <p>As AI continues to evolve, professionals must adopt a proactive approach to career development. Here are five strategies to ensure you remain relevant:</p>
      <ul>
        <li><strong>Embrace Lifelong Learning:</strong> Commit to continuous skill development through online courses, certifications, and workshops.</li>
        <li><strong>Develop Cross-Functional Skills:</strong> Combine technical expertise with business acumen, communication, and leadership abilities.</li>
        <li><strong>Network Strategically:</strong> Build relationships across industries and stay informed about emerging trends.</li>
        <li><strong>Adaptability:</strong> Embrace change and be willing to pivot your career path when necessary.</li>
        <li><strong>Focus on Human-Centric Skills:</strong> Develop emotional intelligence, creativity, and complex problem-solving abilities that AI cannot easily replicate.</li>
      </ul>

      <p>The future of work is not about competing with AI but rather learning to leverage it effectively. Professionals who can combine uniquely human capabilities with AI-powered tools will be in the strongest position to thrive in the coming years.</p>

      <p>At our platform, we are committed to helping you navigate this transformation. Our AI-powered resume builder and job matching tools are designed to identify your unique strengths and connect you with opportunities that align with your evolving career goals.</p>
    `,
    author: 'Mwanza Wambua',
    authorTitle: 'Data Scientist & Career Strategist',
    date: '2024-01-15',
    category: 'Industry Trends',
    readTime: '12 min',
    image: '',
    tags: ['AI', 'Future of Work', 'Career Development', 'Technology'],
    featured: true,
    views: 1247,
  },
  {
    id: '2',
    title: 'Mastering the Art of Remote Work: A Comprehensive Guide to Thriving in a Virtual Environment',
    excerpt: 'Remote work is here to stay. Learn essential strategies for productivity, work-life balance, and career advancement in the digital workplace.',
    content: `
      <p>Remote work has evolved from a temporary solution to a permanent fixture in the modern workplace. With over 70% of professionals reporting that they prefer hybrid or fully remote work arrangements, mastering the art of remote work is no longer optional—it's essential for career success.</p>

      <h3>Setting Up Your Virtual Workspace</h3>
      <p>The foundation of productive remote work is a well-designed workspace. This goes beyond having a decent internet connection and a laptop. Your physical environment significantly impacts your productivity, mental health, and professional image.</p>

      <p>Consider these essential elements for your remote workspace:</p>
      <ul>
        <li><strong>Ergonomic Setup:</strong> Invest in a quality chair, monitor, and keyboard to prevent physical strain.</li>
        <li><strong>Natural Lighting:</strong> Position your workspace to maximize natural light, which improves mood and energy levels.</li>
        <li><strong>Professional Background:</strong> Ensure your video call background is clean and professional, or use a high-quality virtual background.</li>
        <li><strong>Minimal Distractions:</strong> Create boundaries with family or roommates to maintain focus during work hours.</li>
      </ul>

      <h3>Mastering Digital Communication</h3>
      <p>In a remote environment, your communication skills become your most valuable currency. Without the benefit of in-person interactions, every email, message, and video call carries extra weight. Here are strategies for effective digital communication:</p>
      <ul>
        <li><strong>Clear and Concise Writing:</strong> Practice writing messages that are direct, complete, and professional.</li>
        <li><strong>Active Listening:</strong> Show engagement in video meetings through body language and verbal responses.</li>
        <li><strong>Over-Communication:</strong> In a remote setting, it's better to over-communicate than to leave gaps in understanding.</li>
        <li><strong>Time Zone Awareness:</strong> Respect colleagues' time zones when scheduling meetings and sending messages.</li>
      </ul>

      <h3>Building and Maintaining Professional Relationships</h3>
      <p>One of the biggest challenges of remote work is the lack of spontaneous social interaction. Building meaningful professional relationships requires intentional effort in a remote environment.</p>

      <p>Consider these relationship-building strategies:</p>
      <ul>
        <li><strong>Virtual Coffee Chats:</strong> Schedule informal video calls with colleagues to maintain personal connections.</li>
        <li><strong>Active Participation:</strong> Engage in virtual meetings, contribute ideas, and offer support to team members.</li>
        <li><strong>Public Recognition:</strong> Acknowledge and celebrate colleagues' achievements publicly.</li>
        <li><strong>Collaborative Projects:</strong> Seek opportunities to work on cross-functional projects that build connections.</li>
      </ul>

      <h3>Maintaining Work-Life Balance</h3>
      <p>Remote work can blur the boundaries between professional and personal life, leading to burnout and decreased well-being. Establishing and maintaining boundaries is essential for long-term success and satisfaction.</p>

      <ul>
        <li><strong>Structured Schedule:</strong> Create and stick to a daily routine that includes start and end times.</li>
        <li><strong>Designated Workspace:</strong> Separate your work area from your personal space to create psychological distance.</li>
        <li><strong>Regular Breaks:</strong> Step away from your workspace for breaks, meals, and physical activity.</li>
        <li><strong>Digital Detox:</strong> Set boundaries for work-related communication outside of working hours.</li>
      </ul>

      <p>Remote work offers unprecedented flexibility and freedom, but it requires intentional strategies to be productive and fulfilled. By implementing these practices, you can transform remote work from a challenge into a career advantage.</p>
    `,
    author: 'Sarah Chen',
    authorTitle: 'Remote Work Specialist & Career Coach',
    date: '2024-01-10',
    category: 'Career Advice',
    readTime: '10 min',
    image: '',
    tags: ['Remote Work', 'Productivity', 'Work-Life Balance', 'Career Growth'],
    featured: true,
    views: 893,
  },
  {
    id: '3',
    title: 'Building a Personal Brand That Opens Doors: A Step-by-Step Guide for Professionals in 2024',
    excerpt: 'Your personal brand is your professional reputation. Learn how to build a compelling brand that attracts opportunities and accelerates your career.',
    content: `
      <p>In today's competitive job market, your personal brand is not just a nice-to-have—it's a critical professional asset. A strong personal brand differentiates you from other candidates, attracts opportunities, and positions you as a thought leader in your field.</p>

      <h3>What Is Personal Branding?</h3>
      <p>Personal branding is the process of defining and communicating your unique professional identity. It encompasses your skills, values, expertise, and the distinct perspective you bring to your work. Your personal brand is essentially your reputation—what people say about you when you're not in the room.</p>

      <p>A compelling personal brand is built on authenticity. It should be a genuine reflection of who you are, what you believe in, and what you're passionate about. This authenticity is what makes your brand magnetic and trustworthy.</p>

      <h3>Step 1: Define Your Brand Identity</h3>
      <p>The foundation of your personal brand is clarity. Before you can effectively communicate your brand, you need to understand it yourself. Start by answering these questions:</p>
      <ul>
        <li><strong>What are your core values?</strong> What principles guide your decisions and actions?</li>
        <li><strong>What are your unique strengths?</strong> What skills and experiences set you apart?</li>
        <li><strong>Who is your target audience?</strong> Who do you want to attract—employers, clients, collaborators?</li>
        <li><strong>What is your professional mission?</strong> What impact do you want to make?</li>
      </ul>

      <p>Once you have answers to these questions, you have the raw material for your brand. The next step is to articulate it in a clear, compelling way.</p>

      <h3>Step 2: Create Your Brand Message</h3>
      <p>Your brand message is the story you tell about yourself. It should be consistent across all platforms and communications. A strong brand message includes:</p>
      <ul>
        <li><strong>A Clear Value Proposition:</strong> What specific value do you bring to employers or clients?</li>
        <li><strong>Your Unique Story:</strong> What experiences and perspectives shape your approach?</li>
        <li><strong>Your Professional Identity:</strong> What is your professional title and focus?</li>
        <li><strong>Your Differentiators:</strong> What makes you different from others in your field?</li>
      </ul>

      <p>Your brand message should be concise enough to explain in 30 seconds—this is your elevator pitch. It should also be detailed enough to form the foundation of your resume, LinkedIn profile, and professional communications.</p>

      <h3>Step 3: Optimize Your Online Presence</h3>
      <p>In the digital age, your online presence is often the first impression you make. Optimizing your digital footprint is a critical part of personal branding.</p>

      <p>Start with these essential platforms:</p>
      <ul>
        <li><strong>LinkedIn:</strong> Your professional hub. Ensure your profile is complete with a professional photo, compelling summary, detailed experience, and recommendations.</li>
        <li><strong>Personal Website/Portfolio:</strong> A dedicated website gives you full control over your professional narrative and showcases your work effectively.</li>
        <li><strong>Professional Social Media:</strong> Share thought leadership content, engage with industry conversations, and build your network on platforms relevant to your field.</li>
        <li><strong>Online Communities:</strong> Participate in professional forums and groups where you can share expertise and build visibility.</li>
      </ul>

      <h3>Step 4: Demonstrate Thought Leadership</h3>
      <p>Establishing yourself as a thought leader is one of the most effective ways to build your personal brand. Thought leadership involves sharing insights, perspectives, and expertise that add value to your industry and community.</p>

      <p>You can demonstrate thought leadership through:</p>
      <ul>
        <li><strong>Content Creation:</strong> Write articles, blog posts, or social media content that showcases your expertise.</li>
        <li><strong>Speaking Engagements:</strong> Present at conferences, webinars, or industry events.</li>
        <li><strong>Community Involvement:</strong> Mentor others, volunteer your skills, or contribute to professional organizations.</li>
        <li><strong>Collaboration:</strong> Partner with other professionals on projects, research, or content.</li>
      </ul>

      <p>Remember, thought leadership is not about showcasing expertise—it's about contributing value to your community. The most effective thought leaders are generous with their knowledge and genuinely committed to helping others succeed.</p>

      <h3>Step 5: Maintain and Evolve Your Brand</h3>
      <p>Your personal brand is not static—it should evolve as you grow professionally. Regularly assess and refine your brand to ensure it remains relevant and aligned with your career goals.</p>

      <p>Tips for maintaining your brand:</p>
      <ul>
        <li><strong>Consistent Engagement:</strong> Regularly share content, engage with your network, and build visibility.</li>
        <li><strong>Authenticity:</strong> Stay true to your values and mission, even as you grow and change.</li>
        <li><strong>Feedback and Reflection:</strong> Seek feedback and reflect on your brand's effectiveness and alignment.</li>
        <li><strong>Continuous Learning:</strong> Stay current with industry trends and evolve your brand accordingly.</li>
      </ul>

      <p>Building a personal brand is a journey, not a destination. Start where you are, take consistent action, and watch as opportunities begin to present themselves. Your personal brand is your most powerful career asset—invest in it wisely.</p>
    `,
    author: 'David Okonkwo',
    authorTitle: 'Career Development Expert & Brand Strategist',
    date: '2024-01-05',
    category: 'Personal Development',
    readTime: '14 min',
    image: '',
    tags: ['Personal Branding', 'Career Growth', 'Networking', 'Professional Development'],
    featured: true,
    views: 1562,
  },
];

// ============================================
// CAREER HUB COMPONENT
// ============================================

const CareerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'blog'>('jobs');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // FETCH JOBS
  // ============================================

  const fetchJobs = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setLoading(true);

    try {
      const fetchedJobs = await jobScraper.fetchJobs({
        query: search || undefined,
        location: location || undefined,
        remote: remoteOnly || undefined,
        limit: 50,
      });
      setJobs(fetchedJobs);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to fetch latest jobs. Showing cached results.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, location, remoteOnly]);

  // ============================================
  // AUTO-REFRESH JOBS EVERY HOUR
  // ============================================

  useEffect(() => {
    fetchJobs();

    refreshInterval.current = setInterval(() => {
      fetchJobs(true);
    }, 60 * 60 * 1000); // 1 hour

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  // ============================================
  // HANDLE SEARCH
  // ============================================

  const handleSearch = () => {
    fetchJobs(true);
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  // ============================================
  // CATEGORIES
  // ============================================

  const categories = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];

  const filteredPosts = selectedCategory === 'All' 
    ? BLOG_POSTS 
    : BLOG_POSTS.filter(p => p.category === selectedCategory);

  // ============================================
  // RENDER JOB BOARD
  // ============================================

  const renderJobBoard = () => (
    <div>
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search jobs, titles, or companies..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded text-blue-600"
            />
            Remote only
          </label>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loading type="spinner" size="sm" /> : <><MdSearch /> Search</>}
          </button>
        </div>

        {/* Job Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>{jobs.length} jobs found</span>
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <MdAccessTime className="w-4 h-4" />
                Updated {formatTimeAgo(lastUpdated.toISOString())}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
          >
            <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Job Listings */}
      {loading && !refreshing ? (
        <Loading type="skeleton" count={5} />
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MdWork className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 1) }}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-soft transition-shadow cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                    <MdBusiness className="w-4 h-4 flex-shrink-0" />
                    <span>{job.company}</span>
                    <span className="text-gray-300">•</span>
                    <MdLocationOn className="w-4 h-4 flex-shrink-0" />
                    <span>{job.location}</span>
                    {job.remote && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Remote</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm flex-shrink-0 ml-4">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{job.type}</span>
                  <p className="text-gray-400 mt-1">{formatTimeAgo(job.postedAt)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">via {job.source}</span>
                  {job.salary && (
                    <span className="text-xs text-green-600 font-medium">{job.salary}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  View Details <MdArrowForward className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================
  // RENDER BLOG
  // ============================================

  const renderBlog = () => (
    <div>
      {/* Blog Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Career Insights</h2>
          <p className="text-gray-500">Expert advice and strategies for career success</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{BLOG_POSTS.length} articles</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-soft transition-shadow cursor-pointer group"
            onClick={() => setSelectedPost(post)}
          >
            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
              {post.featured && (
                <span className="absolute top-3 left-3 text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
              <MdBookmark className="w-16 h-16 text-white/30" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="font-medium text-blue-600">{post.category}</span>
                <span>•</span>
                <span>{post.readTime} read</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MdVisibility className="w-3 h-3" />
                  {post.views}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1">
                  <MdPerson className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <MdCalendarToday className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{selectedPost.title}</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="font-medium text-blue-600">{selectedPost.category}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime} read</span>
                  <span>•</span>
                  <span>{new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="prose prose-blue max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong>Author:</strong> {selectedPost.author} — {selectedPost.authorTitle}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPost.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ============================================
  // JOB DETAIL MODAL
  // ============================================

  const renderJobDetail = () => {
    if (!selectedJob) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{selectedJob.title}</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MdBusiness className="w-4 h-4" />
                  {selectedJob.company}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MdLocationOn className="w-4 h-4" />
                  {selectedJob.location}
                  {selectedJob.remote && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Remote</span>}
                </p>
                {selectedJob.salary && (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-2 mt-1">
                    <MdAttachMoney className="w-4 h-4" />
                    {selectedJob.salary}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="capitalize">{selectedJob.type}</span>
                <span>•</span>
                <span>via {selectedJob.source}</span>
                <span>•</span>
                <span>{formatTimeAgo(selectedJob.postedAt)}</span>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedJob.description || 'View the full job posting on the source website for complete details.'}</p>
              </div>
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Apply Now <MdArrowForward />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Career Hub</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Discover your next opportunity with real-time job listings from around the world,
            and gain expert insights from our career blog.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-blue-100">
            <span className="flex items-center gap-1"><MdCheckCircle className="w-4 h-4" /> Real-time jobs</span>
            <span className="flex items-center gap-1"><MdCheckCircle className="w-4 h-4" /> Auto-updates</span>
            <span className="flex items-center gap-1"><MdCheckCircle className="w-4 h-4" /> Expert blog</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="flex justify-center gap-2 bg-white rounded-xl shadow-soft border border-gray-200 p-1.5 max-w-md mx-auto">
          {[
            { id: 'jobs', label: 'Job Board', icon: <MdWork className="w-5 h-5" /> },
            { id: 'blog', label: 'Career Blog', icon: <MdBookmark className="w-5 h-5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'jobs' ? renderJobBoard() : renderBlog()}
      </div>

      {/* Job Detail Modal */}
      {renderJobDetail()}

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Job listings are aggregated from public sources and updated automatically.</p>
          <p className="mt-1">© {new Date().getFullYear()} Career Hub — Built for professionals</p>
        </div>
      </div>
    </div>
  );
};

export default CareerBlog;
