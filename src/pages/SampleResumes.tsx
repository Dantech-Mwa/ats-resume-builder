import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MdDownload, MdStar, MdSearch, MdFilterList, MdVisibility, 
  MdWork, MdSchool, MdVerified, MdTrendingUp, MdPeople, 
  MdBusinessCenter, MdLightbulb, MdCheckCircle, 
  MdRocket, MdStars, MdFlashOn, MdInsights, MdLeaderboard,
  MdEmojiEvents 
} from 'react-icons/md';
import toast from 'react-hot-toast';

// ============================================
// WORLD-CLASS RESUME SAMPLES - ULTIMATE COLLECTION
// ============================================

const sampleResumes = [
  // ============================================
  // 1. CHIEF EXECUTIVE OFFICER (CEO) - ULTRA PREMIUM
  // ============================================
  {
    id: 'sr-1',
    title: 'Chief Executive Officer (CEO) Resume',
    industry: 'Executive',
    role: 'Chief Executive Officer',
    experience: '20+ years',
    score: 99,
    featured: true,
    downloads: 28500,
    premium: true,
    color: 'from-purple-600 to-indigo-700',
    features: ['Executive Leadership', 'Board Governance', 'M&A Strategy', 'P&L Management', 'Digital Transformation', 'IPO Experience'],
    preview: {
      name: 'Dr. Victoria Chang',
      title: 'Chief Executive Officer',
      company: 'Fortune 500 Technology Company',
      highlights: [
        'Led $2.4B enterprise through 3x revenue growth, achieving $1.8B EBITDA and 35% market share expansion',
        'Executed 12 strategic acquisitions totaling $850M, integrating 2,500+ employees across 15 countries',
        'Spearheaded digital transformation generating $320M annual cost savings and 45% operational efficiency improvement',
        'Successfully led IPO raising $1.2B, achieving 40% first-day pop and $8.5B market capitalization',
        'Built high-performance executive team, achieving 92% retention and 4.8/5 Glassdoor CEO approval rating',
        'Pioneered ESG framework recognized by UN Global Compact, reducing carbon footprint by 55%',
      ],
      skills: 'Strategic Leadership • Corporate Governance • M&A • P&L Management • Stakeholder Relations • Risk Management • Digital Transformation • Board Presentations • Investor Relations • Talent Development',
      education: 'DBA, Harvard Business School • MBA, Stanford • BSc, MIT',
      certifications: 'Certified Corporate Director • ESG Certified • Six Sigma Black Belt',
    },
  },
  // ============================================
  // 2. CHIEF TECHNOLOGY OFFICER (CTO) - AI & CLOUD
  // ============================================
  {
    id: 'sr-2',
    title: 'Chief Technology Officer (CTO) Resume',
    industry: 'Technology',
    role: 'Chief Technology Officer',
    experience: '18+ years',
    score: 98,
    featured: true,
    downloads: 22400,
    premium: true,
    color: 'from-blue-600 to-cyan-600',
    features: ['Technology Strategy', 'Cloud Architecture', 'AI/ML', 'Engineering Leadership', 'Cybersecurity', 'Innovation'],
    preview: {
      name: 'James Chen',
      title: 'Chief Technology Officer',
      company: 'Global Tech Unicorn',
      highlights: [
        'Architected multi-cloud platform serving 200M+ MAU with 99.999% uptime and 30% infrastructure cost reduction',
        'Led 500+ engineer organization across 8 global hubs, delivering 150+ products over 4 years',
        'Built proprietary AI platform generating $450M annual revenue through personalization and predictive analytics',
        'Drove zero-trust security architecture, achieving SOC 2 Type II, ISO 27001, and FedRAMP compliance',
        'Spearheaded open-source strategy, contributing 25+ projects with 50K+ GitHub stars',
        'Established global innovation labs resulting in 100+ patents filed and 15 industry awards',
      ],
      skills: 'Cloud Architecture • AI/ML • Cybersecurity • Distributed Systems • Engineering Leadership • Product Strategy • MLOps • DevSecOps • Open Source Strategy • Innovation Management',
      education: 'PhD Computer Science, Carnegie Mellon • MSc, Caltech • BSc, UC Berkeley',
      certifications: 'AWS Certified • Google Cloud Architect • CISSP • CISM',
    },
  },
  // ============================================
  // 3. SENIOR SOFTWARE ENGINEER - FAANG LEVEL
  // ============================================
  {
    id: 'sr-3',
    title: 'Senior Software Engineer Resume (FAANG-Level)',
    industry: 'Technology',
    role: 'Senior Software Engineer',
    experience: '10+ years',
    score: 97,
    featured: true,
    downloads: 32000,
    premium: true,
    color: 'from-blue-500 to-blue-700',
    features: ['Microservices', 'Cloud', 'System Design', 'Team Leadership', 'Performance Optimization'],
    preview: {
      name: 'Alex Thompson',
      title: 'Senior Software Engineer',
      company: 'FAANG Company',
      highlights: [
        'Led 15-engineer team building microservices platform serving 500M+ daily requests with 99.99% availability',
        'Architected event-driven system processing 1M+ events/sec, reducing latency by 65% and cost by 40%',
        'Designed and implemented distributed caching layer saving $18M/year in infrastructure costs',
        'Mentored 25+ engineers, with 12 promoted to senior/staff roles and 6 to engineering management',
        'Published 8 internal papers on distributed systems, 3 adopted as company-wide standards',
        'Reduced CI/CD pipeline time from 45 minutes to 8 minutes, increasing developer productivity by 35%',
      ],
      skills: 'Java • Python • Go • AWS • Kubernetes • Kafka • Redis • PostgreSQL • Elasticsearch • Microservices • Distributed Systems • System Design • Data Structures • Algorithms',
      education: 'MSc Computer Science, Stanford • BSc, MIT',
      certifications: 'AWS Solutions Architect • Kubernetes Administrator • Google Cloud Engineer',
    },
  },
  // ============================================
  // 4. DATA SCIENTIST & AI RESEARCHER - NOBEL LEVEL
  // ============================================
  {
    id: 'sr-4',
    title: 'Lead Data Scientist & AI Researcher Resume',
    industry: 'Technology',
    role: 'Lead Data Scientist',
    experience: '8+ years',
    score: 98,
    featured: true,
    downloads: 18900,
    premium: true,
    color: 'from-purple-500 to-pink-500',
    features: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Research', 'Product Impact'],
    preview: {
      name: 'Dr. Sarah Chen, PhD',
      title: 'Lead Data Scientist & AI Researcher',
      company: 'Google DeepMind',
      highlights: [
        'Led 25-person research team developing AlphaFold-inspired protein folding models, achieving 2.3x SOTA accuracy',
        'Built ML-powered drug discovery platform accelerating research by 70%, identifying 12 promising drug candidates',
        'Developed transformer-based models for 100+ languages, improving translation quality by 45%',
        'Published 25+ papers in NeurIPS, ICML, ICLR with 5,800+ citations and 3 best paper awards',
        'Secured $18M in research grants and led 8 successful patent filings for novel AI architectures',
        'Deployed production ML systems serving 50M+ users with 99.9% uptime and sub-50ms latency',
      ],
      skills: 'Python • TensorFlow • PyTorch • JAX • Deep Learning • NLP • Computer Vision • Bayesian Statistics • Reinforcement Learning • Generative AI • Transformers • Graph Neural Networks',
      education: 'PhD Machine Learning, CMU • MSc Data Science, UCL • BSc Computer Science, Oxford',
      certifications: 'TensorFlow Expert • AWS ML Specialty • Google ML Engineer',
    },
  },
  // ============================================
  // 5. CHIEF FINANCIAL OFFICER (CFO) - WALL STREET
  // ============================================
  {
    id: 'sr-5',
    title: 'Chief Financial Officer (CFO) Resume',
    industry: 'Finance',
    role: 'Chief Financial Officer',
    experience: '22+ years',
    score: 99,
    featured: true,
    downloads: 15600,
    premium: true,
    color: 'from-emerald-600 to-teal-600',
    features: ['Financial Strategy', 'M&A', 'Risk Management', 'Investor Relations', 'Capital Markets', 'Audit & Compliance'],
    preview: {
      name: 'Michael Rothstein',
      title: 'Chief Financial Officer',
      company: 'Fortune 100 Financial Services',
      highlights: [
        'Managed $28B annual budget across 45 countries, optimizing capital allocation and achieving 18% ROI',
        'Executed 18 strategic acquisitions valued at $8.5B, integrating 7,000+ employees and achieving 2x synergies',
        'Led $4.5B IPO and 3 follow-on offerings, building world-class investor relations with 95% institutional ownership',
        'Implemented predictive financial modeling platform improving forecast accuracy by 35% and reducing risk by 45%',
        'Modernized finance function with AI-powered automation, reducing month-end close from 15 to 3 days',
        'Architected tax-optimized structure saving $420M annually and achieving 98% global tax compliance',
      ],
      skills: 'Financial Modeling • Corporate Finance • M&A • Capital Markets • Risk Management • Investor Relations • Audit & Compliance • Strategic Planning • Treasury Management • FP&A',
      education: 'MBA Finance, Wharton • CPA • CFA Charterholder • BSc Accounting, LSE',
      certifications: 'CPA • CFA • Certified Treasury Professional • Financial Risk Manager',
    },
  },
  // ============================================
  // 6. INVESTMENT BANKER - GOLDMAN SACHS LEVEL
  // ============================================
  {
    id: 'sr-6',
    title: 'Investment Banking Director Resume',
    industry: 'Finance',
    role: 'Investment Banking Director',
    experience: '15+ years',
    score: 97,
    featured: false,
    downloads: 12400,
    premium: false,
    color: 'from-slate-600 to-slate-800',
    features: ['M&A Advisory', 'Financial Modeling', 'Deal Execution', 'Client Management', 'Valuation'],
    preview: {
      name: 'Jennifer Park',
      title: 'Investment Banking Director',
      company: 'Goldman Sachs',
      highlights: [
        'Advised on 75+ M&A transactions totaling $120B+ across technology, healthcare, and energy sectors',
        'Led cross-border acquisition of $8.5B European fintech, achieving 3.2x return for clients',
        'Built complex LBO and DCF models for Fortune 500 clients, executing 25+ leveraged buyouts',
        'Developed and executed capital raising strategies, securing $45B+ in debt and equity financing',
        'Managed 20+ junior bankers and analysts, with 90% promotion rate to VP and above',
        'Ranked #1 investment banker in coverage group for 3 consecutive years by client satisfaction surveys',
      ],
      skills: 'Financial Modeling • DCF • LBO • M&A • Valuation • Capital Markets • Due Diligence • Negotiation • Client Management • Leadership • Excel • PowerPoint • Mergers • Acquisitions',
      education: 'MBA Finance, Harvard • BSc Economics, Wharton',
      certifications: 'CFA Charterholder • Series 7, 63, 79',
    },
  },
  // ============================================
  // 7. MARKETING DIRECTOR - GLOBAL BRANDS
  // ============================================
  {
    id: 'sr-7',
    title: 'Global Marketing Director Resume',
    industry: 'Marketing',
    role: 'Global Marketing Director',
    experience: '14+ years',
    score: 96,
    featured: false,
    downloads: 14200,
    premium: false,
    color: 'from-orange-500 to-red-500',
    features: ['Brand Strategy', 'Digital Marketing', 'Growth Hacking', 'Team Leadership', 'Analytics'],
    preview: {
      name: 'Marcus Williams',
      title: 'Global Marketing Director',
      company: 'Leading Consumer Brand',
      highlights: [
        'Drove 280% revenue growth ($340M to $1.3B) over 5 years through integrated global marketing strategy',
        'Led global rebrand across 50+ markets, achieving 92% brand awareness and 45% increase in brand equity',
        'Developed and executed digital transformation increasing online revenue from 12% to 45% of total sales',
        'Built and mentored 80+ marketing professionals across 12 countries, with 40% promoted to director level',
        'Launched 25+ products generating $200M+ in new revenue, with 5 becoming market category leaders',
        'Optimized marketing spend through AI-driven attribution, improving ROI from 2.1x to 6.8x',
      ],
      skills: 'Brand Strategy • Digital Marketing • Growth Hacking • SEO/SEM • Content Marketing • Analytics • Leadership • Product Marketing • Consumer Insights • Budget Management • Team Building',
      education: 'MBA Marketing, Kellogg • BSc Communications, Northwestern',
      certifications: 'Google Analytics Certified • Facebook Blueprint • HubSpot Inbound Marketing',
    },
  },
  // ============================================
  // 8. CHIEF PEOPLE OFFICER (CPO) - HR EXCELLENCE
  // ============================================
  {
    id: 'sr-8',
    title: 'Chief People Officer (CPO) Resume',
    industry: 'General',
    role: 'Chief People Officer',
    experience: '20+ years',
    score: 97,
    featured: false,
    downloads: 9800,
    premium: false,
    color: 'from-rose-500 to-pink-500',
    features: ['Talent Strategy', 'Culture Transformation', 'Diversity & Inclusion', 'Organizational Development', 'Employee Experience'],
    preview: {
      name: 'Dr. Maya Patel',
      title: 'Chief People Officer',
      company: 'Global Technology Leader',
      highlights: [
        'Transformed HR function with AI-powered talent intelligence, reducing hiring time 50% and increasing quality of hire 35%',
        'Designed and implemented award-winning culture transformation, improving employee engagement from 62% to 92%',
        'Launched global D&I strategy achieving 50% female and 45% minority representation in leadership within 3 years',
        'Developed leadership development program with 85% promotion rate to executive level among participants',
        'Built comprehensive employee experience platform reducing voluntary turnover from 25% to 11%',
        'Implemented mental health and well-being program, reducing burnout by 65% and increasing productivity 30%',
      ],
      skills: 'Talent Strategy • Culture Transformation • Diversity & Inclusion • Organizational Development • Employee Experience • HR Analytics • Change Management • Leadership Development • Employee Relations • Compensation & Benefits',
      education: 'PhD Organizational Psychology, Stanford • MA HR, Cornell • BA Psychology, UCLA',
      certifications: 'SHRM-SCP • SPHR • Hogan Assessment • DiSC Certified',
    },
  },
  // ============================================
  // 9. CHIEF MEDICAL OFFICER (CMO) - HEALTHCARE
  // ============================================
  {
    id: 'sr-9',
    title: 'Chief Medical Officer (CMO) Resume',
    industry: 'Healthcare',
    role: 'Chief Medical Officer',
    experience: '25+ years',
    score: 99,
    featured: false,
    downloads: 8700,
    premium: false,
    color: 'from-green-600 to-emerald-600',
    features: ['Clinical Leadership', 'Healthcare Innovation', 'Patient Safety', 'Regulatory Compliance', 'Medical Education'],
    preview: {
      name: 'Dr. Anthony Williams, MD, MPH',
      title: 'Chief Medical Officer',
      company: 'Leading Healthcare System',
      highlights: [
        'Led clinical strategy for 25-hospital system with 50,000+ employees and $12B annual revenue',
        'Implemented AI-powered clinical decision support reducing medical errors by 48% and readmissions by 35%',
        'Spearheaded population health initiative improving outcomes for 1.5M+ patients with chronic conditions',
        'Established medical innovation hub leading to 15 new patents and 8 FDA-approved medical devices',
        'Directed telemedicine expansion achieving 15x growth with 95% patient satisfaction',
        'Chaired national quality and safety committee, achieving 99th percentile patient safety ratings',
      ],
      skills: 'Clinical Leadership • Healthcare Innovation • Patient Safety • Quality Improvement • Regulatory Compliance • Medical Education • Population Health • Telehealth • Healthcare IT • Strategic Planning',
      education: 'MD, Johns Hopkins • MPH, Harvard • BA, Princeton',
      certifications: 'Board Certified Internal Medicine • Certified Physician Executive • Six Sigma Black Belt',
    },
  },
  // ============================================
  // 10. CHIEF SUSTAINABILITY OFFICER - ESG
  // ============================================
  {
    id: 'sr-10',
    title: 'Chief Sustainability Officer Resume',
    industry: 'Executive',
    role: 'Chief Sustainability Officer',
    experience: '16+ years',
    score: 98,
    featured: false,
    downloads: 7600,
    premium: false,
    color: 'from-emerald-500 to-teal-500',
    features: ['ESG Strategy', 'Sustainability', 'Carbon Reduction', 'Circular Economy', 'Climate Action'],
    preview: {
      name: 'Dr. David Okonkwo, PhD',
      title: 'Chief Sustainability Officer',
      company: 'Global Fortune 500',
      highlights: [
        'Led corporate sustainability transformation achieving net-zero emissions by 2035, 15 years ahead of industry average',
        'Developed circular economy strategy reducing waste by 75% and saving $280M annually',
        'Secured $2.5B green bond issuance and established world-class ESG reporting framework',
        'Integrated sustainability metrics into all business units, improving operational efficiency by 30%',
        'Partnered with UN to develop climate action framework adopted by 50+ global corporations',
        'Achieved 100% renewable energy across operations and 50% reduction in supply chain carbon footprint',
      ],
      skills: 'ESG Strategy • Sustainability • Carbon Reduction • Circular Economy • Climate Action • Renewable Energy • Environmental Policy • Stakeholder Engagement • ESG Reporting • Sustainable Finance',
      education: 'PhD Environmental Science, Cambridge • MSc Sustainability, Yale • BSc Engineering, MIT',
      certifications: 'GRI Certified • ESG Investing • LEED AP • Climate Reality Leader',
    },
  },
];

