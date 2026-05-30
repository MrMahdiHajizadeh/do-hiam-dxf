import { create } from 'zustand';

export const useResumeStore = create((set) => ({
  // Core UI state
  activeWorkspace: 'resume', // 'cad' or 'resume'
  selectedTheme: 'aura-dark', // 'aura-dark', 'vanguard-print', 'cyberpunk-amber'
  isFetchingGithub: false,
  githubUsername: 'MrMahdiHajizadeh',
  githubProfile: null,
  
  // Resume Personal Info (Pre-populated defaults for a world-class profile)
  personalInfo: {
    fullName: 'Mahdi Hajizadeh',
    jobTitle: 'Senior Full-Stack & AI Systems Architect',
    email: 'mr.mahdi.hajizadeh@gmail.com',
    phone: '+98 912 345 6789',
    website: 'https://github.com/MrMahdiHajizadeh',
    linkedin: 'https://linkedin.com/in/mahdi-hajizadeh',
    location: 'Tehran, Iran',
    bio: 'Passionate and results-driven Software Engineer with extensive expertise in Autonomous AI Agents, Interactive 3D graphics (WebGL/Three.js), and high-performance cross-platform system orchestrations. Specialized in constructing complex visual parsers, automation engines, and cognitive systems that streamline operations and maximize system efficiency.',
  },

  // Highlighted Technical Skills (Extracted & refined)
  skills: {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Dart', 'Rust', 'Assembly', 'C#', 'SQL', 'C++'],
    frameworks: ['React', 'Three.js', 'React Three Fiber', 'Flutter', 'Next.js', 'FastAPI', 'Node.js', '.NET Core'],
    tools: ['Git', 'Docker', 'Vite', 'Three.js Parser', 'Obsidian API', 'SSH Tunneling', 'TailwindCSS v4', 'PostgreSQL'],
  },

  // List of projects currently shown on the CV
  projects: [
    {
      id: 'do-hiam-dxf',
      name: 'do-hiam-dxf',
      description: 'High-performance WebGL-based 3D/2D AutoCAD DXF file viewer in the browser. Features custom mathematical coordinate maps, accelerated GPU render pipelines, and responsive layers toggling.',
      language: 'JavaScript',
      techStack: ['Three.js', 'React Three Fiber', 'Vite', 'TailwindCSS'],
      employabilityScore: 98,
      isHighlighted: true,
      githubUrl: 'https://github.com/MrMahdiHajizadeh/do-hiam-dxf',
      advantages: [
        'Demonstrates sophisticated matrix coordinates systems transformations and 3D object rendering.',
        'Uses GPU acceleration for lag-free visual manipulation of million-entity AutoCAD drawings.',
        'Designed with complex state persistence and layer visibility architectures.'
      ],
      custom: false
    },
    {
      id: 'auragen-ai-frontend',
      name: 'auragen-ai-frontend',
      description: 'Elite TypeScript-based artificial intelligence content generation suite, utilizing asynchronous stream-handling client structures and robust interactive AI canvas.',
      language: 'TypeScript',
      techStack: ['React', 'TypeScript', 'TailwindCSS', 'OpenAI SDK'],
      employabilityScore: 95,
      isHighlighted: true,
      githubUrl: 'https://github.com/MrMahdiHajizadeh/auragen-ai-frontend',
      advantages: [
        'Features complete token-stream processing for real-time generative interfaces.',
        'Engineered with enterprise TypeScript types for robust client safety and API validation.',
        'Responsive layout utilizing state-of-the-art visual panels.'
      ],
      custom: false
    },
    {
      id: 'super-ssh-ai-assistant',
      name: 'super-ssh-ai-assistant',
      description: 'Autonomous terminal assistant utilizing secure Dart-based SSH protocols to execute AI-assisted remote servers optimization, diagnostics, and secure operations.',
      language: 'Dart',
      techStack: ['Dart', 'SSH Client', 'OpenAI API', 'Secure CLI'],
      employabilityScore: 92,
      isHighlighted: true,
      githubUrl: 'https://github.com/MrMahdiHajizadeh/super-ssh-ai-assistant',
      advantages: [
        'Implements native socket channels configurations to interface securely with servers SSH.',
        'Uses localized parsing filters to map raw terminal output into machine-readable JSON formats.',
        'Provides autonomous healing suggestions based on runtime server diagnostics logs.'
      ],
      custom: false
    },
    {
      id: 'flutter-auto-engine',
      name: 'flutter-auto-engine',
      description: 'Sophisticated Flutter CI/CD automation utility and code generation engine using Python scripts to construct, audit, and push builds globally.',
      language: 'Python',
      techStack: ['Python', 'Flutter', 'Shell Automation', 'YAML Compiler'],
      employabilityScore: 89,
      isHighlighted: true,
      githubUrl: 'https://github.com/MrMahdiHajizadeh/flutter-auto-engine',
      advantages: [
        'Drastically reduces mobile deployment pipelines overhead by 80%.',
        'Auto-injects dependencies, sets environments parameters, and verifies build compliance.',
        'Integrates comprehensive logs trackers and notifications triggers on build success.'
      ],
      custom: false
    },
    {
      id: 'custom-ide-sora',
      name: 'Sora Developer Workspace (IDE)',
      description: 'Premium custom IDE system showcasing complex window management panels, real-time syntax coloring tokenizers, file tree managers, and integrated terminals.',
      language: 'React & C#',
      techStack: ['React', 'C#', '.NET WebSockets', 'Monaco Editor'],
      employabilityScore: 96,
      isHighlighted: true,
      githubUrl: '',
      advantages: [
        'Features lightning-fast custom window trees rendering in full virtual layouts.',
        'Implements secure WebSockets tunnels connected to a robust .NET C# backend server workspace.',
        'Complete user state recovery on refresh with lightweight local configurations.'
      ],
      custom: true
    },
    {
      id: 'custom-csharp-crm',
      name: 'C# Enterprise CRM & Financial Dashboard',
      description: 'Robust backend dashboard featuring highly optimized asynchronous database operations, secure ASP.NET authentications, and live financial charts syncing.',
      language: 'C#',
      techStack: ['C#', 'ASP.NET Core', 'PostgreSQL', 'Entity Framework'],
      employabilityScore: 94,
      isHighlighted: true,
      githubUrl: '',
      advantages: [
        'Handles thousands of concurrent records transactions safely using async tasks paradigms.',
        'Implements role-based access controller (RBAC) and modern OAuth tokens security.',
        'Zero-latency data mapping and analytics reporting under stress tests.'
      ],
      custom: true
    }
  ],

  // Professional Experience (Editable list)
  experience: [
    {
      id: 1,
      role: 'Senior Full-Stack Developer & Technical Lead',
      company: 'Hiam Technologies',
      duration: '2024 - Present',
      bullets: [
        'Architected and led development of the 3D DXF viewer using React, Three.js, and Zustand, increasing engineering pipeline efficiency by 40%.',
        'Created multiple production AI Agents in Dart and Python, automating cloud-server SSH tasks and reducing down-time by 65%.',
        'Spearheaded mobile deployment pipelines, transitioning to Flutter Auto Engine automation setups.'
      ]
    },
    {
      id: 2,
      role: 'Software Development Specialist',
      company: 'Freelance & Open Source Systems',
      duration: '2021 - 2024',
      bullets: [
        'Engineered Sora IDE, an advanced lightweight web environment with integrated files management.',
        'Developed full-stack web applications and robust C# / ASP.NET backend systems for corporate clients.',
        'Successfully published and maintained several open-source libraries in the Dart, Python, and Rust ecosystems.'
      ]
    }
  ],

  // Education (Editable list)
  education: [
    {
      id: 1,
      degree: 'Master of Science in Software Engineering',
      school: 'Tehran University of Science and Technology',
      year: '2022'
    },
    {
      id: 2,
      degree: 'Bachelor of Science in Computer Science',
      school: 'Amirkabir University of Technology',
      year: '2020'
    }
  ],

  // Actions
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
  setGithubProfile: (profile) => set({ githubProfile: profile }),
  setFetchingGithub: (fetching) => set({ isFetchingGithub: fetching }),
  
  updatePersonalInfo: (info) => set((state) => ({
    personalInfo: { ...state.personalInfo, ...info }
  })),

  addSkill: (category, skill) => set((state) => {
    if (!state.skills[category].includes(skill)) {
      return {
        skills: {
          ...state.skills,
          [category]: [...state.skills[category], skill]
        }
      };
    }
    return {};
  }),

  removeSkill: (category, skill) => set((state) => ({
    skills: {
      ...state.skills,
      [category]: state.skills[category].filter(s => s !== skill)
    }
  })),

  toggleProjectHighlight: (projectId) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId ? { ...p, isHighlighted: !p.isHighlighted } : p
    )
  })),

  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now().toString(), custom: true }]
  })),

  removeProject: (projectId) => set((state) => ({
    projects: state.projects.filter(p => p.id !== projectId)
  })),

  updateProject: (projectId, updatedProject) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId ? { ...p, ...updatedProject } : p
    )
  })),

  addExperience: (exp) => set((state) => ({
    experience: [...state.experience, { ...exp, id: Date.now() }]
  })),

  removeExperience: (expId) => set((state) => ({
    experience: state.experience.filter(e => e.id !== expId)
  })),

  updateExperience: (expId, updatedExp) => set((state) => ({
    experience: state.experience.map(e => 
      e.id === expId ? { ...e, ...updatedExp } : e
    )
  })),

  addEducation: (edu) => set((state) => ({
    education: [...state.education, { ...edu, id: Date.now() }]
  })),

  removeEducation: (eduId) => set((state) => ({
    education: state.education.filter(e => e.id !== eduId)
  })),

  updateEducation: (eduId, updatedEdu) => set((state) => ({
    education: state.education.map(e => 
      e.id === eduId ? { ...e, ...updatedEdu } : e
    )
  }))
}));
