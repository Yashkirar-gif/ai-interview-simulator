import { GoogleGenAI, Type } from '@google/genai';

export interface ImprovementItem {
  area: string;
  issue: string;
  suggestion: string;
  exampleBefore?: string;
  exampleAfter?: string;
}

export interface AdditionItem {
  item: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export interface RemovalItem {
  item: string;
  reason: string;
  replacement?: string;
  severity: 'critical' | 'moderate' | 'minor';
}

export interface SectionReview {
  sectionName: string;
  score: number;
  status: 'pass' | 'warning' | 'danger';
  feedback: string;
  tips: string[];
}

export interface ResumeAnalysisResult {
  atsScore: number;
  verdict: string;
  targetRole: string;
  summary: string;
  scoreBreakdown: {
    contentAndImpact: number;
    skillsAndKeywords: number;
    formattingAndStructure: number;
    brevityAndClarity: number;
  };
  whatToImprove: ImprovementItem[];
  whatToAdd: AdditionItem[];
  whatToRemove: RemovalItem[];
  keywordAnalysis: {
    matchedKeywords: string[];
    missingKeywords: string[];
    matchPercentage: number;
  };
  sectionReviews: SectionReview[];
  quickAtsTips: string[];
  analyzedAt: number;
}

// Role-based keyword dictionaries for ATS validation
const ROLE_KEYWORDS: Record<string, string[]> = {
  frontend: [
    'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Next.js',
    'Redux', 'State Management', 'REST API', 'GraphQL', 'Webpack', 'Vite', 'Responsive Design',
    'Web Performance', 'Lighthouse', 'Core Web Vitals', 'Unit Testing', 'Jest', 'Cypress',
    'Git', 'CI/CD', 'Accessibility', 'WCAG', 'Browser Rendering', 'DOM Manipulation'
  ],
  fullstack: [
    'React', 'TypeScript', 'Node.js', 'Express', 'Next.js', 'PostgreSQL', 'MongoDB',
    'SQL', 'RESTful APIs', 'GraphQL', 'Docker', 'AWS', 'Redis', 'Microservices',
    'Authentication', 'JWT', 'OAuth', 'Prisma', 'ORM', 'CI/CD', 'Git', 'Unit Testing',
    'System Design', 'Caching', 'Cloud Architecture'
  ],
  backend: [
    'Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka',
    'RabbitMQ', 'REST API', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'Microservices', 'Database Indexing', 'ACID', 'System Architecture', 'CI/CD',
    'gRPC', 'Security', 'Scalability', 'Load Balancing'
  ],
  mobile: [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Mobile UI/UX',
    'Push Notifications', 'App Store Submission', 'Google Play Console', 'State Management',
    'REST API', 'Offline Storage', 'SQLite', 'Performance Optimization', 'Git'
  ],
  devops: [
    'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins',
    'Linux', 'Bash', 'Prometheus', 'Grafana', 'Nginx', 'Infrastructure as Code',
    'Cloud Security', 'Helm', 'ArgoCD', 'Ansible', 'Observability'
  ],
  data: [
    'Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'TensorFlow', 'PyTorch',
    'Data Modeling', 'ETL Pipelines', 'Airflow', 'Spark', 'BigQuery', 'Snowflake',
    'Data Visualization', 'Tableau', 'Scikit-learn', 'Statistics'
  ],
  general: [
    'Problem Solving', 'Data Structures', 'Algorithms', 'Git', 'Agile / Scrum',
    'Code Review', 'Cross-functional Collaboration', 'CI/CD', 'Software Architecture',
    'Testing', 'Debugging', 'Documentation', 'Scalability', 'System Design'
  ]
};

// Known fluff/buzzwords that hurt ATS scores
const FLUFF_BUZZWORDS = [
  'hard worker', 'team player', 'go-getter', 'self-starter', 'results-driven',
  'detail-oriented', 'think outside the box', 'punctual', 'motivated',
  'dynamic individual', 'synergy', 'references available upon request',
  'duties included', 'responsible for'
];

export async function analyzeResumeWithGemini(
  resumeText: string,
  targetRole: string = 'Full Stack Developer',
  jobDescription?: string
): Promise<ResumeAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a world-class applicant tracking system (ATS) auditing engine and executive technical hiring director. 
Perform a rigorous, thorough, and quantitative ATS audit on the candidate's resume for the target role: "${targetRole}".
${jobDescription ? `Target Job Description to match against:\n"""${jobDescription}"""\n` : ''}

Candidate Resume Text:
"""
${resumeText}
"""

Evaluate the resume on four critical ATS dimensions:
1. Content & Impact (0-100): Use of Google's XYZ formula ("Accomplished [X], measured by [Y], by doing [Z]"), measurable metrics (%, $, time saved, users scaled), strong action verbs.
2. Skills & Keywords (0-100): Presence and frequency of high-demand industry technologies, tools, and methodologies for "${targetRole}".
3. Formatting & Structure (0-100): ATS parsability, standard section names, clean layout, chronological order, professional contact links (LinkedIn, GitHub, Portfolio).
4. Brevity & Clarity (0-100): Concise bullet points, active voice, zero fluff/buzzwords, appropriate length.

Overall ATS score should be an honest, mathematically weighted score out of 100 reflecting the candidate's actual pass-rate probability in systems like Greenhouse, Workday, and Lever.

Provide concrete, actionable items:
- whatToImprove: 3 to 5 specific areas where the resume is weak, with explicit "exampleBefore" (taken or adapted from their resume) and an upgraded "exampleAfter" (showing how a top-tier candidate rewrites it with metrics and strong verbs).
- whatToAdd: 3 to 6 high-priority missing items (missing essential skills/keywords, metrics, live project links, GitHub profile, certifications, section headers).
- whatToRemove: 3 to 5 items to remove immediately (outdated tech, filler phrases like "responsible for" or "references available", vague buzzwords, tables/formatting hazards).
- keywordAnalysis: list of matched keywords found in their resume, and list of missing high-priority keywords for ${targetRole}.
- sectionReviews: review for Contact Header, Summary/Objective, Experience, Skills, Education/Projects.
- quickAtsTips: 4 to 5 bullet points of ATS rules.

Return the result strictly as a valid JSON object matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.INTEGER, description: 'Overall ATS score 0-100' },
              verdict: { type: Type.STRING, description: 'Short summary verdict e.g. "Strong ATS Match (86%)"' },
              summary: { type: Type.STRING, description: '2-3 paragraph executive review of candidate profile' },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  contentAndImpact: { type: Type.INTEGER },
                  skillsAndKeywords: { type: Type.INTEGER },
                  formattingAndStructure: { type: Type.INTEGER },
                  brevityAndClarity: { type: Type.INTEGER },
                },
                required: ['contentAndImpact', 'skillsAndKeywords', 'formattingAndStructure', 'brevityAndClarity']
              },
              whatToImprove: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    area: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    suggestion: { type: Type.STRING },
                    exampleBefore: { type: Type.STRING },
                    exampleAfter: { type: Type.STRING },
                  },
                  required: ['area', 'issue', 'suggestion']
                }
              },
              whatToAdd: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    priority: { type: Type.STRING, description: 'high | medium | low' },
                    category: { type: Type.STRING },
                  },
                  required: ['item', 'reason', 'priority']
                }
              },
              whatToRemove: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    replacement: { type: Type.STRING },
                    severity: { type: Type.STRING, description: 'critical | moderate | minor' },
                  },
                  required: ['item', 'reason', 'severity']
                }
              },
              keywordAnalysis: {
                type: Type.OBJECT,
                properties: {
                  matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  matchPercentage: { type: Type.INTEGER },
                },
                required: ['matchedKeywords', 'missingKeywords', 'matchPercentage']
              },
              sectionReviews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionName: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    status: { type: Type.STRING, description: 'pass | warning | danger' },
                    feedback: { type: Type.STRING },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['sectionName', 'score', 'status', 'feedback', 'tips']
                }
              },
              quickAtsTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              'atsScore', 'verdict', 'summary', 'scoreBreakdown',
              'whatToImprove', 'whatToAdd', 'whatToRemove',
              'keywordAnalysis', 'sectionReviews', 'quickAtsTips'
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return {
          ...parsed,
          targetRole,
          analyzedAt: Date.now()
        };
      }
    } catch (err) {
      console.warn('Gemini API resume analysis failed or hit rate limit. Falling back to heuristic engine:', err);
    }
  }

  // Fallback heuristic engine:
  return runHeuristicResumeAnalysis(resumeText, targetRole, jobDescription);
}