// ============================================
// COMPONENT
// ============================================

const SampleResumes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedResume, setSelectedResume] = useState<typeof sampleResumes[0] | null>(null);

  const industries = ['All', ...new Set(sampleResumes.map(r => r.industry))];

  const filteredResumes = sampleResumes.filter(resume => {
    const matchesSearch = resume.title.toLowerCase().includes(search.toLowerCase()) ||
      resume.industry.toLowerCase().includes(search.toLowerCase()) ||
      resume.preview.name.toLowerCase().includes(search.toLowerCase()) ||
      resume.preview.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || resume.industry === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (resume: typeof sampleResumes[0]) => {
    const content = generateResumeContent(resume);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`✅ Downloading: ${resume.title}`);
  };

  const generateResumeContent = (resume: typeof sampleResumes[0]) => {
    const s = resume.preview;
    return `================================================================================
                              ${s.name.toUpperCase()}
                              ${s.title}
                        ${resume.industry} | ${resume.experience}
================================================================================

PROFESSIONAL SUMMARY
--------------------
${s.name} is a distinguished ${s.title} with ${resume.experience} of experience in the ${resume.industry} industry. 
ATS Compatibility Score: ${resume.score}/100.

KEY ACHIEVEMENTS
----------------
${s.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

TECHNICAL SKILLS
----------------
${s.skills}

EDUCATION
---------
${s.education || 'Advanced degree in relevant field'}

CERTIFICATIONS
--------------
${s.certifications || 'Industry-recognized certifications'}

================================================================================
📥 This resume template is ATS-optimized and ready for download.
🚀 Customize this template for your specific industry and experience.
📊 Average ATS Score: ${resume.score}/100
🏆 Used by ${resume.downloads.toLocaleString()}+ professionals worldwide.
================================================================================
© ${new Date().getFullYear()} ATS Resume Builder - Build Your Career
https://ats.tradevisionpro.online
================================================================================`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <MdStars className="w-10 h-10 text-yellow-300" />
            World-Class Resume Samples
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-blue-100 max-w-3xl mx-auto">
            10 executive-level, ATS-optimized resume templates crafted by industry experts. 
            Used by Fortune 500 hires and global leaders.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-blue-200">
            <span className="flex items-center gap-1">📊 Average ATS Score: <strong className="text-white">97/100</strong></span>
            <span className="flex items-center gap-1">⭐ <strong className="text-white">150,000+</strong> Downloads</span>
            <span className="flex items-center gap-1">🏆 Used by <strong className="text-white">Fortune 500</strong> Hires</span>
            <span className="flex items-center gap-1">🌍 <strong className="text-white">50+</strong> Industries Covered</span>
          </motion.div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-soft p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, industry, or name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setFilter(ind)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  filter === ind ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-xl border-2 overflow-hidden hover:shadow-soft transition-all group ${
                resume.featured ? 'border-blue-200 shadow-md' : 'border-gray-200'
              }`}
            >
              {/* Preview */}
              <div className={`aspect-[3/4] bg-gradient-to-br ${resume.color} p-5 relative overflow-hidden cursor-pointer`} onClick={() => setSelectedResume(resume)}>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {resume.featured && (
                    <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <MdStar className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {resume.premium && (
                    <span className="bg-purple-400 text-purple-900 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <MdStars className="w-3 h-3" /> Premium
                    </span>
                  )}
                  <span className="bg-green-400 text-green-900 text-[9px] font-bold px-2 py-1 rounded-full">
                    {resume.score}%
                  </span>
                </div>
                
                {/* Mini Resume - White card overlay */}
                <div className="absolute inset-0 m-5 bg-white/95 backdrop-blur-sm rounded-lg p-4 text-left flex flex-col shadow-lg">
                  <div className="text-center border-b border-gray-200 pb-2 mb-3">
                    <p className="text-xs font-bold text-gray-900 uppercase">{resume.preview.name}</p>
                    <p className="text-[8px] text-gray-500">{resume.preview.title}</p>
                    <p className="text-[6px] text-gray-400">{resume.preview.company}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {resume.preview.highlights.slice(0, 4).map((h, j) => (
                      <p key={j} className="text-[6px] text-gray-600 leading-tight">• {h.substring(0, 60)}{h.length > 60 ? '...' : ''}</p>
                    ))}
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-200">
                    <p className="text-[5px] text-gray-400 leading-tight">{resume.preview.skills.substring(0, 80)}...</p>
                    <p className="text-[5px] text-gray-400 mt-0.5">{resume.experience} • {resume.industry}</p>
                  </div>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <MdVisibility className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Preview Resume</p>
                    <p className="text-xs text-gray-300">{resume.downloads.toLocaleString()} downloads</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{resume.industry}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                    <MdStar className="w-4 h-4" /> {resume.score}/100
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{resume.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <MdWork className="w-3 h-3" /> {resume.experience}
                  <MdSchool className="w-3 h-3" /> {resume.role}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {resume.features.slice(0, 4).map((f, j) => (
                    <span key={j} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                  {resume.features.length > 4 && (
                    <span className="text-[9px] text-gray-400">+{resume.features.length - 4}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedResume(resume)}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <MdVisibility className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(resume)}
                    className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <MdDownload className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedResume(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedResume.preview.name}</h2>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{selectedResume.score}%</span>
                  </div>
                  <p className="text-gray-500 text-sm">{selectedResume.preview.title}</p>
                  <p className="text-xs text-gray-400">{selectedResume.preview.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedResume.industry}</span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedResume.experience}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Key Achievements</h3>
                  <div className="space-y-2">
                    {selectedResume.preview.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <MdVerified className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.preview.skills.split(' • ').map((skill, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Education</h3>
                    <p className="text-sm text-gray-700">{selectedResume.preview.education}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Certifications</h3>
                    <p className="text-sm text-gray-700">{selectedResume.preview.certifications}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <span>📥 {selectedResume.downloads.toLocaleString()} downloads</span>
                  <span>💼 {selectedResume.experience} experience</span>
                  <span>🎯 {selectedResume.role}</span>
                  <span>🏆 Score: {selectedResume.score}/100</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setSelectedResume(null)}
                  className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedResume);
                    setSelectedResume(null);
                  }}
                  className="flex-1 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  <MdDownload className="w-4 h-4" /> Download Resume Template
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SampleResumes;
