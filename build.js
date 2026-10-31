const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const PROJECTS_JSON_PATH = path.join(ROOT_DIR, 'projects.json');
const VERCEL_JSON_PATH = path.join(ROOT_DIR, 'vercel.json');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');

// 1. Load existing projects.json if present
let definedProjects = [];
if (fs.existsSync(PROJECTS_JSON_PATH)) {
  try {
    definedProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON_PATH, 'utf8'));
  } catch (err) {
    console.warn('Warning: Could not parse projects.json, continuing with auto-detection.', err);
  }
}

// 2. Discover all .html files in current directory
const allFiles = fs.readdirSync(ROOT_DIR);
const htmlFiles = allFiles.filter(file => file.endsWith('.html') && file !== 'index.html');

const colorPalette = [
  '#38bdf8', // Cyan
  '#a855f7', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e'  // Rose
];

// Helper to strip HTML tags
function stripHtml(str) {
  return str ? str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

// 3. Merge defined projects with newly discovered files
const projectsMap = new Map();
for (const p of definedProjects) {
  projectsMap.set(p.file, p);
}

const finalProjects = [];

for (let i = 0; i < htmlFiles.length; i++) {
  const file = htmlFiles[i];
  if (projectsMap.has(file)) {
    finalProjects.push(projectsMap.get(file));
  } else {
    // Auto-detect metadata for new files
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

    const rawTitle = titleMatch ? titleMatch[1].trim() : file.replace(/\.html$/, '');
    // Clean up title if it has &amp; etc.
    const title = rawTitle.replace(/&amp;/g, '&');
    
    let slug = file.replace(/\.html$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (slug.length > 25) {
      // Keep slug concise if filename is very long
      const parts = slug.split('-');
      slug = parts.slice(0, 3).join('-');
    }

    const tagline = h1Match ? stripHtml(h1Match[1]).slice(0, 90) : 'Interactive Prototype & Showcase';
    const description = descMatch
      ? descMatch[1].trim()
      : (pMatch ? stripHtml(pMatch[1]).slice(0, 140) + '...' : 'Interactive client-side web application.');

    const newProject = {
      file,
      slug,
      title,
      tagline,
      description,
      category: 'Prototype',
      tags: ['Interactive', 'Showcase'],
      accentColor: colorPalette[i % colorPalette.length],
      featured: false
    };

    console.log(`Auto-discovered new project: "${title}" -> /${slug}`);
    finalProjects.push(newProject);
  }
}

// 4. Generate vercel.json with clean rewrites
const rewrites = [
  ...finalProjects.map(p => ({
    source: `/${p.slug}`,
    destination: `/${p.file}`
  })),
  // Also support calling filename without .html
  ...finalProjects
    .filter(p => p.slug !== p.file.replace(/\.html$/, ''))
    .map(p => ({
      source: `/${p.file.replace(/\.html$/, '')}`,
      destination: `/${p.file}`
    }))
];

const vercelConfig = {
  outputDirectory: '.',
  cleanUrls: false,
  trailingSlash: false,
  rewrites
};

fs.writeFileSync(VERCEL_JSON_PATH, JSON.stringify(vercelConfig, null, 2) + '\n');
console.log(`Generated vercel.json with ${rewrites.length} route rewrites.`);

// 5. Generate index.html (Showcase Hub)
const categories = ['All', ...new Set(finalProjects.map(p => p.category || 'Experiments'))];

const indexHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio &amp; Interactive Experiments Showcase</title>
  <meta name="description" content="A curated collection of real-time interactive 3D WebGL experiences, generative AI interfaces, and frontend prototypes." />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              dark: '#08090d',
              surface: '#0f111a',
              card: '#141724',
              border: '#1f2438',
              muted: '#717892'
            }
          }
        }
      }
    };
  </script>
  <style>
    body {
      background-color: #06070b;
      color: #f1f5f9;
      background-image: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
        radial-gradient(ellipse 60% 40% at 90% 10%, rgba(56, 189, 248, 0.1), transparent),
        radial-gradient(circle at 10% 90%, rgba(168, 85, 247, 0.08), transparent);
      background-attachment: fixed;
    }
    .glass-card {
      background: linear-gradient(135deg, rgba(20, 23, 36, 0.75) 0%, rgba(15, 17, 26, 0.85) 100%);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card:hover {
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
    }
    .grid-bg {
      background-size: 32px 32px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    }
  </style>
</head>
<body class="min-h-screen grid-bg font-sans antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Header Section -->
  <header class="border-b border-brand-border/60 bg-brand-dark/80 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
          <div class="w-full h-full bg-brand-dark rounded-[10px] flex items-center justify-center">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-bold text-lg font-mono">⚡</span>
          </div>
        </div>
        <div>
          <h1 class="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
            Portfolio Projects
            <span class="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Live Showcase</span>
          </h1>
          <p class="text-xs text-brand-muted hidden sm:block">Real-time WebGL, Spatial Simulations &amp; Design Experiments</p>
        </div>
      </div>

      <!-- Quick Stats & Actions -->
      <div class="flex items-center gap-3 sm:gap-4">
        <span class="text-xs font-mono text-zinc-400 px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border">
          <span class="text-emerald-400 font-semibold" id="projectCount">${finalProjects.length}</span> Projects Live
        </span>
      </div>
    </div>
  </header>

  <!-- Hero & Controls -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    <div class="max-w-3xl mb-10">
      <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
        Interactive Experiences &amp; <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400">
          Frontend Experiments
        </span>
      </h2>
      <p class="text-base sm:text-lg text-zinc-400 leading-relaxed">
        Explore interactive prototypes, spatial simulations, and bespoke web interfaces. Launch any project directly in full-screen or preview inline.
      </p>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col md:flex-row gap-4 mb-8 justify-between items-stretch md:items-center">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Search by name, tag, or technology..." 
          class="w-full px-4 py-2.5 pl-10 rounded-xl bg-brand-surface/90 border border-brand-border text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <svg class="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none" id="categoryFilters">
        ${categories.map((cat, idx) => `
          <button 
            data-category="${cat}" 
            class="filter-pill px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${idx === 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-brand-surface text-zinc-400 hover:text-white border border-brand-border'}"
          >
            ${cat}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Project Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="projectsGrid">
      ${finalProjects.map(p => `
        <article 
          class="project-card glass-card rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden"
          data-category="${p.category || 'Experiments'}"
          data-title="${p.title.toLowerCase()}"
          data-tags="${(p.tags || []).join(' ').toLowerCase()}"
          data-desc="${p.description.toLowerCase()}"
        >
          <!-- Accent glow line on top -->
          <div class="absolute top-0 left-0 right-0 h-[2px] transition-all opacity-40 group-hover:opacity-100" style="background: ${p.accentColor || '#6366f1'};"></div>

          <div>
            <!-- Top badge & category -->
            <div class="flex items-center justify-between gap-2 mb-4">
              <span class="px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase font-mono border" style="color: ${p.accentColor || '#38bdf8'}; border-color: ${p.accentColor || '#38bdf8'}33; background: ${p.accentColor || '#38bdf8'}11;">
                ${p.category || 'Prototype'}
              </span>
              <span class="text-xs font-mono text-zinc-500">/${p.slug}</span>
            </div>

            <!-- Title & Tagline -->
            <h3 class="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors mb-1">
              ${p.title}
            </h3>
            <p class="text-xs font-medium text-zinc-400 mb-3">${p.tagline}</p>
            <p class="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-5">
              ${p.description}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-6">
              ${(p.tags || []).map(t => `
                <span class="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 font-mono">
                  #${t}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="pt-4 border-t border-brand-border/80 flex items-center justify-between gap-3">
            <button 
              onclick="openPreview('${p.slug}', '${p.file}', '${p.title.replace(/'/g, "\\'")}')" 
              class="px-3 py-2 text-xs font-semibold rounded-lg text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Quick Preview
            </button>
            <a 
              href="/${p.slug}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              Launch Live
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </article>
      `).join('')}
    </div>

    <!-- Empty State -->
    <div id="noResults" class="hidden py-16 text-center">
      <div class="inline-flex p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-3">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-zinc-400 font-medium">No projects found matching your search</p>
      <p class="text-zinc-600 text-xs mt-1">Try clearing filters or search terms</p>
    </div>
  </main>

  <!-- Quick Preview Modal -->
  <div id="previewModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 flex items-center justify-center">
    <div class="w-full max-w-6xl h-[90vh] bg-brand-surface rounded-2xl border border-brand-border shadow-2xl flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="px-5 py-3.5 border-b border-brand-border bg-brand-dark flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span class="text-sm font-semibold text-white ml-2" id="modalTitle">Project Preview</span>
          <span class="text-xs font-mono text-zinc-500" id="modalUrl"></span>
        </div>
        <div class="flex items-center gap-2">
          <a id="modalExternalLink" href="#" target="_blank" class="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 flex items-center gap-1">
            Open Full Window
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
          <button onclick="closePreview()" class="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
      <!-- Modal Iframe -->
      <div class="flex-1 bg-black relative">
        <iframe id="previewIframe" src="" class="w-full h-full border-0"></iframe>
      </div>
    </div>
  </div>

  <!-- Client-side Interactive Filter & Search -->
  <script>
    let activeCategory = 'All';
    const searchInput = document.getElementById('searchInput');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const pills = Array.from(document.querySelectorAll('.filter-pill'));
    const noResults = document.getElementById('noResults');

    function filterProjects() {
      const query = searchInput.value.toLowerCase().trim();
      let visibleCount = 0;

      cards.forEach(card => {
        const cat = card.dataset.category;
        const title = card.dataset.title;
        const tags = card.dataset.tags;
        const desc = card.dataset.desc;

        const matchesCat = (activeCategory === 'All' || cat === activeCategory);
        const matchesQuery = !query || title.includes(query) || tags.includes(query) || desc.includes(query);

        if (matchesCat && matchesQuery) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      noResults.classList.toggle('hidden', visibleCount > 0);
    }

    searchInput.addEventListener('input', filterProjects);

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/30');
          p.classList.add('bg-brand-surface', 'text-zinc-400', 'border', 'border-brand-border');
        });
        pill.classList.remove('bg-brand-surface', 'text-zinc-400', 'border', 'border-brand-border');
        pill.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/30');
        activeCategory = pill.dataset.category;
        filterProjects();
      });
    });

    // Preview Modal Logic
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewIframe');
    const modalTitle = document.getElementById('modalTitle');
    const modalUrl = document.getElementById('modalUrl');
    const modalExternalLink = document.getElementById('modalExternalLink');

    function openPreview(slug, file, title) {
      modalTitle.textContent = title;
      modalUrl.textContent = '/' + slug;
      modalExternalLink.href = '/' + slug;
      // Use direct file locally or /slug on live
      iframe.src = file;
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closePreview() {
      modal.classList.add('hidden');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePreview();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closePreview();
      }
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(INDEX_HTML_PATH, indexHtml);
console.log(`Successfully generated index.html showcasing ${finalProjects.length} projects.`);

