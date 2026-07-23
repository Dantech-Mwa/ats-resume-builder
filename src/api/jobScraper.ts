// src/api/jobScraper.ts
// ============================================
// JOB SCRAPING API - Real-time job listings
// Uses multiple free APIs and web scraping
// ============================================

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: string;
  description: string;
  url: string;
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'remoteok' | 'wellfound' | 'stackoverflow' | 'brightermonday';
  postedAt: string;
  remote: boolean;
  skills?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  category?: string;
}

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  postedAt: string;
  remote: boolean;
  salary?: string;
  type?: string;
}

class JobScraper {
  private static instance: JobScraper;
  private cache: JobListing[] = [];
  private lastFetch: Date | null = null;
  private cacheDuration = 60 * 60 * 1000; // 1 hour

  static getInstance(): JobScraper {
    if (!JobScraper.instance) {
      JobScraper.instance = new JobScraper();
    }
    return JobScraper.instance;
  }

  // ============================================
  // PRIMARY: Fetch jobs from multiple sources
  // ============================================

  async fetchJobs(params?: {
    query?: string;
    location?: string;
    remote?: boolean;
    limit?: number;
  }): Promise<JobListing[]> {
    // Check cache
    if (this.cache.length > 0 && this.lastFetch) {
      const age = Date.now() - this.lastFetch.getTime();
      if (age < this.cacheDuration) {
        return this.filterJobs(this.cache, params);
      }
    }

    try {
      // Fetch from multiple sources in parallel
      const [linkedinJobs, remoteOkJobs, wellfoundJobs, stackOverflowJobs] = await Promise.all([
        this.fetchLinkedInJobs(params?.query),
        this.fetchRemoteOkJobs(),
        this.fetchWellfoundJobs(),
        this.fetchStackOverflowJobs(),
      ]);

      // Combine and deduplicate
      const allJobs = [...linkedinJobs, ...remoteOkJobs, ...wellfoundJobs, ...stackOverflowJobs];
      const uniqueJobs = this.deduplicateJobs(allJobs);
      
      // Sort by recency
      uniqueJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

      this.cache = uniqueJobs;
      this.lastFetch = new Date();

      return this.filterJobs(this.cache, params);
    } catch (error) {
      console.error('Job scraping error:', error);
      // Return cached data if available, otherwise mock
      if (this.cache.length > 0) return this.filterJobs(this.cache, params);
      return this.getMockJobs();
    }
  }

  // ============================================
  // SOURCE 1: LinkedIn (via unofficial RSS/API)
  // ============================================

  private async fetchLinkedInJobs(query?: string): Promise<JobListing[]> {
    try {
      // Using a public LinkedIn job feed proxy
      const searchQuery = query || 'software developer';
      const response = await fetch(
        `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(searchQuery)}&start=0`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) throw new Error('LinkedIn fetch failed');

      const html = await response.text();
      const jobs = this.parseLinkedInHTML(html);
      return jobs;
    } catch (error) {
      console.warn('LinkedIn fetch failed:', error);
      return [];
    }
  }

  private parseLinkedInHTML(html: string): JobListing[] {
    const jobs: JobListing[] = [];
    // Parse job cards from LinkedIn HTML
    const jobCards = html.match(/<li[^>]*class="[^"]*job-card[^"]*"[^>]*>.*?<\/li>/gs) || [];
    
    for (const card of jobCards) {
      const titleMatch = card.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/i);
      const companyMatch = card.match(/<span[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/span>/i);
      const locationMatch = card.match(/<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/span>/i);
      const linkMatch = card.match(/href="([^"]+)"/);
      
      if (titleMatch && companyMatch) {
        jobs.push({
          id: `linkedin-${Date.now()}-${jobs.length}`,
          title: titleMatch[1].trim(),
          company: companyMatch[1].trim(),
          location: locationMatch?.[1]?.trim() || 'Remote',
          type: 'full-time',
          description: '',
          url: linkMatch?.[1] || '#',
          source: 'linkedin',
          postedAt: new Date().toISOString(),
          remote: locationMatch?.[1]?.toLowerCase().includes('remote') || false,
        });
      }
    }

