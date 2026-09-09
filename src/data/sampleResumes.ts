export interface SampleResume {
  id: string;
  title: string;
  role: string;
  difficultyExpected: string;
  description: string;
  content: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'junior-frontend-needs-work',
    title: 'Junior Frontend Developer',
    role: 'Frontend Developer',
    difficultyExpected: 'Scored ~58/100 (Needs Optimization)',
    description: 'Contains common ATS pitfalls: passive phrasing ("responsible for"), vague soft skills, zero metrics, no GitHub link.',
    content: `ALEX RIVERA
City, State • alex.rivera.dev@gmail.com • (555) 234-5678

OBJECTIVE
Motivated and detail-oriented self-starter seeking a challenging junior frontend developer position at a dynamic company where I can utilize my coding skills and grow as a team player. References available upon request.

EDUCATION
State University — Bachelor of Science in Computer Science
Graduated May 2024 • GPA: 3.6

TECHNICAL SKILLS
Languages: HTML, CSS, JavaScript, Basic TypeScript, Python, C++
Frameworks & Libraries: React, Bootstrap, jQuery
Tools: VS Code, Git, Figma

PROJECTS
E-Commerce Storefront
• Built an online web store using React and Bootstrap.
• Responsible for creating product pages and cart components.
• Worked with team members to connect to dummy REST API endpoints.
• Handled UI design and styling.

Personal Portfolio
• Created a responsive website to showcase university assignments.
• Used CSS media queries for mobile view.

EXPERIENCE
Campus Tech Support — Student Assistant (2022 – 2024)
• Assisted students and faculty with troubleshooting laptop software issues.
• Worked on tickets in ServiceNow and answered telephone calls.
• Maintained computer lab workstations and printers.`
  },
  {
    id: 'mid-fullstack-good',
    title: 'Mid-Level Full Stack Engineer',
    role: 'Full Stack Developer',
    difficultyExpected: 'Scored ~78/100 (Competitive with Gaps)',
    description: 'Good technical foundations and partial metrics, but missing key cloud architecture keywords, system design scale, and live project demo links.',
    content: `JORDAN CHEN
Seattle, WA • jordan.chen@email.com • linkedin.com/in/jordanchen • (555) 789-0123

PROFESSIONAL SUMMARY
Full Stack Software Engineer with 3+ years of experience engineering scalable web applications using React, TypeScript, Node.js, and PostgreSQL. Passionate about performant user interfaces and secure REST APIs.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript (ES6+), SQL, HTML5, CSS3
Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, Vite
Backend: Node.js, Express, PostgreSQL, MongoDB, Redis
DevOps & Tools: Git, Docker, Jest, Postman, Linux

WORK EXPERIENCE
Apex Software Solutions — Full Stack Engineer (2022 – Present)
• Developed responsive customer dashboard modules using React 18, TypeScript, and Tailwind CSS.
• Built and documented 18+ RESTful API endpoints in Node.js/Express, integrating PostgreSQL with Prisma ORM.
• Decreased dashboard page load times by 28% through code splitting, memoization, and lazy loading assets.
• Implemented JWT-based role authentication and session management for 15,000 active users.
• Wrote unit and integration tests using Jest and React Testing Library, maintaining 80% test coverage across core services.

Digital Canvas Labs — Associate Web Developer (2021 – 2022)
• Collaborated with UX designers to convert Figma prototypes into production React components.
• Optimized relational database queries, improving average report generation response time by 1.2 seconds.
• Participated in bi-weekly Agile sprints, daily standups, and rigorous GitHub peer code reviews.

EDUCATION
University of Washington — B.S. in Software Engineering, 2021`
  },
  {
    id: 'senior-staff-high-impact',
    title: 'Senior / Staff Full Stack Architect',
    role: 'Full Stack Developer',
    difficultyExpected: 'Scored ~94/100 (Strong ATS Match)',
    description: 'Exemplary execution: High metric density, Google XYZ formula, modern distributed stack (Next.js, Go/Node, AWS, Kubernetes, Redis, Kafka).',
    content: `SARAH M. VANCE
San Francisco, CA • sarah.vance@techlead.io • (415) 890-1234
linkedin.com/in/sarahmvance • github.com/svance-eng • sarahvance.dev

EXECUTIVE SUMMARY
Senior Full Stack Engineer & Technical Lead with 7+ years of experience architecting distributed cloud systems and high-throughput React web applications. Proven track record driving 40%+ latency reductions, scaling event-driven microservices to 12M+ monthly active users, and mentoring 14+ junior and mid-level engineers.

CORE COMPETENCIES & TECHNICAL MATRIX
• Languages & Runtimes: TypeScript, Go, JavaScript (ESNext), Python, SQL
• Frontend Ecosystem: React 19, Next.js (App Router), State Machines, Web Workers, WebSockets, Tailwind CSS, Micro-Frontends
• Backend & Distributed Systems: Node.js, Go (Gin/gRPC), PostgreSQL, Redis, Apache Kafka, DynamoDB, REST, GraphQL
• Cloud & Infrastructure: AWS (ECS, Lambda, S3, CloudFront), Kubernetes, Docker, Terraform, GitHub Actions CI/CD, Datadog

PROFESSIONAL EXPERIENCE
Starlight Cloud Technologies — Senior Staff Software Engineer (2022 – Present)
• Spearheaded the architectural migration of legacy monolith to Next.js and Go microservices, reducing P99 latency by 54% (780ms → 360ms) for 12M+ monthly active users.
• Engineered an idempotent payment and billing workflow handling $4.8M monthly ARR with 99.99% system availability.
• Introduced distributed Redis caching layers and read-replicas, decreasing primary database connection spikes by 68%.
• Led zero-downtime canary deployment pipelines via GitHub Actions, Docker, and Kubernetes, slashing release cycle time from 4 days to 25 minutes.
• Mentored 8 engineers across 2 cross-functional squads, conducting weekly code architectural clinics and system design teardowns.

Beacon Media Systems — Senior Full Stack Developer (2019 – 2022)
• Built real-time collaborative canvas application utilizing React, TypeScript, WebSockets, and Canvas API, supporting 50 concurrent active editors per board.
• Engineered custom Webpack/Vite build pipeline optimization that trimmed JavaScript bundle size by 42% (3.4MB → 1.9MB) and boosted Google Lighthouse performance from 61 to 96.
• Authored comprehensive Jest, Playwright, and Cypress test suites, increasing automated regression coverage from 45% to 89%.

EDUCATION & CERTIFICATIONS
• University of California, Berkeley — B.S. in Computer Science (2019)
• AWS Certified Solutions Architect – Associate (2023)`
  }
];
