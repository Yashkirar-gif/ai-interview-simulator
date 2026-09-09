import { Question, Role, Difficulty, InterviewType } from '../types';

export const QUESTION_BANK: Record<Role, Record<Difficulty, Question[]>> = {
  frontend: {
    beginner: [
      {
        id: 'fe-beg-1',
        category: 'technical',
        text: 'Can you explain the difference between let, const, and var in JavaScript?',
        expectedKeywords: ['scope', 'hoisting', 'block-scoped', 'reassignment', 'redeclaration', 'temporal dead zone'],
        tips: 'Focus on block scoping, hoisting behavior, and immutability.',
        idealResponse: 'var is function-scoped and hoisted with undefined. let and const are block-scoped and live in the Temporal Dead Zone until initialized. const prevents reassignment of the variable binding.'
      },
      {
        id: 'fe-beg-2',
        category: 'technical',
        text: 'What are HTML semantic tags and why are they important for modern web development?',
        expectedKeywords: ['accessibility', 'seo', 'screen readers', 'header', 'footer', 'main', 'article', 'nav'],
        tips: 'Mention accessibility (a11y), screen reader navigation, and SEO advantages.',
        idealResponse: 'Semantic tags provide intrinsic meaning to web content. They allow assistive technologies like screen readers to navigate landmarks accurately and boost SEO indexing.'
      },
      {
        id: 'fe-beg-3',
        category: 'technical',
        text: 'What is the CSS Box Model and how does box-sizing: border-box change how elements are sized?',
        expectedKeywords: ['content', 'padding', 'border', 'margin', 'box-sizing', 'border-box', 'content-box'],
        tips: 'Explain the layers from inside out and the benefit of border-box.',
        idealResponse: 'The box model comprises content, padding, border, and margin. By default (content-box), padding and border add to the specified width. Setting border-box incorporates padding and border into the element width, simplifying layout calculations.'
      },
      {
        id: 'fe-beg-4',
        category: 'technical',
        text: 'What is a closure in JavaScript and what is a practical real-world use case for it?',
        expectedKeywords: ['lexical scope', 'outer function', 'inner function', 'private variables', 'data encapsulation', 'factory functions'],
        tips: 'Explain that closures retain references to outer scope variables even after the outer function executes.',
        idealResponse: 'A closure is created when an inner function retains access to variables in its outer lexical scope even after the outer function has returned. A classic use case is creating private state, memoization, or event listener callbacks.'
      },
      {
        id: 'fe-beg-5',
        category: 'technical',
        text: 'Explain the difference between CSS Flexbox and CSS Grid. When would you choose one over the other?',
        expectedKeywords: ['one-dimensional', 'two-dimensional', 'row', 'column', 'layout', 'flex-direction', 'grid-template'],
        tips: 'Highlight 1D (Flexbox: alignment along an axis) vs 2D (Grid: rows and columns simultaneously).',
        idealResponse: 'Flexbox is designed for 1-dimensional layouts (arranging items along a row or column). CSS Grid is a 2-dimensional system controlling both rows and columns simultaneously. I choose Flexbox for navbars or card content, and Grid for overall page scaffolding.'
      },
      {
        id: 'fe-beg-6',
        category: 'technical',
        text: 'What are Promises in JavaScript and how does async/await improve asynchronous code over callbacks?',
        expectedKeywords: ['asynchronous', 'resolve', 'reject', 'pending', 'then', 'syntactic sugar', 'event loop', 'try catch'],
        tips: 'Contrast callback hell with flat Promise chains and synchronous-looking async/await syntax.',
        idealResponse: 'A Promise is an object representing the eventual resolution or rejection of an async operation. Async/await is syntactic sugar over Promises that allows writing asynchronous code with try/catch and flat procedural syntax.'
      },
      {
        id: 'fe-beg-7',
        category: 'technical',
        text: 'What is event bubbling and event capturing in the DOM, and how does event.stopPropagation() work?',
        expectedKeywords: ['bubbling', 'capturing', 'propagation', 'target', 'window', 'addEventListener', 'stopPropagation'],
        tips: 'Explain the flow from window down to target (capture), then back up to window (bubble).',
        idealResponse: 'When an event triggers, it trickles down from the window to the target in the capture phase, triggers on the target, then bubbles back up through parent elements. event.stopPropagation() prevents the event from propagating further in either phase.'
      },
      {
        id: 'fe-beg-8',
        category: 'technical',
        text: 'What is the difference between localStorage, sessionStorage, and cookies?',
        expectedKeywords: ['persistence', 'expiration', 'storage capacity', 'http requests', 'client side', 'tab session'],
        tips: 'Compare data lifetime, size limits (5-10MB vs 4KB), and whether data is sent to the server on every request.',
        idealResponse: 'localStorage persists across tabs and browser restarts with ~5-10MB limit. sessionStorage persists only for the lifetime of the tab. Cookies have a 4KB limit, support expiration and HttpOnly flags, and are sent to the server with every HTTP request.'
      },
      {
        id: 'fe-beg-9',
        category: 'technical',
        text: 'What is the difference between == and === in JavaScript?',
        expectedKeywords: ['loose equality', 'strict equality', 'type coercion', 'types', 'implicit conversion'],
        tips: 'Emphasize type coercion in loose equality and why strict equality is best practice.',
        idealResponse: '== performs type coercion before comparison, converting operands to a common type (e.g. "5" == 5 is true). === checks both value and type without coercion, making it safer and predictable.'
      },
      {
        id: 'fe-beg-10',
        category: 'technical',
        text: 'How do array methods map(), filter(), and reduce() differ from each other?',
        expectedKeywords: ['transformation', 'filtering', 'accumulator', 'immutability', 'pure functions', 'return value'],
        tips: 'Explain input and output for each method and emphasize that they do not mutate the original array.',
        idealResponse: 'map transforms each element into a new array of the same length. filter returns a subset of elements passing a boolean test. reduce iterates over the array to accumulate a single value (such as a sum or object).'
      },
      {
        id: 'fe-beg-11',
        category: 'technical',
        text: 'What is CSS Specificity and how does the browser calculate which style rule wins?',
        expectedKeywords: ['inline styles', 'ids', 'classes', 'attributes', 'element selectors', 'important', 'cascade'],
        tips: 'Explain the 0-0-0-0 point system for specificity.',
        idealResponse: 'Specificity determines which CSS rule applies when multiple rules target the same element. It calculates a weight: inline styles (1000), ID selectors (100), class/pseudo-class/attribute selectors (10), and element/pseudo-element selectors (1).'
      },
      {
        id: 'fe-beg-12',
        category: 'technical',
        text: 'What are media queries in CSS and how do you implement a mobile-first responsive design?',
        expectedKeywords: ['responsive', 'breakpoints', 'min-width', 'max-width', 'viewport', 'mobile-first'],
        tips: 'Explain why starting with mobile styling and adding min-width breakpoints produces cleaner CSS.',
        idealResponse: 'Media queries apply CSS rules based on device characteristics like viewport width. Mobile-first design writes base styles for smaller screens first, then uses min-width queries to progressively enhance the layout for tablets and desktops.'
      },
      // Behavioral
      {
        id: 'fe-beg-bh-1',
        category: 'behavioral',
        text: 'Tell me about a time you had to learn a new frontend technology or framework quickly.',
        expectedKeywords: ['learning', 'documentation', 'adaptation', 'practice', 'application', 'outcome', 'timeline'],
        tips: 'Use the STAR method: describe your systematic approach to reading docs, building toy prototypes, and delivering.',
        idealResponse: 'When our project adopted Tailwind CSS, I spent an evening studying the utility-first methodology, built a quick UI prototype, and contributed production components the next sprint.'
      },
      {
        id: 'fe-beg-bh-2',
        category: 'behavioral',
        text: 'Tell me about a challenging bug you solved recently and how you debugged it step-by-step.',
        expectedKeywords: ['problem', 'solution', 'debugging', 'devtools', 'reproduction', 'root cause', 'outcome'],
        tips: 'Showcase structured troubleshooting: reproducing, isolating, using browser DevTools, and testing fixes.',
        idealResponse: 'I encountered an issue where dropdown menus closed unexpectedly on mobile. Using Chrome remote debugging, I identified conflicting touch and click listeners, unified them under Pointer Events, and wrote a regression test.'
      },
      {
        id: 'fe-beg-bh-3',
        category: 'behavioral',
        text: 'How do you handle constructive criticism or suggested changes during code reviews?',
        expectedKeywords: ['feedback', 'growth', 'humility', 'collaboration', 'standards', 'improvement'],
        tips: 'Demonstrate emotional maturity, asking clarifying questions, and treating reviews as continuous learning.',
        idealResponse: 'I separate my personal ego from the code. I appreciate constructive feedback as an opportunity to adhere to team standards, ask clarifying questions if an alternative is suggested, and document takeaways.'
      },
      {
        id: 'fe-beg-bh-4',
        category: 'behavioral',
        text: 'Describe a situation where you felt overwhelmed by competing tasks. How did you prioritize?',
        expectedKeywords: ['prioritization', 'communication', 'impact', 'urgency', 'stakeholder', 'focus'],
        tips: 'Focus on communication with team leads, distinguishing urgency from impact, and delivering incrementally.',
        idealResponse: 'When juggling a critical landing page redesign and multiple bug fixes, I met with my product manager to align on the release priority, broke tasks into morning and afternoon sprints, and delivered the core flow on schedule.'
      },
      // HR
      {
        id: 'fe-beg-hr-1',
        category: 'hr',
        text: 'Why are you interested in specializing in Frontend engineering rather than backend or full stack?',
        expectedKeywords: ['user experience', 'visual impact', 'accessibility', 'direct feedback', 'empathy', 'modern web'],
        tips: 'Convey your genuine enthusiasm for user interaction, visual precision, and performance.',
        idealResponse: 'Frontend sits directly at the intersection of design, engineering, and human interaction. I find it deeply satisfying to build intuitive, accessible interfaces that users experience every day.'
      },
      {
        id: 'fe-beg-hr-2',
        category: 'hr',
        text: 'Where do you see your technical skills growing over the next two to three years?',
        expectedKeywords: ['architecture', 'performance', 'mentorship', 'system design', 'mastery', 'initiative'],
        tips: 'Highlight both technical depth (architecture, performance) and team contributions.',
        idealResponse: 'I aim to master advanced frontend architecture, deepen my knowledge of web performance and accessibility audits, and step into mentoring junior developers while taking ownership of core UI features.'
      }
    ],
    intermediate: [
      {
        id: 'fe-int-1',
        category: 'technical',
        text: 'Describe the browser critical rendering path from HTML parsing to pixel paint.',
        expectedKeywords: ['dom', 'cssom', 'render tree', 'layout', 'paint', 'composite', 'reflow', 'repaint'],
        tips: 'Detail how HTML forms DOM, CSS forms CSSOM, combined into Render Tree, followed by Layout, Paint, and Composite.',
        idealResponse: 'The browser streams HTML and tokenizes it into the DOM tree while parsing stylesheets into the CSSOM. It merges both into a Render Tree, runs Layout (reflow) to calculate geometry, and Paints and Composites layers via the GPU.'
      },
      {
        id: 'fe-int-2',
        category: 'technical',
        text: 'Explain Event Delegation in JavaScript and how event bubbling makes it efficient for large dynamic lists.',
        expectedKeywords: ['bubbling', 'memory efficiency', 'parent listener', 'event.target', 'dynamic elements', 'delegation'],
        tips: 'Contrast attaching 1,000 listeners on list items with 1 listener on the container checking event.target.',
        idealResponse: 'Event delegation places a single event listener on a parent element instead of individual listeners on each child. Because DOM events bubble upwards, the parent catches them and identifies the originating child via event.target, saving memory.'
      },
      {
        id: 'fe-int-3',
        category: 'technical',
        text: 'What is the purpose of the "this" keyword in JavaScript and how does its binding differ between regular functions and arrow functions?',
        expectedKeywords: ['execution context', 'caller', 'lexical this', 'bind', 'call', 'apply', 'arrow functions'],
        tips: 'Contrast runtime dynamic binding (determined by how the function is called) with compile-time lexical scoping in arrow functions.',
        idealResponse: 'In regular functions, "this" is dynamically bound at invocation based on the caller or explicit binding via call/apply/bind. Arrow functions do not bind their own "this"; they lexically capture "this" from their enclosing lexical context.'
      },
      {
        id: 'fe-int-4',
        category: 'technical',
        text: 'Explain the difference between Debounce and Throttle. Provide concrete real-world examples of when to use each.',
        expectedKeywords: ['rate limiting', 'delay', 'interval', 'resize', 'scroll', 'search input', 'autocomplete'],
        tips: 'Debounce groups executions after an inactivity cooldown; throttle guarantees execution at regular intervals.',
        idealResponse: 'Debounce delays function execution until a specified delay has elapsed since the last trigger (ideal for search input autocomplete). Throttle ensures the function runs at most once per fixed time interval (ideal for scroll or window resize handlers).'
      },
      {
        id: 'fe-int-5',
        category: 'technical',
        text: 'What is CORS (Cross-Origin Resource Sharing) and how does the browser preflight OPTIONS request work?',
        expectedKeywords: ['headers', 'origin', 'options', 'access-control-allow-origin', 'preflight', 'same origin policy'],
        tips: 'Explain why browsers enforce Same-Origin Policy and when preflight is triggered for non-simple requests.',
        idealResponse: 'CORS is a browser security protocol that relaxes the Same-Origin Policy under server authorization. For non-simple requests (like custom headers or PUT/DELETE), the browser sends an HTTP OPTIONS preflight request to verify server permissions.'
      },
      {
        id: 'fe-int-6',
        category: 'technical',
        text: 'What are Core Web Vitals (LCP, INP, CLS) and how do you diagnose and optimize each metric?',
        expectedKeywords: ['largest contentful paint', 'interaction to next paint', 'cumulative layout shift', 'performance', 'devtools'],
        tips: 'Mention resource preloading for LCP, yielding to the main thread for INP, and aspect-ratio reservation for CLS.',
        idealResponse: 'LCP measures loading speed, optimized by preloading hero assets and CDN caching. INP measures responsiveness to user interaction, optimized by breaking up long tasks. CLS measures visual stability, optimized by reserving explicit width/height on images.'
      },
      {
        id: 'fe-int-7',
        category: 'technical',
        text: 'What is the JavaScript Event Loop, and what is the difference between Macrotasks and Microtasks?',
        expectedKeywords: ['call stack', 'event loop', 'microtask queue', 'macrotask queue', 'promises', 'settimeout', 'process.nexttick'],
        tips: 'Explain queue priority: the call stack empties, then ALL microtasks execute before the next macrotask is processed.',
        idealResponse: 'The event loop coordinates asynchronous execution. When the call stack empties, the engine executes all tasks in the microtask queue (Promises, queueMicrotask) until empty, before taking the next item from the macrotask queue (setTimeout, setInterval).'
      },
      {
        id: 'fe-int-8',
        category: 'technical',
        text: 'How does TypeScript improve code quality and maintainability over plain JavaScript, and what are generics?',
        expectedKeywords: ['type safety', 'compile time', 'refactoring', 'generics', 'reusability', 'autocomplete', 'interfaces'],
        tips: 'Explain catching bugs before runtime and writing reusable components with generic type parameters <T>.',
        idealResponse: 'TypeScript provides static type checking at compile time, eliminating runtime type errors and supercharging IDE auto-completion. Generics allow writing reusable, type-safe functions and data structures that work across multiple types without losing type safety.'
      },
      {
        id: 'fe-int-9',
        category: 'technical',
        text: 'What are common front-end web security vulnerabilities (XSS, CSRF) and how do you protect against them?',
        expectedKeywords: ['xss', 'cross-site scripting', 'csrf', 'sanitization', 'content security policy', 'samesite cookies', 'tokens'],
        tips: 'Explain sanitizing user inputs for XSS and using SameSite cookie attributes or anti-CSRF tokens.',
        idealResponse: 'XSS involves injecting malicious scripts into the client; mitigate via input sanitization, encoding output, and strict Content Security Policies. CSRF tricks authenticated users into submitting unwanted requests; mitigate with SameSite=Lax/Strict cookies and anti-CSRF tokens.'
      },
      {
        id: 'fe-int-10',
        category: 'technical',
        text: 'How do you optimize modern web application bundle sizes and JavaScript execution times?',
        expectedKeywords: ['code splitting', 'tree shaking', 'dynamic imports', 'minification', 'lazy loading', 'analyzer', 'compression'],
        tips: 'Cover build-time optimizations (Webpack/Vite tree shaking) and runtime optimizations (React.lazy).',
        idealResponse: 'I utilize route-based code splitting via dynamic imports, verify ES modules allow effective tree-shaking, analyze bundle distributions with bundle visualizers, compress assets with Brotli, and defer non-critical third-party scripts.'
      },
      // Behavioral
      {
        id: 'fe-int-bh-1',
        category: 'behavioral',
        text: 'How do you handle disagreements with a teammate regarding a technical architecture or library decision?',
        expectedKeywords: ['communication', 'compromise', 'data', 'objective', 'collaboration', 'consensus', 'prototyping'],
        tips: 'Focus on staying objective, using prototypes or benchmarks, and prioritizing project goals.',
        idealResponse: 'I start by listening deeply to understand their perspective and constraints. Then I suggest building small timeboxed prototypes to compare approaches empirically against metrics like bundle size, DX, and maintainability.'
      },
      {
        id: 'fe-int-bh-2',
        category: 'behavioral',
        text: 'Describe a situation where you had to balance delivering on a tight deadline with writing clean, maintainable code.',
        expectedKeywords: ['trade-offs', 'technical debt', 'communication', 'scope', 'delivery', 'refactoring', 'tickets'],
        tips: 'Demonstrate pragmatic judgment: delivering the MVP cleanly while tracking tech debt formally.',
        idealResponse: 'During an urgent client demo release, I focused on shipping the critical user path cleanly while postponing non-essential abstractions. I immediately documented the technical shortcuts in our backlog and led a refactoring ticket the next sprint.'
      },
      {
        id: 'fe-int-bh-3',
        category: 'behavioral',
        text: 'How do you explain a complex technical constraint or delay to a non-technical product manager or designer?',
        expectedKeywords: ['empathy', 'business impact', 'clarity', 'transparency', 'alternatives', 'solutions'],
        tips: 'Avoid deep acronyms; frame constraints in terms of user experience, risk, and delivery trade-offs.',
        idealResponse: 'I avoid technical jargon and frame the situation around user experience and risk. I present clear options: e.g. shipping a simpler version on time versus the full version with a 2-day delay, empowering stakeholders to decide.'
      },
      // HR
      {
        id: 'fe-int-hr-1',
        category: 'hr',
        text: 'What kind of engineering culture allows you to do your best work?',
        expectedKeywords: ['collaboration', 'psychological safety', 'ownership', 'continuous learning', 'transparency', 'code quality'],
        tips: 'Be authentic about wanting psychological safety, peer code reviews, and high engineering standards.',
        idealResponse: 'I thrive in an environment characterized by psychological safety, transparent communication, and high engineering standards where teams conduct blameless reviews and encourage continuous experimentation.'
      }
    ],
    advanced: [
      {
        id: 'fe-adv-1',
        category: 'technical',
        text: 'Explain Micro-Frontends architecture. What are the key patterns and trade-offs of Webpack Module Federation?',
        expectedKeywords: ['micro-frontends', 'module federation', 'independent deployments', 'shared dependencies', 'orchestration', 'runtime loading'],
        tips: 'Discuss trade-offs: team autonomy and independent deployment versus bundle duplication and shared state coordination.',
        idealResponse: 'Micro-frontends split a large application into independently deployable units. Module Federation enables runtime sharing of code and dependencies across separate builds, trading shared state complexity and runtime overhead for team autonomy.'
      },
      {
        id: 'fe-adv-2',
        category: 'technical',
        text: 'What is Content Security Policy (CSP) and how do nonces, hashes, and Trusted Types mitigate XSS attacks?',
        expectedKeywords: ['security', 'xss', 'nonce', 'sha256', 'trusted types', 'dom-based xss', 'headers'],
        tips: 'Explain how CSP restricts script execution origins and how nonces validate authorized inline scripts.',
        idealResponse: 'CSP is an HTTP header restricting which content sources the browser can execute. Cryptographic nonces ensure only server-authorized inline scripts run. Trusted Types lock down DOM sinks like innerHTML to eliminate DOM-based XSS.'
      },
      {
        id: 'fe-adv-3',
        category: 'technical',
        text: 'How do Web Workers work, and how can they be leveraged along with OffscreenCanvas to eliminate main-thread jank?',
        expectedKeywords: ['web workers', 'multithreading', 'postMessage', 'transferable objects', 'offscreen canvas', 'event loop'],
        tips: 'Contrast main UI thread execution with isolated background threads that cannot touch DOM directly.',
        idealResponse: 'Web Workers run scripts in background threads without blocking the main UI thread. By transferring an OffscreenCanvas via Transferable Objects, heavy graphics or calculations can render at 60fps without causing UI jank.'
      },
      {
        id: 'fe-adv-4',
        category: 'technical',
        text: 'How does modern V8 optimize JavaScript execution (Hidden Classes, Inline Caches, and Ignition/Turbofan)?',
        expectedKeywords: ['v8 engine', 'hidden classes', 'inline caches', 'ignition', 'turbofan', 'jit compilation', 'monomorphic'],
        tips: 'Explain baseline bytecode interpretation vs optimizing compiler and avoiding deoptimizations.',
        idealResponse: 'V8 interprets bytecode using Ignition while Turbofan compiles hot functions into machine code. It uses Hidden Classes to track object shapes and Inline Caches to speed up property lookups. Keeping object shapes consistent avoids costly deoptimizations.'
      },
      {
        id: 'fe-adv-5',
        category: 'technical',
        text: 'How do you architect an enterprise Design System across multiple teams and frameworks?',
        expectedKeywords: ['design tokens', 'component library', 'accessibility', 'versioning', 'figma sync', 'documentation', 'headless ui'],
        tips: 'Focus on design tokens as single source of truth, automated semantic versioning, and headless accessibility.',
        idealResponse: 'I establish design tokens (colors, spacing, typography) as the core source of truth synced from Figma. I build headless, accessible components using Radix or ARIA primitives, document with Storybook, and manage releases via Changesets.'
      },
      // Behavioral
      {
        id: 'fe-adv-bh-1',
        category: 'behavioral',
        text: 'How do you handle leading a technical initiative when a project starts falling behind schedule?',
        expectedKeywords: ['leadership', 'transparency', 'delegation', 're-prioritization', 'ownership', 'critical path'],
        tips: 'Demonstrate leadership: identifying the critical path bottleneck, realigning scope with stakeholders, and unblocking team members.',
        idealResponse: 'I immediately assess the critical path to uncover the real bottleneck. I communicate transparently with product leadership, negotiate cutting non-critical scope, and pair directly with unblocked engineers to hit the milestone.'
      },
      {
        id: 'fe-adv-bh-2',
        category: 'behavioral',
        text: 'Describe a time you had to resolve a high-stakes technical disagreement between senior engineers.',
        expectedKeywords: ['facilitation', 'objectivity', 'benchmarking', 'trade-offs', 'decision matrix', 'alignment'],
        tips: 'Showcase emotional intelligence, establishing objective evaluation criteria, and driving consensus.',
        idealResponse: 'When two leads disagreed on state management architectures, I created an objective evaluation matrix rating both against velocity, bundle size, and learning curve. We ran a 48-hour spike and aligned peacefully behind empirical data.'
      },
      // HR
      {
        id: 'fe-adv-hr-1',
        category: 'hr',
        text: 'How do you mentor mid-level and junior engineers while balancing your own high-impact delivery obligations?',
        expectedKeywords: ['mentorship', 'pair programming', 'delegation', 'empowerment', 'time management', 'sponsorship'],
        tips: 'Highlight coaching others to find solutions rather than just giving answers, creating leverage for the team.',
        idealResponse: 'I view mentoring as high-leverage engineering. I schedule dedicated pairing slots, use Socratic questioning to guide engineers toward finding the architectural solution themselves, and sponsor them for challenging tickets.'
      }
    ]
  },

  react: {
    beginner: [
      {
        id: 'react-beg-1',
        category: 'technical',
        text: 'What is the Virtual DOM in React and how does the reconciliation process work?',
        expectedKeywords: ['virtual dom', 'reconciliation', 'diffing algorithm', 'render', 'real dom', 'performance', 'fiber'],
        tips: 'Explain that the Virtual DOM is an in-memory representation compared against the previous state.',
        idealResponse: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual tree, runs a diffing algorithm during reconciliation, and updates only the changed nodes in the real DOM.'
      },
      {
        id: 'react-beg-2',
        category: 'technical',
        text: 'Explain the rules of React Hooks and why they cannot be called inside loops, conditions, or nested functions.',
        expectedKeywords: ['call order', 'top level', 'linked list', 'fiber', 'consistency', 'rules of hooks'],
        tips: 'Explain that React relies on the exact invocation order of hooks across re-renders.',
        idealResponse: 'Hooks must be called at the top level and only within React function components or custom hooks. React tracks hook state using internal linked lists based on call order; placing hooks in conditions would desynchronize the internal state index.'
      },
      {
        id: 'react-beg-3',
        category: 'technical',
        text: 'What is the purpose of the "key" prop when rendering lists in React, and why is using an array index discouraged?',
        expectedKeywords: ['key', 'identity', 'reconciliation', 'reordering', 'performance', 'mutation', 'index'],
        tips: 'Explain how keys help React identify which items were added, moved, or deleted.',
        idealResponse: 'The key prop gives elements a stable identity across renders so React can track additions, moves, and deletions. Using array indices can lead to UI bugs and broken component state if the list is reordered or filtered.'
      },
      {
        id: 'react-beg-4',
        category: 'technical',
        text: 'What is the difference between props and state in a React component?',
        expectedKeywords: ['props', 'state', 'immutability', 'parent to child', 'internal', 're-render'],
        tips: 'Props are passed from parent to child (read-only); state is managed internally and triggers re-renders on update.',
        idealResponse: 'Props are external inputs passed down from parent components and are read-only to the child. State is internal data managed within the component that can change over time and triggers re-rendering when updated.'
      },
      {
        id: 'react-beg-5',
        category: 'technical',
        text: 'How does useEffect work and how do you properly clean up side effects like intervals or subscriptions?',
        expectedKeywords: ['side effects', 'cleanup function', 'unmount', 'dependency array', 'memory leaks', 'interval'],
        tips: 'Mention returning a cleanup function that React invokes before re-running the effect or on unmount.',
        idealResponse: 'useEffect handles side effects after rendering. When an effect creates a subscription or timer, returning a cleanup function allows React to clean it up before re-running the effect or when the component unmounts, preventing memory leaks.'
      },
      {
        id: 'react-beg-6',
        category: 'technical',
        text: 'What is the difference between controlled and uncontrolled form inputs in React?',
        expectedKeywords: ['controlled', 'uncontrolled', 'value', 'onchange', 'useref', 'single source of truth'],
        tips: 'Controlled inputs have their value driven by React state; uncontrolled inputs rely on the DOM and useRef.',
        idealResponse: 'In a controlled input, form data is handled by a React component state via value and onChange. In an uncontrolled input, form data is handled directly by the DOM itself and accessed via React refs.'
      },
      {
        id: 'react-beg-7',
        category: 'technical',
        text: 'What is "lifting state up" in React and when is it necessary?',
        expectedKeywords: ['shared state', 'parent component', 'sibling communication', 'props', 'unidirectional data flow'],
        tips: 'Explain moving state to the closest common ancestor when multiple child components need to share data.',
        idealResponse: 'Lifting state up means moving state to the closest common ancestor of components that need to share that data. The parent passes down the state via props and update callbacks, maintaining unidirectional data flow.'
      },
      {
        id: 'react-beg-8',
        category: 'technical',
        text: 'When would you choose useReducer instead of useState?',
        expectedKeywords: ['complex state', 'transitions', 'actions', 'reducer function', 'predictability', 'state transitions'],
        tips: 'Highlight complex state objects with multiple sub-values or when the next state depends on previous state.',
        idealResponse: 'useReducer is preferred when managing complex state logic involving multiple sub-values or when state transitions depend on previous state in intricate ways, providing predictable Redux-like action dispatching.'
      },
      // Behavioral
      {
        id: 'react-beg-bh-1',
        category: 'behavioral',
        text: 'Tell me about a time you debugged an infinite re-render loop or memory leak in React.',
        expectedKeywords: ['useeffect', 'dependency array', 'infinite loop', 'profiler', 'setstate', 'root cause'],
        tips: 'Explain recognizing the symptom, checking effect dependencies, and fixing object/function references.',
        idealResponse: 'I encountered an infinite loop caused by an object created inside render and placed in a useEffect dependency array. I stabilized the object using useMemo and refined the dependencies, immediately stopping the cascading re-renders.'
      },
      {
        id: 'react-beg-bh-2',
        category: 'behavioral',
        text: 'How do you approach learning modern React features like Server Components or Hooks when they are released?',
        expectedKeywords: ['documentation', 'experiments', 'sandboxes', 'community', 'adoption', 'trade-offs'],
        tips: 'Discuss reading official React documentation, building sample sandbox projects, and evaluating trade-offs.',
        idealResponse: 'I read the official React documentation and RFCs, build focused sandbox proof-of-concepts to test the API boundaries, and evaluate how the feature impacts bundle size and architecture before proposing it to the team.'
      },
      // HR
      {
        id: 'react-beg-hr-1',
        category: 'hr',
        text: 'What makes React your framework of choice compared to Vue, Angular, or Svelte?',
        expectedKeywords: ['ecosystem', 'component model', 'declarative', 'flexibility', 'community', 'cross-platform'],
        tips: 'Focus on the declarative paradigm, robust ecosystem, and transferable component principles.',
        idealResponse: 'I love React\'s declarative model and "UI as a function of state" paradigm. Its massive ecosystem, rich TypeScript support, and widespread community make solving common frontend problems fast and enjoyable.'
      }
    ],
    intermediate: [
      {
        id: 'react-int-1',
        category: 'technical',
        text: 'Explain the difference between useMemo and useCallback. When should you avoid using them?',
        expectedKeywords: ['memoization', 'referential equality', 'computational cost', 'dependencies', 'premature optimization', 'react.memo'],
        tips: 'useMemo caches a computed value; useCallback caches a function definition. Avoid them when computational cost is negligible.',
        idealResponse: 'useMemo caches the result of an expensive calculation between renders, while useCallback caches a function definition to preserve referential equality for child components wrapped in React.memo. Using them everywhere introduces unnecessary memory overhead.'
      },
      {
        id: 'react-int-2',
        category: 'technical',
        text: 'What are React Custom Hooks and what are the best practices for designing them?',
        expectedKeywords: ['reusability', 'encapsulation', 'separation of concerns', 'stateful logic', 'naming convention', 'use prefix'],
        tips: 'Custom hooks extract stateful logic without duplicating UI. Prefix with "use" and keep them focused.',
        idealResponse: 'Custom hooks allow extracting and sharing stateful logic across components without changing component hierarchy. Best practices include prefixing with "use", keeping them single-purpose, returning clean tuple or object interfaces, and handling cleanup.'
      },
      {
        id: 'react-int-3',
        category: 'technical',
        text: 'How does React Context API work, and what is the "Context re-render problem" in larger applications?',
        expectedKeywords: ['provider', 'consumer', 'prop drilling', 're-renders', 'state splitting', 'zustand', 'memoization'],
        tips: 'Explain that any component reading context re-renders whenever the Provider value changes, regardless of whether it uses the specific updated property.',
        idealResponse: 'Context provides a way to pass data through the component tree without prop drilling. However, whenever the Provider value reference changes, every consuming component re-renders. We solve this by splitting contexts or using selectors with libraries like Zustand.'
      },
      {
        id: 'react-int-4',
        category: 'technical',
        text: 'What are React Error Boundaries, and what types of errors can they NOT catch?',
        expectedKeywords: ['componentdidcatch', 'getderivedstatefromerror', 'runtime errors', 'event handlers', 'async code', 'ssr'],
        tips: 'Error boundaries catch errors during rendering, lifecycle methods, and constructors, but NOT event handlers or async code.',
        idealResponse: 'Error Boundaries are class components that catch JavaScript errors anywhere in their child component tree and display a fallback UI. They do NOT catch errors in event handlers, asynchronous code (like setTimeout or fetch), or server-side rendering.'
      },
      {
        id: 'react-int-5',
        category: 'technical',
        text: 'How does code splitting work with React.lazy and Suspense, and how does it improve initial load time?',
        expectedKeywords: ['dynamic import', 'bundle size', 'suspense', 'fallback', 'chunks', 'lazy loading', 'initial load'],
        tips: 'Explain dynamic imports creating separate webpack/vite chunks that load on demand.',
        idealResponse: 'React.lazy loads components dynamically via ES dynamic imports, splitting the JavaScript bundle into smaller chunks. Suspense renders a fallback UI while the chunk downloads, drastically lowering the initial bundle size and First Contentful Paint.'
      },
      {
        id: 'react-int-6',
        category: 'technical',
        text: 'What is React.memo, and how does its shallow comparison work with non-primitive props like objects and functions?',
        expectedKeywords: ['higher order component', 'shallow comparison', 're-render', 'referential equality', 'props', 'areequal'],
        tips: 'Explain that passing new object or inline function references breaks React.memo unless stabilized with useMemo/useCallback.',
        idealResponse: 'React.memo is a higher-order component that skips rendering if props have not changed using shallow comparison. If props include newly instantiated objects or functions on every parent render, shallow equality fails unless references are stabilized.'
      },
      // Behavioral
      {
        id: 'react-int-bh-1',
        category: 'behavioral',
        text: 'Describe a time you refactored a messy or slow React component into a clean, performant architecture.',
        expectedKeywords: ['refactoring', 'profiler', 'separation of concerns', 'custom hooks', 'performance', 'metrics'],
        tips: 'Share metrics: frame rate improvements, reduced re-renders, and simplified component testability.',
        idealResponse: 'I inherited an 800-line dashboard component suffering from frame drops on user input. Using React DevTools Profiler, I extracted business logic into two custom hooks, split out memoized rows, and reduced render times by 70%.'
      },
      {
        id: 'react-int-bh-2',
        category: 'behavioral',
        text: 'How do you decide between using React Context, Redux, Zustand, or simple local state for a feature?',
        expectedKeywords: ['state management', 'scope', 'complexity', 'trade-offs', 're-renders', 'colocation'],
        tips: 'Advocate for colocating state as close to its consumer as possible and using global stores only when necessary.',
        idealResponse: 'I start with local state and lift up only when needed. For app-wide theme or auth, React Context works well. For complex cross-page state with frequent updates, I prefer Zustand because its atomic selectors prevent excessive re-renders.'
      },
      // HR
      {
        id: 'react-int-hr-1',
        category: 'hr',
        text: 'How do you stay up-to-date with the rapid changes in the React and frontend ecosystem?',
        expectedKeywords: ['newsletters', 'blogs', 'github', 'rfc', 'experiments', 'conferences', 'community'],
        tips: 'Mention specific sources like React official blog, GitHub discussions, and building toy prototypes.',
        idealResponse: 'I follow the official React GitHub discussions, read the React and Next.js release blogs, subscribe to JavaScript Weekly, and test new API proposals in sandbox apps before considering them for production.'
      }
    ],
    advanced: [
      {
        id: 'react-adv-1',
        category: 'technical',
        text: 'How do React 18/19 Concurrent Features (useTransition, useDeferredValue) improve UI responsiveness during heavy updates?',
        expectedKeywords: ['concurrency', 'interruptible rendering', 'usetransition', 'usedeferredvalue', 'non-urgent updates', 'inp'],
        tips: 'Explain marking state updates as non-urgent so urgent interactions (typing, clicking) stay smooth.',
        idealResponse: 'Concurrent React enables interruptible rendering. useTransition marks state updates as non-urgent, allowing the browser to keep responding to immediate user input like typing while rendering expensive UI lists in the background, drastically improving INP.'
      },
      {
        id: 'react-adv-2',
        category: 'technical',
        text: 'What are React Server Components (RSC) and how do they fundamentally differ from traditional Client-Side SSR?',
        expectedKeywords: ['server components', 'client components', 'zero bundle size', 'streaming', 'serialization', 'hydration'],
        tips: 'RSCs execute only on the server, have zero impact on client bundle size, and never hydrate on the client.',
        idealResponse: 'RSCs render purely on the server and stream a JSON-like virtual structure to the browser without shipping their JavaScript dependencies to the client bundle. Unlike SSR which still requires full client-side hydration, RSCs never hydrate, drastically cutting bundle size.'
      },
      {
        id: 'react-adv-3',
        category: 'technical',
        text: 'How does React Fiber work under the hood, and how did it replace the legacy Stack Reconciler?',
        expectedKeywords: ['fiber', 'work loop', 'time slicing', 'linked list', 'requestidlecallback', 'reconciliation', 'scheduler'],
        tips: 'Explain how Fiber turns the component tree into a cooperative multitasking linked list that can pause and resume.',
        idealResponse: 'Fiber restructured React\'s reconciliation from a synchronous recursive stack into a linked list of Fiber nodes. This enables time slicing and cooperative scheduling, allowing React to pause rendering to handle higher-priority user events without dropping frames.'
      },
      {
        id: 'react-adv-4',
        category: 'technical',
        text: 'How do you debug and resolve severe memory leaks in long-running single-page React applications?',
        expectedKeywords: ['memory leaks', 'heap snapshot', 'detached dom nodes', 'event listeners', 'timers', 'closures', 'weakmap'],
        tips: 'Use Chrome DevTools Memory Profiler, compare heap snapshots, and search for detached DOM trees.',
        idealResponse: 'I take sequential Chrome Heap Snapshots before and after interacting with the page. I inspect the Retaining Tree for Detached HTMLElement nodes, uncleaned event listeners on window, and stale closures holding large arrays in memory.'
      },
      // Behavioral
      {
        id: 'react-adv-bh-1',
        category: 'behavioral',
        text: 'Tell me about a time you led a major framework or architectural migration (e.g. Next.js App Router or Redux to Zustand).',
        expectedKeywords: ['migration', 'incremental', 'backwards compatibility', 'feature flags', 'risk mitigation', 'team training'],
        tips: 'Highlight incremental adoption, parallel running, zero downtime, and upskilling teammates.',
        idealResponse: 'I led the migration of a legacy Redux store to Zustand across 50+ views. I designed an adapter layer allowing both stores to co-exist, migrated modules incrementally by domain, and held weekly workshop sessions to upskill the team.'
      },
      // HR
      {
        id: 'react-adv-hr-1',
        category: 'hr',
        text: 'As a senior engineer, how do you balance writing code with system architecture, code reviews, and mentoring?',
        expectedKeywords: ['time management', 'delegation', 'multiplier', 'focus time', 'high leverage', 'strategic impact'],
        tips: 'Explain treating code reviews and architecture as high-leverage activities that multiply the team\'s output.',
        idealResponse: 'I schedule dedicated morning focus blocks for deep architecture and coding, while dedicating afternoons to unblocking teammates, thorough code reviews, and mentoring. I see my primary role as a team multiplier.'
      }
    ]
  },

  fullstack: {
    beginner: [
      {
        id: 'fs-beg-1',
        category: 'technical',
        text: 'What are the principles of RESTful API design and how do HTTP methods (GET, POST, PUT, DELETE, PATCH) map to CRUD operations?',
        expectedKeywords: ['rest', 'stateless', 'idempotent', 'get', 'post', 'put', 'patch', 'delete', 'crud', 'status codes'],
        tips: 'Explain idempotency and the difference between PUT (full replace) and PATCH (partial update).',
        idealResponse: 'REST uses standard HTTP methods to operate on resource URIs statelessly. GET reads data (idempotent), POST creates a new resource, PUT replaces an existing resource completely (idempotent), PATCH updates partial fields, and DELETE removes a resource.'
      },
      {
        id: 'fs-beg-2',
        category: 'technical',
        text: 'What is the fundamental difference between Relational (SQL) and Non-Relational (NoSQL) databases?',
        expectedKeywords: ['schema', 'acid', 'joins', 'horizontal scaling', 'tables', 'documents', 'normalization'],
        tips: 'Compare structured schemas and ACID guarantees in SQL with flexible schemas and easy horizontal scaling in NoSQL.',
        idealResponse: 'SQL databases (like PostgreSQL) use structured schemas with tables, foreign keys, and strong ACID compliance for transactional integrity. NoSQL databases (like MongoDB) use flexible schemas (documents, key-value) that excel at rapid horizontal scaling and semi-structured data.'
      },
      {
        id: 'fs-beg-3',
        category: 'technical',
        text: 'What is the difference between Session-based authentication and JWT (JSON Web Token) token-based authentication?',
        expectedKeywords: ['session id', 'jwt', 'stateless', 'stateful', 'cookies', 'signature', 'database lookup', 'scalability'],
        tips: 'Sessions are stateful and stored in server memory/Redis; JWTs are self-contained, stateless, and cryptographically signed.',
        idealResponse: 'Session-based auth stores session data server-side and sends a session ID cookie, requiring server state lookups on every request. JWT auth is stateless; user claims and cryptographic signatures are verified on the token itself without database lookups.'
      },
      {
        id: 'fs-beg-4',
        category: 'technical',
        text: 'How does Express middleware work, and why is calling next() crucial in request handlers?',
        expectedKeywords: ['middleware', 'pipeline', 'req', 'res', 'next', 'error handling', 'request lifecycle'],
        tips: 'Explain the request-response cycle and how middleware functions intercept, transform, or terminate requests.',
        idealResponse: 'Express middleware functions have access to the request, response, and next callback. They can modify request objects, authenticate tokens, or terminate the response. Calling next() passes control to the next middleware in the pipeline; omitting it leaves the request hanging.'
      },
      {
        id: 'fs-beg-5',
        category: 'technical',
        text: 'What are SQL Joins (INNER, LEFT, RIGHT, FULL) and when do you use an INNER JOIN versus a LEFT JOIN?',
        expectedKeywords: ['inner join', 'left join', 'matching records', 'null values', 'tables', 'foreign keys'],
        tips: 'INNER JOIN returns matching rows from both tables; LEFT JOIN returns all rows from the left table and matched rows from the right.',
        idealResponse: 'INNER JOIN returns records that have matching values in both tables. LEFT JOIN returns all records from the left table and matched records from the right table (filling with NULL if no match exists). Use LEFT JOIN when child records are optional.'
      },
      {
        id: 'fs-beg-6',
        category: 'technical',
        text: 'What are environment variables and why should sensitive credentials like API keys never be committed to Git?',
        expectedKeywords: ['environment variables', '.env', 'secrets', 'security', 'git ignore', 'credential leakage', 'config'],
        tips: 'Explain separation of code and config, risk of automated scrapers, and using .env.example files.',
        idealResponse: 'Environment variables keep configuration and secrets separate from application code across environments. Committing credentials to Git exposes them to malicious scrapers and violates security compliance; they should be kept in .env files added to .gitignore.'
      },
      // Behavioral
      {
        id: 'fs-beg-bh-1',
        category: 'behavioral',
        text: 'Describe a time when you had to debug a full-stack issue that crossed between the frontend UI and the backend API.',
        expectedKeywords: ['network tab', 'logs', 'payload', 'status code', 'isolation', 'reproduction', 'fix'],
        tips: 'Show structured tracing: inspecting the Network tab payload, checking server logs, and isolating the boundary.',
        idealResponse: 'I debugged a form submission failing on mobile. By inspecting Network requests, I noticed an unexpected date formatting string rejected by the backend schema validator. I aligned the payload formats and added automated integration tests.'
      },
      // HR
      {
        id: 'fs-beg-hr-1',
        category: 'hr',
        text: 'What excites you most about working across both frontend and backend layers of a product?',
        expectedKeywords: ['end-to-end ownership', 'holistic view', 'user impact', 'versatility', 'problem solving'],
        tips: 'Highlight the satisfaction of seeing a feature through from database schema to end-user UI interaction.',
        idealResponse: 'I love full-stack development because it gives me end-to-end ownership. Being able to design the database schema, write the API contracts, and craft the interactive frontend UI gives me a complete understanding of how the product serves users.'
      }
    ],
    intermediate: [
      {
        id: 'fs-int-1',
        category: 'technical',
        text: 'How do database indexes work (e.g. B-Trees) and what are the trade-offs of adding too many indexes to a table?',
        expectedKeywords: ['b-tree', 'indexing', 'query performance', 'read speed', 'write overhead', 'disk space', 'select'],
        tips: 'Indexes speed up SELECT queries drastically but slow down INSERT/UPDATE/DELETE operations and consume storage.',
        idealResponse: 'Database indexes use balanced trees (B-Trees) to allow logarithmic O(log N) lookup time instead of full table scans. However, every index incurs write overhead on INSERT, UPDATE, and DELETE operations and consumes disk space, so indexing should be selective.'
      },
      {
        id: 'fs-int-2',
        category: 'technical',
        text: 'What are ACID properties in database transactions and how do they prevent data corruption in financial or checkout flows?',
        expectedKeywords: ['atomicity', 'consistency', 'isolation', 'durability', 'transactions', 'rollback', 'concurrency'],
        tips: 'Define Atomicity (all or nothing), Consistency, Isolation, and Durability.',
        idealResponse: 'ACID guarantees reliable transactions: Atomicity ensures all steps succeed or everything rolls back; Consistency preserves integrity constraints; Isolation prevents concurrent transactions from interfering; Durability guarantees committed data survives crashes.'
      },
      {
        id: 'fs-int-3',
        category: 'technical',
        text: 'What caching strategies (e.g. Cache-Aside, Write-Through) do you use with Redis, and how do you handle cache invalidation?',
        expectedKeywords: ['redis', 'cache aside', 'write through', 'ttl', 'invalidation', 'stale data', 'eviction'],
        tips: 'Explain Cache-Aside (check cache first, fallback to DB, write back) and setting reasonable TTLs.',
        idealResponse: 'In Cache-Aside, the application queries Redis first; on a cache miss, it reads from the database and populates Redis with a Time-To-Live (TTL). On updates, the application writes to the DB and invalidates the cached key to prevent stale reads.'
      },
      {
        id: 'fs-int-4',
        category: 'technical',
        text: 'What are the main rate limiting algorithms (Token Bucket, Leaky Bucket, Sliding Window) and how do they protect APIs?',
        expectedKeywords: ['rate limiting', 'token bucket', 'sliding window', 'ddos', 'throttling', 'redis', 'headers'],
        tips: 'Explain preventing brute force and server overload while returning HTTP 429 Too Many Requests.',
        idealResponse: 'Rate limiting protects APIs from abuse and DDoS. The Token Bucket algorithm allows bursts of requests while maintaining a steady replenishment rate. Sliding Window Log provides precision by counting requests within a rolling time window using Redis sorted sets.'
      },
      {
        id: 'fs-int-5',
        category: 'technical',
        text: 'How does OAuth 2.0 Authorization Code flow with PKCE work, and why is PKCE recommended for single-page applications?',
        expectedKeywords: ['oauth', 'authorization code', 'pkce', 'code verifier', 'code challenge', 'tokens', 'security'],
        tips: 'Explain that SPAs cannot safely store a client secret, and PKCE prevents interception of the authorization code.',
        idealResponse: 'In Authorization Code Flow with PKCE, the client generates a cryptographic code_verifier and code_challenge. When exchanging the auth code for access tokens, the server verifies the secret hash, preventing attackers from intercepting authorization codes on public clients.'
      },
      // Behavioral
      {
        id: 'fs-int-bh-1',
        category: 'behavioral',
        text: 'Tell me about a time you handled a critical production incident or unexpected database failure.',
        expectedKeywords: ['incident response', 'triage', 'rollback', 'monitoring', 'communication', 'post-mortem'],
        tips: 'Highlight maintaining composure, rolling back or mitigating user impact first, then investigating the root cause.',
        idealResponse: 'During high traffic, our database connection pool was exhausted due to unindexed queries. I immediately scaled read replicas and temporarily increased pool limits to restore service, then deployed query indexes and ran a blameless post-mortem.'
      },
      // HR
      {
        id: 'fs-int-hr-1',
        category: 'hr',
        text: 'How do you foster productive collaboration between frontend engineers, backend engineers, and product designers?',
        expectedKeywords: ['api contracts', 'openapi', 'swagger', 'mock servers', 'communication', 'empathy'],
        tips: 'Advocate for establishing clear API contracts early (e.g. OpenAPI schemas or mock endpoints) before coding begins.',
        idealResponse: 'I encourage drafting OpenAPI schemas and establishing mock endpoints at the start of a sprint. This lets frontend and backend engineers build in parallel against a shared contract without blocking each other, minimizing misunderstandings.'
      }
    ],
    advanced: [
      {
        id: 'fs-adv-1',
        category: 'technical',
        text: 'Explain the CAP Theorem and how you make trade-offs between Consistency and Availability in distributed systems.',
        expectedKeywords: ['cap theorem', 'consistency', 'availability', 'partition tolerance', 'distributed systems', 'eventual consistency'],
        tips: 'Network partitions are inevitable; distributed systems must choose between Consistency (CP) or Availability (AP).',
        idealResponse: 'The CAP theorem states that a distributed data store can simultaneously guarantee at most two of Consistency, Availability, and Partition Tolerance. Since network partitions cannot be avoided, systems like DynamoDB choose Availability with Eventual Consistency (AP), while relational distributed databases favor Consistency (CP).'
      },
      {
        id: 'fs-adv-2',
        category: 'technical',
        text: 'What is Event-Driven Architecture and how do message brokers like Apache Kafka or RabbitMQ enable decoupled microservices?',
        expectedKeywords: ['event driven', 'kafka', 'rabbitmq', 'pub sub', 'decoupling', 'asynchronous', 'consumer groups', 'dead letter queue'],
        tips: 'Discuss asynchronous decoupling, consumer groups for horizontal scale, and dead letter queues for failed message handling.',
        idealResponse: 'Event-driven architecture decouples services by having producers emit events to message queues or log-based streams like Kafka without knowing who consumes them. Consumer groups process messages asynchronously at their own rate, enabling fault tolerance and horizontal scale.'
      },
      {
        id: 'fs-adv-3',
        category: 'technical',
        text: 'How do you execute a zero-downtime database schema migration on a high-throughput table with hundreds of millions of rows?',
        expectedKeywords: ['zero downtime', 'expand and contract', 'backfill', 'dual writing', 'shadow tables', 'blue green'],
        tips: 'Use the Expand and Contract pattern: add nullable column, dual-write, backfill existing rows, switch reads, remove old column.',
        idealResponse: 'I use the Expand and Contract pattern: 1) Add the new column as nullable; 2) Deploy code that dual-writes to both old and new columns; 3) Run a background script backfilling existing rows; 4) Switch application reads to the new column; 5) Deprecate and drop the old column.'
      },
      {
        id: 'fs-adv-4',
        category: 'technical',
        text: 'What are Idempotency Keys and how do they guarantee exactly-once processing in payment or financial transaction systems?',
        expectedKeywords: ['idempotency', 'distributed systems', 'unique key', 'replay', 'payments', 'atomic', 'redis lock'],
        tips: 'Explain how client-generated UUIDs prevent double charging during network retries.',
        idealResponse: 'An Idempotency Key is a unique token generated by the client and sent with mutating requests (like payments). The server checks if the key has been processed using an atomic lock or database constraint; if so, it returns the cached result, preventing duplicate transactions on retries.'
      },
      // Behavioral
      {
        id: 'fs-adv-bh-1',
        category: 'behavioral',
        text: 'Describe how you conducted a post-mortem after a major system outage and created systemic improvements.',
        expectedKeywords: ['blameless post-mortem', '5 whys', 'timeline', 'action items', 'prevention', 'monitoring', 'culture'],
        tips: 'Emphasize a blameless culture, 5 Whys analysis, and actionable preventive measures.',
        idealResponse: 'I led a blameless post-mortem using the 5 Whys framework to establish a clear incident timeline. We identified the root cause in database failover timeouts, added automated health alerts, and updated runbooks.'
      }
    ]
  }
};