    return jobs;
  }

  // ============================================
  // SOURCE 2: RemoteOK (Remote jobs)
  // ============================================

  private async fetchRemoteOkJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('RemoteOK fetch failed');
      
      const data = await response.json();
      const jobs: JobListing[] = [];
      
      if (Array.isArray(data)) {
        for (const item of data.slice(0, 30)) {
          if (item.id) {
            jobs.push({
              id: `remoteok-${item.id}`,
              title: item.position || item.title || 'Position',
              company: item.company || item.company_name || 'Company',
              location: item.location || 'Remote',
              type: item.type || 'full-time',
              salary: item.salary || item.salary_min ? `$${item.salary_min}-${item.salary_max}` : undefined,
              description: item.description || '',
              url: item.url || `https://remoteok.com/remote-jobs/${item.slug}`,
              source: 'remoteok',
              postedAt: item.date || new Date().toISOString(),
              remote: true,
              skills: item.tags || [],
            });
          }
        }
      }
      
      return jobs;
    } catch (error) {
      console.warn('RemoteOK fetch failed:', error);
      return [];
    }
  }

  // ============================================
  // SOURCE 3: Wellfound (AngelList)
  // ============================================

  private async fetchWellfoundJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://wellfound.com/api/jobs?limit=20', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('Wellfound fetch failed');
      
      const data = await response.json();
      const jobs: JobListing[] = [];
      
      if (data.jobs) {
        for (const job of data.jobs.slice(0, 20)) {
          jobs.push({
            id: `wellfound-${job.id}`,
            title: job.title || 'Position',
            company: job.company?.name || 'Company',
            location: job.location || job.company?.location || 'Remote',
            type: job.job_type || 'full-time',
            salary: job.salary?.min ? `$${job.salary.min}-${job.salary.max}` : undefined,
            description: job.description || '',
            url: job.url || `https://wellfound.com/jobs/${job.id}`,
            source: 'wellfound',
            postedAt: job.posted_at || new Date().toISOString(),
            remote: job.remote || false,
            skills: job.tags || [],
          });
        }
      }
      
      return jobs;
    } catch (error) {
      console.warn('Wellfound fetch failed:', error);
      return [];
    }
  }

  // ============================================
  // SOURCE 4: Stack Overflow Jobs
  // ============================================

  private async fetchStackOverflowJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch(
        'https://stackoverflow.com/jobs/feed?location=remote&sort=created',
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      
      if (!response.ok) throw new Error('StackOverflow fetch failed');
      
      const xml = await response.text();
      const jobs = this.parseStackOverflowXML(xml);
      return jobs;
    } catch (error) {
      console.warn('StackOverflow fetch failed:', error);
      return [];
    }
  }

  private parseStackOverflowXML(xml: string): JobListing[] {
    const jobs: JobListing[] = [];
    // Simple XML parsing
    const items = xml.match(/<item>.*?<\/item>/gs) || [];
    
    for (const item of items) {
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const descriptionMatch = item.match(/<description>(.*?)<\/description>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        jobs.push({
          id: `stackoverflow-${jobs.length}`,
          title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
          company: 'Stack Overflow',
          location: 'Remote',
          type: 'full-time',
          description: descriptionMatch?.[1]?.replace(/<[^>]+>/g, '') || '',
          url: linkMatch[1],
          source: 'stackoverflow',
          postedAt: pubDateMatch?.[1] || new Date().toISOString(),
          remote: true,
        });
      }
    }
    
    return jobs;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private deduplicateJobs(jobs: JobListing[]): JobListing[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}-${job.location}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private filterJobs(jobs: JobListing[], params?: {
    query?: string;
    location?: string;
    remote?: boolean;
    limit?: number;
  }): JobListing[] {
    let filtered = jobs;

    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      );
    }

    if (params?.location) {
      const loc = params.location.toLowerCase();
      filtered = filtered.filter(j => 
        j.location.toLowerCase().includes(loc)
      );
    }

    if (params?.remote) {
      filtered = filtered.filter(j => j.remote);
    }

    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  private getMockJobs(): JobListing[] {
    const titles = [
      'Senior Software Engineer', 'Data Scientist', 'Product Manager',
      'UX Designer', 'DevOps Engineer', 'Machine Learning Engineer',
      'Full Stack Developer', 'Cloud Architect', 'Security Engineer',
      'Mobile Developer', 'Frontend Engineer', 'Backend Developer'
    ];
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
      'Netflix', 'Spotify', 'Stripe', 'Shopify', 'Twitter',
      'LinkedIn', 'Salesforce', 'Adobe', 'Oracle', 'IBM'
    ];
    const locations = ['Remote', 'Nairobi, Kenya', 'Lagos, Nigeria', 'Cape Town, SA', 'Nairobi, Kenya'];

    return Array.from({ length: 30 }, (_, i) => ({
      id: `mock-${i}`,
      title: titles[i % titles.length],
      company: companies[i % companies.length],
      location: locations[i % locations.length],
      type: ['full-time', 'part-time', 'contract', 'internship'][i % 4] as any,
      salary: i % 2 === 0 ? `$${60 + i * 5}K-$${80 + i * 5}K` : undefined,
      description: 'A great opportunity to join a dynamic team.',
      url: '#',
      source: ['linkedin', 'indeed', 'glassdoor', 'remoteok', 'wellfound'][i % 5] as any,
      postedAt: new Date(Date.now() - i * 3600000).toISOString(),
      remote: i % 3 === 0,
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
    }));
  }
}

export const jobScraper = JobScraper.getInstance();
