import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdLocationOn, MdWork, MdBusiness, MdArrowForward, MdBookmark, MdShare } from 'react-icons/md';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  url: string;
  source: string;
  postedAt: string;
  remote: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

const CareerBlog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'blog'>('jobs');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const blogPosts: BlogPost[] = [
    { id: '1', title: 'How to Optimize Your Resume for ATS in 2024', excerpt: 'Learn the latest techniques to ensure your resume passes Applicant Tracking Systems...', author: 'Mwanza Wambua', date: '2024-01-15', category: 'Resume Tips', readTime: '8 min', image: '' },
    { id: '2', title: 'Top 10 Skills Employers Are Looking For', excerpt: 'Discover the most in-demand skills across industries and how to showcase them...', author: 'Career Team', date: '2024-01-10', category: 'Career Advice', readTime: '6 min', image: '' },
    { id: '3', title: 'The Future of Remote Work: Trends for 2024', excerpt: 'Explore how remote work is evolving and what it means for your career...', author: 'Tech Desk', date: '2024-01-05', category: 'Industry Trends', readTime: '5 min', image: '' },
    { id: '4', title: 'Mastering the Art of the Cover Letter', excerpt: 'A well-crafted cover letter can set you apart. Here\'s how to write one that gets noticed...', author: 'HR Expert', date: '2023-12-28', category: 'Job Search', readTime: '7 min', image: '' },
    { id: '5', title: 'Networking in the Digital Age', excerpt: 'Build meaningful professional connections online and offline...', author: 'Career Coach', date: '2023-12-20', category: 'Career Advice', readTime: '4 min', image: '' },
    { id: '6', title: 'Salary Negotiation: Getting What You Deserve', excerpt: 'Tips and strategies for negotiating your best compensation package...', author: 'Finance Desk', date: '2023-12-15', category: 'Career Advice', readTime: '10 min', image: '' },
  ];

  const mockJobs: Job[] = [
    { id: '1', title: 'Senior Data Scientist', company: 'TechCorp Africa', location: 'Nairobi, Kenya', type: 'Full-time', salary: '$80K-$120K', url: '#', source: 'LinkedIn', postedAt: '2 hours ago', remote: true },
    { id: '2', title: 'Software Engineer', company: 'Google', location: 'Remote', type: 'Full-time', url: '#', source: 'Indeed', postedAt: '5 hours ago', remote: true },
    { id: '3', title: 'Product Manager', company: 'Microsoft', location: 'Lagos, Nigeria', type: 'Full-time', salary: '$90K-$130K', url: '#', source: 'Glassdoor', postedAt: '1 day ago', remote: false },
    { id: '4', title: 'UX Designer', company: 'Andela', location: 'Remote', type: 'Contract', url: '#', source: 'LinkedIn', postedAt: '2 days ago', remote: true },
    { id: '5', title: 'Data Analyst', company: 'Safaricom', location: 'Nairobi, Kenya', type: 'Full-time', url: '#', source: 'BrighterMonday', postedAt: '3 days ago', remote: false },
    { id: '6', title: 'DevOps Engineer', company: 'Amazon AWS', location: 'Cape Town, SA', type: 'Full-time', salary: '$70K-$100K', url: '#', source: 'StackOverflow', postedAt: '1 week ago', remote: true },
  ];

  const searchJobs = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockJobs];
      if (search) filtered = filtered.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));
      if (location) filtered = filtered.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
      if (remoteOnly) filtered = filtered.filter(j => j.remote);
      setJobs(filtered);
      setLoading(false);
    }, 500);
  };

  useEffect(() => { searchJobs(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Career Hub</h1>
          <p className="text-xl text-blue-100">Find your next opportunity or read expert career advice</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="flex justify-center gap-2 bg-white rounded-xl shadow-soft p-1.5">
          {[
            { id: 'jobs', label: 'Job Board', icon: <MdWork /> },
            { id: 'blog', label: 'Career Blog', icon: <MdBookmark /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* JOB BOARD */}
        {activeTab === 'jobs' && (
          <div>
            {/* Search */}
            <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Job title or company" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="rounded" /> Remote only
                </label>
                <button onClick={searchJobs} className="py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Search Jobs</button>
              </div>
            </div>

            {/* Job Listings */}
            {loading ? <Loading type="skeleton" /> : (
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <motion.a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-soft transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MdBusiness className="w-4 h-4" /> {job.company}
                          <span>•</span>
                          <MdLocationOn className="w-4 h-4" /> {job.location}
                          {job.remote && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Remote</span>}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{job.type}</span>
                        <p className="text-gray-400 mt-1">{job.postedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">via {job.source}</span>
                      <span className="text-sm font-medium text-blue-600 flex items-center gap-1">Apply <MdArrowForward className="w-4 h-4" /></span>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BLOG */}
        {activeTab === 'blog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-soft transition-shadow">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <MdBookmark className="w-12 h-12 text-blue-300" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{post.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-2 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{post.author}</span>
                    <span>{post.readTime} read</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerBlog;
