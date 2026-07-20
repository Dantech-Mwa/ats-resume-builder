// ============================================
// HOME PAGE - Landing Page
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  MdAutoAwesome,
  MdDescription,
  MdCloudUpload,
  MdDownload,
  MdStar,
  MdVerified,
  MdSpeed,
  MdSecurity,
  MdSupport,
  MdCheckCircle,
  MdArrowForward,
  MdPlayCircle,
} from 'react-icons/md';
import { FaPaypal } from 'react-icons/fa';
import { useAuth } from '../store';
import TemplateSelector from '../components/TemplateSelector';
import PricingCard from '../components/PricingCard';
import { PRICING_PLANS } from '../config/constants';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/builder');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: <MdAutoAwesome className="w-8 h-8" />,
      title: 'AI-Powered Optimization',
      description: 'Get intelligent suggestions to improve your resume content, keywords, and formatting for maximum ATS compatibility.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: <MdDescription className="w-8 h-8" />,
      title: 'ATS-Friendly Templates',
      description: 'Choose from professionally designed templates that are guaranteed to pass through applicant tracking systems.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <MdCloudUpload className="w-8 h-8" />,
      title: 'Upload & Improve',
      description: 'Upload your existing resume in PDF, DOCX, or TXT format and our AI will analyze and enhance it.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <MdDownload className="w-8 h-8" />,
      title: 'Multiple Export Formats',
      description: 'Download your resume in multiple ATS-friendly formats including PDF, DOCX, and plain text.',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: <MdSpeed className="w-8 h-8" />,
      title: 'Real-Time ATS Scoring',
      description: 'Get instant feedback on how your resume scores with a detailed breakdown of ATS compatibility.',
      color: 'bg-red-100 text-red-600',
    },
    {
      icon: <MdSecurity className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never share your personal information with third parties.',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      image: 'https://i.pravatar.cc/100?img=1',
      text: 'After using ATS Resume Builder, I got 3x more interview calls. The AI suggestions helped me optimize my resume perfectly!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Manager',
      image: 'https://i.pravatar.cc/100?img=2',
      text: 'The ATS scoring feature is a game-changer. I went from a 45 to a 92 score and landed my dream job within weeks.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      image: 'https://i.pravatar.cc/100?img=3',
      text: 'Best resume builder I\'ve ever used. The templates are beautiful and the AI recommendations are spot-on.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '95%', label: 'ATS Compatibility' },
    { value: '50K+', label: 'Resumes Created' },
    { value: '3x', label: 'More Interviews' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8"
            >
              <MdAutoAwesome className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered Resume Builder</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Create ATS-Friendly Resumes
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                That Get You Hired
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
            >
              Build professional resumes optimized for Applicant Tracking Systems. 
              Get AI-powered suggestions, real-time ATS scoring, and beautiful templates.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Get Started Free
                <MdArrowForward className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <MdPlayCircle className="w-5 h-5" />
                How It Works
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L60 50C120 40 240 20 360 30C480 40 600 80 720 90C840 100 960 80 1080 60C1200 40 1320 20 1380 10L1440 0V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V60Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land the Job
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI technology with professional design to create 
              resumes that impress both ATS systems and human recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Professional Templates
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our collection of ATS-optimized templates designed by professional recruiters.
            </p>
          </div>
          <TemplateSelector />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of professionals who have transformed their careers.
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative h-64">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: activeTestimonial === index ? 1 : 0,
                  x: activeTestimonial === index ? 0 : 50,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 ${activeTestimonial === index ? 'block' : 'hidden'}`}
              >
                <div className="bg-white rounded-2xl p-8 shadow-medium text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <MdStar key={i} className="w-6 h-6 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeTestimonial === index ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start with a 14-day trial for just $1, then choose the plan that works for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={(planId) => navigate(`/register?plan=${planId}`)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <MdVerified className="text-green-500" />
              30-day money-back guarantee. No questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have created winning resumes with our AI-powered builder.
            Start your 14-day trial today for just $1.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center gap-3"
          >
            Create Your Resume Now
            <MdArrowForward className="w-5 h-5" />
          </button>
          <p className="text-blue-200 text-sm mt-4">
            No credit card required for trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;