/**
 * Storage keys for persistent question history deduplication.
 * Stored in localStorage so it persists across browser restarts, new tabs, and reloads.
 */
const PERSISTENT_SEEN_KEY = 'ais_persistent_answered_ids';
const SEEN_COUNTS_KEY = 'ais_question_frequency_map';

/**
 * Get all previously seen question IDs for this device/user.
 */
export function getPersistentSeenQuestionIds(deviceId?: string): Set<string> {
  const seenSet = new Set<string>();
  try {
    const raw = localStorage.getItem(PERSISTENT_SEEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(id => seenSet.add(id));
    }
    if (deviceId) {
      const devRaw = localStorage.getItem(`${PERSISTENT_SEEN_KEY}_${deviceId}`);
      if (devRaw) {
        const parsed = JSON.parse(devRaw);
        if (Array.isArray(parsed)) parsed.forEach(id => seenSet.add(id));
      }
    }
  } catch (e) {
    // ignore
  }
  return seenSet;
}

/**
 * Record question IDs as seen so they won't repeat on future tests.
 */
export function recordSeenQuestionIds(ids: string[], deviceId?: string): void {
  try {
    const existing = getPersistentSeenQuestionIds(deviceId);
    ids.forEach(id => existing.add(id));
    const arr = Array.from(existing);
    localStorage.setItem(PERSISTENT_SEEN_KEY, JSON.stringify(arr));
    if (deviceId) {
      localStorage.setItem(`${PERSISTENT_SEEN_KEY}_${deviceId}`, JSON.stringify(arr));
    }

    // Update frequency map
    const rawFreq = localStorage.getItem(SEEN_COUNTS_KEY);
    const freq: Record<string, number> = rawFreq ? JSON.parse(rawFreq) : {};
    ids.forEach(id => {
      freq[id] = (freq[id] || 0) + 1;
    });
    localStorage.setItem(SEEN_COUNTS_KEY, JSON.stringify(freq));
  } catch (e) {
    // ignore
  }
}

