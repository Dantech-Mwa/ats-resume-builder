// src/api/jobScraper.ts
// ============================================
// JOB SCRAPING API - Real-time job listings
// Includes African & Kenyan job sources
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
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'remoteok' | 'wellfound' | 
          'stackoverflow' | 'brightermonday' | 'myjobmag' | 'fuzu' | 
          'jobberman' | 'careerjet' | 'kenyajobs' | 'ajira' | 'corporatestaffing' | 'careerpoint';
  postedAt: string;
  remote: boolean;
  skills?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  category?: string;
  region?: 'kenya' | 'africa' | 'global';
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
    region?: 'kenya' | 'africa' | 'global';
  }): Promise<JobListing[]> {
    // Check cache
    if (this.cache.length > 0 && this.lastFetch) {
      const age = Date.now() - this.lastFetch.getTime();
      if (age < this.cacheDuration) {
        return this.filterJobs(this.cache, params);
      }
    }

    try {
      // Fetch from ALL sources in parallel
      const [
        linkedinJobs,
        remoteOkJobs,
        wellfoundJobs,
        stackOverflowJobs,
        brightMondayJobs,
        myJobMagJobs,
        fuzuJobs,
        jobbermanJobs,
        careerJetJobs,
        kenyaJobsJobs,
        ajiraJobs,
        corporateStaffingJobs,
        careerPointJobs,
      ] = await Promise.allSettled([
        this.fetchLinkedInJobs(params?.query),
        this.fetchRemoteOkJobs(),
        this.fetchWellfoundJobs(),
        this.fetchStackOverflowJobs(),
        this.fetchBrighterMondayJobs(),
        this.fetchMyJobMagJobs(),
        this.fetchFuzuJobs(),
        this.fetchJobbermanJobs(),
        this.fetchCareerJetJobs(),
        this.fetchKenyaJobs(),
        this.fetchAjiraJobs(),
        this.fetchCorporateStaffingJobs(),
        this.fetchCareerPointJobs(),
      ]);

      // Extract successful results
      const allJobs: JobListing[] = [];
      
      const addJobs = (result: any) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allJobs.push(...result.value);
        }
      };

      addJobs(linkedinJobs);
      addJobs(remoteOkJobs);
      addJobs(wellfoundJobs);
      addJobs(stackOverflowJobs);
      addJobs(brightMondayJobs);
      addJobs(myJobMagJobs);
      addJobs(fuzuJobs);
      addJobs(jobbermanJobs);
      addJobs(careerJetJobs);
      addJobs(kenyaJobsJobs);
      addJobs(ajiraJobs);
      addJobs(corporateStaffingJobs);
      addJobs(careerPointJobs);

      // Deduplicate and sort
      const uniqueJobs = this.deduplicateJobs(allJobs);
      uniqueJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

      this.cache = uniqueJobs;
      this.lastFetch = new Date();

      return this.filterJobs(this.cache, params);
    } catch (error) {
      console.error('Job scraping error:', error);
      if (this.cache.length > 0) return this.filterJobs(this.cache, params);
      return this.getMockJobs();
    }
  }

  // ============================================
  // SOURCE 1: LinkedIn (Global)
  // ============================================

  private async fetchLinkedInJobs(query?: string): Promise<JobListing[]> {
    try {
      const searchQuery = query || 'software developer';
      const response = await fetch(
        `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(searchQuery)}&start=0`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );

      if (!response.ok) throw new Error('LinkedIn fetch failed');

      const html = await response.text();
      return this.parseLinkedInHTML(html);
    } catch (error) {
      console.warn('LinkedIn fetch failed:', error);
      return [];
    }
  }

  private parseLinkedInHTML(html: string): JobListing[] {
    const jobs: JobListing[] = [];
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
          region: 'global',
        });
      }
    }

    return jobs;
  }

  // ============================================
  // SOURCE 2: RemoteOK (Global Remote)
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
              region: 'global',
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
  // SOURCE 3: Wellfound (Global)
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
            region: 'global',
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
      return this.parseXMLJobs(xml, 'stackoverflow', 'global');
    } catch (error) {
      console.warn('StackOverflow fetch failed:', error);
      return [];
    }
  }

  // ============================================
  // 🇰🇪 KENYAN JOB SOURCES
  // ============================================

  // 1. BrighterMonday - Kenya's leading job site
  private async fetchBrighterMondayJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://www.brightermonday.co.ke/jobs/rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) {
        // Fallback to search API if RSS fails
        const searchResponse = await fetch('https://www.brightermonday.co.ke/search/jobs?limit=30', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!searchResponse.ok) throw new Error('BrighterMonday fetch failed');
        const html = await searchResponse.text();
        return this.parseBrighterMondayHTML(html);
      }
      
      const xml = await response.text();
      return this.parseXMLJobs(xml, 'brightermonday', 'kenya');
    } catch (error) {
      console.warn('BrighterMonday fetch failed:', error);
      return [];
    }
  }

  private parseBrighterMondayHTML(html: string): JobListing[] {
    const jobs: JobListing[] = [];
    const jobCards = html.match(/<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<\/div>/gs) || [];
    
    for (const card of jobCards) {
      const titleMatch = card.match(/<h3[^>]*>(.*?)<\/h3>/i);
      const companyMatch = card.match(/<span[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/span>/i);
      const locationMatch = card.match(/<span[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/span>/i);
      
      if (titleMatch) {
        jobs.push({
          id: `brightermonday-${jobs.length}-${Date.now()}`,
          title: titleMatch[1].trim(),
          company: companyMatch?.[1]?.trim() || 'Kenya',
          location: locationMatch?.[1]?.trim() || 'Kenya',
          type: 'full-time',
          description: '',
          url: '#',
          source: 'brightermonday',
          postedAt: new Date().toISOString(),
          remote: false,
          region: 'kenya',
        });
      }
    }
    return jobs;
  }

  // 2. MyJobMag - African job board
  private async fetchMyJobMagJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://www.myjobmag.com/feeds/jobs.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('MyJobMag fetch failed');
      
      const xml = await response.text();
      return this.parseXMLJobs(xml, 'myjobmag', 'africa');
    } catch (error) {
      console.warn('MyJobMag fetch failed:', error);
      return [];
    }
  }

  // 3. Fuzu - East African job platform
  private async fetchFuzuJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://api.fuzu.com/v1/jobs?limit=30', {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Fuzu fetch failed');
      
      const data = await response.json();
      const jobs: JobListing[] = [];
      
      if (data.data) {
        for (const job of data.data.slice(0, 20)) {
          jobs.push({
            id: `fuzu-${job.id}`,
            title: job.title || 'Position',
            company: job.company?.name || 'Company',
            location: job.location || job.country || 'Kenya',
            type: job.type || 'full-time',
            salary: job.salary ? `${job.salary.min}-${job.salary.max}` : undefined,
            description: job.description || '',
            url: job.url || `https://fuzu.com/jobs/${job.id}`,
            source: 'fuzu',
            postedAt: job.postedAt || new Date().toISOString(),
            remote: job.remote || false,
            region: 'kenya',
          });
        }
      }
      
      return jobs;
    } catch (error) {
      console.warn('Fuzu fetch failed:', error);
      return [];
    }
  }

  // 4. Kenya Jobs
  private async fetchKenyaJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://kenyajobs.com/rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('KenyaJobs fetch failed');
      
      const xml = await response.text();
      return this.parseXMLJobs(xml, 'kenyajobs', 'kenya');
    } catch (error) {
      console.warn('KenyaJobs fetch failed:', error);
      return [];
    }
  }

  // 5. Ajira - Kenyan job portal
  private async fetchAjiraJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://ajira.co.ke/jobs/feed', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('Ajira fetch failed');
      
      const xml = await response.text();
      return this.parseXMLJobs(xml, 'ajira', 'kenya');
    } catch (error) {
      console.warn('Ajira fetch failed:', error);
      return [];
    }
  }

  // 6. Corporate Staffing - Kenyan recruitment
  private async fetchCorporateStaffingJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://www.corporatestaffing.co.ke/jobs', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('CorporateStaffing fetch failed');
      
      const html = await response.text();
      return this.parseCorporateStaffingHTML(html);
    } catch (error) {
      console.warn('CorporateStaffing fetch failed:', error);
      return [];
    }
  }

  private parseCorporateStaffingHTML(html: string): JobListing[] {
    const jobs: JobListing[] = [];
    const jobItems = html.match(/<div[^>]*class="[^"]*job-item[^"]*"[^>]*>.*?<\/div>/gs) || [];
    
    for (const item of jobItems) {
      const titleMatch = item.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i);
      const companyMatch = item.match(/<span[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/span>/i);
      
      if (titleMatch) {
        jobs.push({
          id: `corporatestaffing-${jobs.length}-${Date.now()}`,
          title: titleMatch[1].trim(),
          company: companyMatch?.[1]?.trim() || 'Kenya',
          location: 'Nairobi, Kenya',
          type: 'full-time',
          description: '',
          url: '#',
          source: 'corporatestaffing',
          postedAt: new Date().toISOString(),
          remote: false,
          region: 'kenya',
        });
      }
    }
    return jobs;
  }

  // 7. CareerPoint Kenya
  private async fetchCareerPointJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://www.careerpoint.co.ke/jobs', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('CareerPoint fetch failed');
      
      const html = await response.text();
      return this.parseCareerPointHTML(html);
    } catch (error) {
      console.warn('CareerPoint fetch failed:', error);
      return [];
    }
  }

  private parseCareerPointHTML(html: string): JobListing[] {
    const jobs: JobListing[] = [];
    const jobItems = html.match(/<div[^>]*class="[^"]*job-listing[^"]*"[^>]*>.*?<\/div>/gs) || [];
    
    for (const item of jobItems) {
      const titleMatch = item.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i);
      const companyMatch = item.match(/<span[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/span>/i);
      
      if (titleMatch) {
        jobs.push({
          id: `careerpoint-${jobs.length}-${Date.now()}`,
          title: titleMatch[1].trim(),
          company: companyMatch?.[1]?.trim() || 'Kenya',
          location: 'Kenya',
          type: 'full-time',
          description: '',
          url: '#',
          source: 'careerpoint',
          postedAt: new Date().toISOString(),
          remote: false,
          region: 'kenya',
        });
      }
    }
    return jobs;
  }

  // ============================================
  // 🌍 AFRICAN JOB SOURCES
  // ============================================

  // 8. Jobberman - West Africa (Nigeria/Ghana)
  private async fetchJobbermanJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://www.jobberman.com/jobs/feed.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('Jobberman fetch failed');
      
      const xml = await response.text();
      return this.parseXMLJobs(xml, 'jobberman', 'africa');
    } catch (error) {
      console.warn('Jobberman fetch failed:', error);
      return [];
    }
  }

  // 9. CareerJet South Africa
  private async fetchCareerJetJobs(): Promise<JobListing[]> {
    try {
      const response = await fetch('https://www.careerjet.co.za/jobs.rss', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error('CareerJet fetch failed');
      
      const xml = await response.text();
      return this.parseXMLJobs(xml, 'careerjet', 'africa');
    } catch (error) {
      console.warn('CareerJet fetch failed:', error);
      return [];
    }
  }

  // ============================================
  // XML/RSS PARSER
  // ============================================

  private parseXMLJobs(
    xml: string, 
    source: string, 
    region: 'kenya' | 'africa' | 'global'
  ): JobListing[] {
    const jobs: JobListing[] = [];
    const items = xml.match(/<item>.*?<\/item>/gs) || [];
    
    for (const item of items) {
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const descriptionMatch = item.match(/<description>(.*?)<\/description>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const locationMatch = item.match(/<location>(.*?)<\/location>/i) || 
                           item.match(/<category>(.*?)<\/category>/i);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        let company = 'Company';
        const companyMatch = title.match(/(?:at|@)\s+([^-]+?)(?:\s*[-–—]|\s*$)/i);
        if (companyMatch) {
          company = companyMatch[1].trim();
        }
        
        jobs.push({
          id: `${source}-${jobs.length}-${Date.now()}`,
          title: title,
          company: company,
          location: locationMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Africa',
          type: 'full-time',
          description: descriptionMatch?.[1]?.replace(/<[^>]+>/g, '') || '',
          url: linkMatch[1],
          source: source as any,
          postedAt: pubDateMatch?.[1] || new Date().toISOString(),
          remote: false,
          region: region,
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
    region?: 'kenya' | 'africa' | 'global';
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

    if (params?.region) {
      filtered = filtered.filter(j => 
        j.region === params.region || j.region === 'global'
      );
    }

    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  // ============================================
  // MOCK JOBS (Fallback)
  // ============================================

  private getMockJobs(): JobListing[] {
    const kenyanCompanies = [
      'Safaricom', 'Equity Bank', 'KCB Group', 'EABL', 'Bamburi Cement',
      'Kengen', 'Nation Media Group', 'Sasini', 'Kakuzi', 'Mumias Sugar',
      'Centum', 'CIC Insurance', 'Jubilee Insurance', 'East African Breweries',
      'Airtel Kenya', 'Telkom Kenya', 'Kenya Power', 'Kenya Airways'
    ];
    
    const titles = [
      'Senior Software Engineer', 'Data Scientist', 'Product Manager',
      'Marketing Manager', 'Financial Analyst', 'Human Resources Manager',
      'Operations Manager', 'Sales Executive', 'Customer Service Manager',
      'Project Manager', 'Business Development Manager', 'Accountant',
      'Network Engineer', 'Systems Administrator', 'Digital Marketing Specialist'
    ];

    const locations = ['Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Eldoret, Kenya', 'Remote'];

    return Array.from({ length: 30 }, (_, i) => ({
      id: `mock-${i}`,
      title: titles[i % titles.length],
      company: kenyanCompanies[i % kenyanCompanies.length],
      location: locations[i % locations.length],
      type: ['full-time', 'part-time', 'contract', 'internship'][i % 4] as any,
      salary: i % 2 === 0 ? `KSh ${60 + i * 5}K-${80 + i * 5}K` : undefined,
      description: 'A great opportunity to join a leading company in Kenya.',
      url: '#',
      source: ['brightermonday', 'fuzu', 'myjobmag', 'kenyajobs', 'ajira', 'corporatestaffing'][i % 6] as any,
      postedAt: new Date(Date.now() - i * 3600000).toISOString(),
      remote: i % 3 === 0,
      region: 'kenya',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
    }));
  }
}

export const jobScraper = JobScraper.getInstance();
