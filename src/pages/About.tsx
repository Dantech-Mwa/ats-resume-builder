import React from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdPeople, MdTrendingUp, MdCloudUpload, MdAutoAwesome, MdSecurity } from 'react-icons/md';

const About: React.FC = () => {
  const stats = [
    { value: '50,000+', label: 'Resumes Created' },
    { value: '95%', label: 'ATS Compatibility' },
    { value: '3x', label: 'More Interviews' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  const team = [
    { name: 'Mwanza Wambua', role: 'Founder & CEO', initials: 'MW' },
    { name: 'Tech Team', role: 'Engineering', initials: 'TT' },
    { name: 'AI Team', role: 'Machine Learning', initials: 'AI' },
    { name: 'Support Team', role: 'Customer Success', initials: 'ST' },
  ];

  const values = [
    { icon: <MdAutoAwesome />, title: 'Innovation', desc: 'We leverage cutting-edge AI to give you the best resume optimization tools available.' },
    { icon: <MdSecurity />, title: 'Privacy First', desc: 'Your data is encrypted and never shared. We take your privacy seriously.' },
    { icon: <MdPeople />, title: 'User-Centric', desc: 'Every feature is designed with you in mind, making resume building effortless.' },
    { icon: <MdTrendingUp />, title: 'Results-Driven', desc: 'We measure success by the interviews and job offers our users receive.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-6">
            Our Mission
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-blue-100 max-w-2xl mx-auto">
            To democratize career success by giving every professional access to world-class resume tools powered by artificial intelligence.
          </motion.p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Story</h2>
        <div className="prose max-w-none text-gray-600 space-y-4">
          <p>ATS Resume Builder was born from a simple observation: talented professionals were being filtered out by Applicant Tracking Systems not because they lacked skills, but because their resumes weren't optimized for automated screening.</p>
          <p>Founded by a team of data scientists and career coaches, we combined expertise in machine learning, natural language processing, and human resources to create a platform that bridges the gap between qualified candidates and the ATS systems that filter them.</p>
          <p>Today, we serve tens of thousands of professionals across every industry, helping them craft resumes that not only pass automated screening but impress hiring managers.</p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">{v.icon}</div>
                <div><h3 className="text-lg font-semibold text-gray-900">{v.title}</h3><p className="text-gray-600 mt-1">{v.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