/**
 * Reset seen question history if the candidate or admin explicitly wants to reset.
 */
export function resetSeenQuestionHistory(deviceId?: string): void {
  try {
    localStorage.removeItem(PERSISTENT_SEEN_KEY);
    if (deviceId) localStorage.removeItem(`${PERSISTENT_SEEN_KEY}_${deviceId}`);
    localStorage.removeItem(SEEN_COUNTS_KEY);
    sessionStorage.removeItem('ais_recent_question_ids');
  } catch (e) {
    // ignore
  }
}

/**
 * Returns a randomized, diverse mix of questions tailored to the role, difficulty,
 * and interview type, strictly prioritizing questions the candidate has NEVER seen before.
 */
export function getRandomQuestions(
  role: Role,
  difficulty: Difficulty,
  count: number = 3,
  interviewType: InterviewType = 'technical',
  deviceId?: string,
  extraExcludedIds?: string[]
): Question[] {
  const bank = QUESTION_BANK[role]?.[difficulty] || [];
  if (bank.length === 0) return [];

  // Read all persistent seen question IDs
  const seenIds = getPersistentSeenQuestionIds(deviceId);
  if (Array.isArray(extraExcludedIds)) {
    extraExcludedIds.forEach(id => seenIds.add(id));
  }

  // Read frequency map to pick least-seen if bank is completely exhausted
  let freqMap: Record<string, number> = {};
  try {
    const rawFreq = localStorage.getItem(SEEN_COUNTS_KEY);
    if (rawFreq) freqMap = JSON.parse(rawFreq);
  } catch (e) {
    freqMap = {};
  }

  // Categorize questions
  const technicalQuestions = bank.filter(q => q.category === 'technical');
  const behavioralQuestions = bank.filter(q => q.category === 'behavioral');
  const hrQuestions = bank.filter(q => q.category === 'hr');

  const shuffle = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper to pick unseen questions first, then fallback to least frequently seen
  const pickFromPool = (pool: Question[], neededCount: number): Question[] => {
    if (pool.length === 0 || neededCount <= 0) return [];

    const unseen = pool.filter(q => !seenIds.has(q.id));
    if (unseen.length >= neededCount) {
      return shuffle(unseen).slice(0, neededCount);
    }

    // If unseen is fewer than needed, take all unseen + least frequently seen
    const seen = pool.filter(q => seenIds.has(q.id));
    // Sort seen by ascending frequency, with slight random jitter
    const sortedSeen = seen.sort((a, b) => {
      const countA = (freqMap[a.id] || 0) + Math.random() * 0.2;
      const countB = (freqMap[b.id] || 0) + Math.random() * 0.2;
      return countA - countB;
    });

    return [...shuffle(unseen), ...sortedSeen.slice(0, neededCount - unseen.length)];
  };

  let selected: Question[] = [];

  if (interviewType === 'behavioral') {
    // All behavioral
    selected = pickFromPool(behavioralQuestions.length > 0 ? behavioralQuestions : bank, count);
  } else if (interviewType === 'hr') {
    // HR + behavioral mix
    const hrPool = hrQuestions.length > 0 ? hrQuestions : behavioralQuestions;
    selected = pickFromPool(hrPool, count);
  } else if (interviewType === 'coding') {
    // Technical deep dive
    selected = pickFromPool(technicalQuestions, count);
  } else {
    // Technical (Standard mock interview): 2 technical + 1 behavioral (or proportional)
    const targetTech = Math.max(1, count - 1);
    const targetBh = count - targetTech;

    const chosenTech = pickFromPool(technicalQuestions, targetTech);
    const bhPool = behavioralQuestions.length > 0 ? behavioralQuestions : hrQuestions;
    const chosenBh = pickFromPool(bhPool, targetBh);

    selected = shuffle([...chosenTech, ...chosenBh]);
  }

  // Safety fallback if bank still has space to satisfy count
  if (selected.length < count) {
    const remainingPool = bank.filter(q => !selected.some(s => s.id === q.id));
    const extra = pickFromPool(remainingPool, count - selected.length);
    selected = [...selected, ...extra];
  }

  // Record selected IDs into persistent seen tracker
  recordSeenQuestionIds(selected.map(q => q.id), deviceId);

  return selected;
}