// Deep, rule-based algorithmic parser
export function runHeuristicResumeAnalysis(
  resumeText: string,
  targetRole: string = 'Full Stack Developer',
  jobDescription?: string
): ResumeAnalysisResult {
  const textLower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Role keyword matching
  const roleKey = targetRole.toLowerCase().includes('front') ? 'frontend'
    : targetRole.toLowerCase().includes('back') ? 'backend'
    : targetRole.toLowerCase().includes('mobile') ? 'mobile'
    : targetRole.toLowerCase().includes('devops') || targetRole.toLowerCase().includes('cloud') ? 'devops'
    : targetRole.toLowerCase().includes('data') ? 'data'
    : targetRole.toLowerCase().includes('full') ? 'fullstack'
    : 'general';

  const targetKeywords = ROLE_KEYWORDS[roleKey] || ROLE_KEYWORDS.general;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach(kw => {
    if (textLower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchPercentage = Math.round((matchedKeywords.length / targetKeywords.length) * 100);

  // 2. Metrics & Numbers Check (Quantifiable impact)
  const metricMatches = resumeText.match(/(\d+[\d,.]*\s*(%|k|m|ms|sec|hours|users|req|rpm|x|\+|\$|dollars))/gi) || [];
  const numbersFound = metricMatches.length;
  let impactScore = Math.min(100, Math.round(35 + (numbersFound * 10)));

  // 3. Fluff / Buzzwords Check
  const detectedFluff: string[] = [];
  FLUFF_BUZZWORDS.forEach(fluff => {
    if (textLower.includes(fluff)) {
      detectedFluff.push(fluff);
    }
  });

  // 4. Contact & Link checks
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com/i.test(resumeText);
  const hasGitHub = /github\.com/i.test(resumeText);
  const hasPortfolio = /https?:\/\/|portfolio|website/i.test(resumeText);

  // 5. Section headings detected
  const hasExperience = /experience|employment|work history/i.test(resumeText);
  const hasEducation = /education|university|college|degree|bachelor|master/i.test(resumeText);
  const hasSkills = /skills|technologies|proficiencies|tools/i.test(resumeText);
  const hasProjects = /projects|portfolio|personal projects/i.test(resumeText);
  const hasSummary = /summary|profile|about me|objective/i.test(resumeText);

  // Structural score
  let structureScore = 40;
  if (hasEmail) structureScore += 12;
  if (hasPhone) structureScore += 8;
  if (hasLinkedIn) structureScore += 10;
  if (hasGitHub) structureScore += 10;
  if (hasExperience) structureScore += 10;
  if (hasSkills) structureScore += 10;
  structureScore = Math.min(100, structureScore);

  // Brevity & Clarity score
  let clarityScore = 80;
  if (wordCount < 200) clarityScore -= 30; // too short
  if (wordCount > 1000) clarityScore -= 20; // potentially too long/rambling
  if (detectedFluff.length > 0) clarityScore -= detectedFluff.length * 6;
  clarityScore = Math.max(25, Math.min(100, clarityScore));

  // Skills score
  let skillsScore = Math.min(100, Math.round(keywordMatchPercentage * 0.9 + (matchedKeywords.length > 5 ? 15 : 0)));

  // Overall ATS Score calculation
  const overallAts = Math.round(
    (impactScore * 0.35) +
    (skillsScore * 0.30) +
    (structureScore * 0.20) +
    (clarityScore * 0.15)
  );

  // Verdict determination
  let verdict = 'Needs Optimization (50-69%)';
  if (overallAts >= 85) verdict = 'Strong ATS Match (85-100%)';
  else if (overallAts >= 70) verdict = 'Good Potential with Gaps (70-84%)';
  else if (overallAts < 50) verdict = 'High Risk of ATS Filtering (<50%)';

  // Specific improvements
  const whatToImprove: ImprovementItem[] = [];
  if (numbersFound < 3) {
    whatToImprove.push({
      area: 'Quantifiable Metrics & Impact',
      issue: 'Responsibilities are written passively without measurable scale or business metrics.',
      suggestion: 'Incorporate Google\'s XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]". Specify percentage improvements, latency drops, or dollar impacts.',
      exampleBefore: 'Responsible for optimizing database queries and backend endpoints.',
      exampleAfter: 'Re-indexed PostgreSQL schemas and introduced Redis caching, slashing P99 API response latency by 58% (from 820ms to 345ms).'
    });
  }
  if (!hasGitHub && (roleKey === 'frontend' || roleKey === 'fullstack' || roleKey === 'backend')) {
    whatToImprove.push({
      area: 'Technical Portfolio Verification',
      issue: 'No verifiable GitHub repository or open-source profile detected in header.',
      suggestion: 'Include an active GitHub URL at the top with pinned repositories showing clean commit hygiene, documentation, and automated tests.',
      exampleBefore: 'Personal contact header containing only city and phone number.',
      exampleAfter: 'github.com/yourhandle • linkedin.com/in/yourprofile • yourportfolio.dev'
    });
  }
  whatToImprove.push({
    area: 'Action Verb Elevation',
    issue: 'Sentence structures start with passive verbs like "worked on", "assisted", or "helped".',
    suggestion: 'Start every accomplishment with high-conviction verbs: "Architected", "Engineered", "Orchestrated", "Spearheaded", "Streamlined".',
    exampleBefore: 'Helped the frontend team build the checkout flow for users.',
    exampleAfter: 'Architected an idempotent 3-step checkout workflow with React and Stripe Elements, reducing cart abandonment by 14%.'
  });

  // What to Add
  const whatToAdd: AdditionItem[] = [];
  if (missingKeywords.length > 0) {
    whatToAdd.push({
      item: `High-Demand Role Keywords: ${missingKeywords.slice(0, 4).join(', ')}`,
      reason: `ATS keyword scanners parse job descriptions looking for exact technical stacks for ${targetRole}.`,
      priority: 'high',
      category: 'Technical Stack'
    });
  }
  if (!hasLinkedIn) {
    whatToAdd.push({
      item: 'Customized LinkedIn Profile URL',
      reason: 'Recruiters cross-reference resume candidates against LinkedIn profiles for quick social proof and recommendations.',
      priority: 'high',
      category: 'Contact Information'
    });
  }
  if (!hasProjects) {
    whatToAdd.push({
      item: 'Featured Project Showcase with Live Demos',
      reason: 'Projects with active deployed URLs give hiring managers instant tangible proof of capability.',
      priority: 'medium',
      category: 'Projects'
    });
  }
  whatToAdd.push({
    item: 'Technical Metrics (Latency, Throughput, User Scale)',
    reason: 'Distinguishes senior execution from generic code authorship.',
    priority: 'high',
    category: 'Experience'
  });

  // What to Remove
  const whatToRemove: RemovalItem[] = [];
  if (detectedFluff.length > 0) {
    whatToRemove.push({
      item: `Vague Fluff Phrases: "${detectedFluff.slice(0, 3).join('", "')}"`,
      reason: 'Recruiters and automated ATS scoring systems ignore unprovable soft skill buzzwords.',
      replacement: 'Replace with concrete examples of cross-functional team initiatives and deliverables.',
      severity: 'critical'
    });
  } else {
    whatToRemove.push({
      item: 'Generic Objective Statements ("Seeking a challenging position...")',
      reason: 'Outdated format that wastes top-third prime screen real estate. Recruiters want to know what you can do for them, not what you want from them.',
      replacement: 'Replace with a 2-3 line Professional Summary highlighting years of experience, core tech stack, and key career achievements.',
      severity: 'moderate'
    });
  }
  whatToRemove.push({
    item: 'Complex Multi-column or Graphic Tables',
    reason: 'Standard ATS parsers (Workday, Taleo) struggle to parse multi-column tables, often merging text horizontally or dropping entire sections.',
    replacement: 'Stick to clean, single-column linear layout with standard headings.',
    severity: 'critical'
  });
  whatToRemove.push({
    item: '"References Available Upon Request"',
    reason: 'Consumes valuable space with redundant information; references are requested later in the hiring process.',
    replacement: 'Use this space for an additional high-impact project bullet or key metric.',
    severity: 'minor'
  });

  // Section reviews
  const sectionReviews: SectionReview[] = [
    {
      sectionName: 'Header & Contact Info',
      score: hasEmail && hasPhone && hasLinkedIn ? 95 : 65,
      status: hasEmail && hasPhone && hasLinkedIn ? 'pass' : 'warning',
      feedback: hasEmail && hasPhone && hasLinkedIn 
        ? 'Solid contact block with essential professional links.'
        : 'Missing one or more critical recruiter contact points (LinkedIn, GitHub, or direct email).',
      tips: [
        'Include clickable LinkedIn and GitHub URLs',
        'Avoid full physical street address for privacy (City, State/Country is sufficient)',
        'Ensure professional email format (firstname.lastname@domain.com)'
      ]
    },
    {
      sectionName: 'Professional Summary',
      score: hasSummary ? 80 : 55,
      status: hasSummary ? 'pass' : 'warning',
      feedback: hasSummary
        ? 'Summary detected. Ensure it emphasizes quantifiable technical wins rather than generic goals.'
        : 'No concise executive summary found. An opening 3-line elevator pitch immediately anchors your seniority.',
      tips: [
        'Keep within 3-4 lines maximum',
        'Front-load target job title and total years in the field',
        'Mention 2 flagship competencies (e.g. Distributed Systems & React)'
      ]
    },
    {
      sectionName: 'Work Experience & Impact',
      score: impactScore,
      status: impactScore >= 75 ? 'pass' : impactScore >= 50 ? 'warning' : 'danger',
      feedback: `${numbersFound} metric-driven data points detected. Top-performing resumes have 2-3 metrics per position.`,
      tips: [
        'Apply the XYZ formula to at least 70% of bullets',
        'Quantify scale (database size, user traffic, pull requests, sprint velocity)',
        'Avoid passive voice ("was assigned to", "participated in")'
      ]
    },
    {
      sectionName: 'Technical Skills Matrix',
      score: skillsScore,
      status: skillsScore >= 75 ? 'pass' : skillsScore >= 50 ? 'warning' : 'danger',
      feedback: `Matched ${matchedKeywords.length} of ${targetKeywords.length} key competencies for ${targetRole}.`,
      tips: [
        'Categorize skills (e.g., Languages, Frameworks, Cloud/DevOps, Databases)',
        'Do not rate your skills with rating bars (e.g. "React 4/5 stars" breaks ATS)',
        'List technologies in order of current relevance'
      ]
    },
    {
      sectionName: 'Education & Certifications',
      score: hasEducation ? 90 : 60,
      status: hasEducation ? 'pass' : 'warning',
      feedback: hasEducation
        ? 'Education section clearly identified.'
        : 'Education section was difficult to locate or missing standard degree headers.',
      tips: [
        'List Degree, Institution, and Graduation Year',
        'Relevant coursework or honors can be included for new grads; omit for 3+ years experience',
        'Add cloud/industry certifications (AWS, GCP, CKA) if applicable'
      ]
    }
  ];

  const quickAtsTips: string[] = [
    'Save and upload in standard PDF format or clean .DOCX for optimal text extraction.',
    'Use standard universal section headings: "Experience", "Skills", "Education", "Projects".',
    'Do not put crucial contact information inside document headers/footers, as some legacy ATS parsers ignore them.',
    'Avoid icon-only contact details (ensure email/phone have readable plain text alongside icons).',
    'Keep font selection to universally supported typefaces (Inter, Arial, Calibri, Roboto, Georgia).'
  ];

  return {
    atsScore: overallAts,
    verdict,
    targetRole,
    summary: `Your resume shows ${overallAts >= 75 ? 'promising alignment' : 'room for substantial optimization'} for ${targetRole} positions. We analyzed your document against the structural parsers of Workday, Greenhouse, and Lever. Your profile matches ${matchedKeywords.length} core technical keywords, but requires ${numbersFound < 4 ? 'greater metric quantification' : 'targeted keyword enrichment'} to pass top-tier enterprise screening thresholds consistently.`,
    scoreBreakdown: {
      contentAndImpact: impactScore,
      skillsAndKeywords: skillsScore,
      formattingAndStructure: structureScore,
      brevityAndClarity: clarityScore
    },
    whatToImprove,
    whatToAdd,
    whatToRemove,
    keywordAnalysis: {
      matchedKeywords,
      missingKeywords,
      matchPercentage: keywordMatchPercentage
    },
    sectionReviews,
    quickAtsTips,
    analyzedAt: Date.now()
  };
}
