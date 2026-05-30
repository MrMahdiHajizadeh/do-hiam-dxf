/**
 * Heuristic analyzer that calculates hiring impact scores and resumes points
 * for dynamically fetched GitHub repositories.
 */

export function calculateEmployability(repo) {
  const name = repo.name.lowerCase ? repo.name.toLowerCase() : (repo.name || '').toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const lang = (repo.language || 'JavaScript').toLowerCase();
  
  let score = 75; // Baseline score
  
  // 1. Language Complexity Weights
  const complexLanguages = ['rust', 'c++', 'c#', 'csharp', 'assembly', 'asm', 'typescript', 'dart', 'python', 'go'];
  if (complexLanguages.includes(lang)) {
    score += 10;
  }
  
  // 2. Project Significance & Scope
  if (repo.size > 2000) {
    score += 8; // Multi-megabyte codebase
  } else if (repo.size > 200) {
    score += 4;
  }
  
  // 3. GitHub Engagement
  if (repo.stargazers_count > 10) {
    score += 5;
  }
  
  // 4. Feature Keywords Impact
  if (name.includes('ai') || name.includes('agent') || name.includes('assistant') || desc.includes('ai') || desc.includes('gpt') || desc.includes('llm')) {
    score += 5;
  }
  if (name.includes('dxf') || name.includes('webgl') || name.includes('canvas') || name.includes('three') || desc.includes('3d') || desc.includes('graphics')) {
    score += 5;
  }
  if (name.includes('engine') || name.includes('automation') || name.includes('compiler') || desc.includes('automation') || desc.includes('pipeline')) {
    score += 4;
  }
  
  // Cap at 99 for realism
  return Math.min(score, 99);
}

export function generateHiringAdvantages(repo) {
  const name = (repo.name || '').toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const lang = (repo.language || 'JavaScript').toLowerCase();
  
  let highlights = [];
  
  // Context-aware hiring highlights generator
  if (name.includes('dxf') || name.includes('mesh') || name.includes('canvas') || name.includes('three') || desc.includes('3d') || desc.includes('graphics')) {
    highlights = [
      'Demonstrates high-fidelity WebGL engineering and complex matrix mathematical coordinates mappings.',
      'Utilizes advanced GPU render loops optimizations for handling vast graphical dataset layers.',
      'Implements comprehensive reactive UI frameworks integration alongside robust rendering canvas.'
    ];
  } else if (name.includes('ai') || name.includes('gpt') || name.includes('assistant') || name.includes('agent') || desc.includes('llm') || desc.includes('cognitive') || name.includes('sovergin') || name.includes('hayat')) {
    highlights = [
      'Architects cognitive multi-agent orchestration loops utilizing large language models API layers.',
      'Features high-performance asynchronous client handling for real-time streams processing.',
      'Implements reliable prompt templating structures and validation checks under complex workflows.'
    ];
  } else if (name.includes('flutter') || name.includes('dart') || lang === 'dart') {
    highlights = [
      'Engineers highly responsive mobile interface modules using clean architectural design patterns.',
      'Optimizes multi-thread processing states and secure background system processes.',
      'Implements reactive stream channels for native hardware and cloud communications.'
    ];
  } else if (name.includes('automation') || name.includes('scraping') || name.includes('engine') || desc.includes('workflow')) {
    highlights = [
      'Constructs highly robust automation pipelines which reduce manual development overhead by 70%.',
      'Designs programmatic scrapers utilizing parallel worker sockets and intelligent IP rotation schemes.',
      'Features comprehensive logs capture systems and telemetry indicators for system health.'
    ];
  } else if (lang === 'rust') {
    highlights = [
      'Leverages Rust memory safety features and zero-cost abstractions to implement highly secure tools.',
      'Optimizes CPU utilization via parallel multi-threading and asynchronous background workers.',
      'Creates reusable, compiled library structures that run at near metal speeds.'
    ];
  } else if (lang === 'c#' || lang === 'csharp' || name.includes('c#')) {
    highlights = [
      'Implements object-oriented backend microservices utilizing ASP.NET Core web architectures.',
      'Designs structured database integrations with Entity Framework Core and advanced LINQ expressions.',
      'Optimizes multi-tasking synchronization loops for robust enterprise service loads.'
    ];
  } else {
    // Fallback general highlights
    highlights = [
      `Implements clean, reusable modular architectures utilizing professional ${repo.language || 'Javascript'} conventions.`,
      'Configures optimized builds systems and modern assets bundles pathways for swift distributions.',
      'Maintains complete codebase coverage, structured documentations, and version control integrity.'
    ];
  }
  
  return highlights;
}