/**
 * Swap a question mid-interview with a fresh unseen question.
 */
export function getSingleUnseenQuestion(
  role: Role,
  difficulty: Difficulty,
  interviewType: InterviewType = 'technical',
  currentQuestionIds: string[],
  categoryPreference?: 'technical' | 'behavioral' | 'hr',
  deviceId?: string
): Question | null {
  const bank = QUESTION_BANK[role]?.[difficulty] || [];
  if (bank.length === 0) return null;

  const seenIds = getPersistentSeenQuestionIds(deviceId);
  currentQuestionIds.forEach(id => seenIds.add(id));

  let pool = bank.filter(q => !currentQuestionIds.includes(q.id));
  if (categoryPreference) {
    const catFiltered = pool.filter(q => q.category === categoryPreference);
    if (catFiltered.length > 0) pool = catFiltered;
  }

  const unseen = pool.filter(q => !seenIds.has(q.id));
  if (unseen.length > 0) {
    const chosen = unseen[Math.floor(Math.random() * unseen.length)];
    recordSeenQuestionIds([chosen.id], deviceId);
    return chosen;
  }

  // Fallback to least seen
  let freqMap: Record<string, number> = {};
  try {
    const rawFreq = localStorage.getItem(SEEN_COUNTS_KEY);
    if (rawFreq) freqMap = JSON.parse(rawFreq);
  } catch (e) {}

  const sorted = pool.sort((a, b) => (freqMap[a.id] || 0) - (freqMap[b.id] || 0));
  const chosen = sorted[0] || null;
  if (chosen) {
    recordSeenQuestionIds([chosen.id], deviceId);
  }
  return chosen;
}
