import React, { useState, useEffect, useMemo } from 'react';
import { Resource } from './types';
import { fetchResources } from './services/airtableService';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetail } from './components/ResourceDetail';

// --- CONFIGURACIÓN DE BRANDING ---
const BRAND_AJRA_URL = "/images/AJRA.webp";
const BRAND_RECURSOS_URL = "/images/RECURSOS-ICON.png";
const HERO_ICON_URL = "/images/RECURSOS-ICON.svg";

const AVATAR_URL = BRAND_AJRA_URL;

const App: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [view, setView] = useState<'grid' | 'detail'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODOS');



  // --- DINÁMICA DE METADATOS ---
  useEffect(() => {
    const defaultTitle = "RECURSOS by AJRA";
    const defaultDesc = "Directorio de recursos y herramientas para crear y hacer crecer tu negocio online sin código.";
    const defaultImage = BRAND_RECURSOS_URL;

    const title = selectedResource ? `${selectedResource.nombre} | RECURSOS by AJRA` : defaultTitle;
    const description = selectedResource ? selectedResource.descripcionCorta : defaultDesc;
    const image = selectedResource ? selectedResource.imagenUrl : defaultImage;

    document.title = title;

    const updateMeta = (name: string, property: string, content: string) => {
      let el = name ? document.querySelector(`meta[name="${name}"]`) : document.querySelector(`meta[property="${property}"]`);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    // Update Basic Meta
    updateMeta('description', '', description);

    // Update Open Graph
    updateMeta('', 'og:title', title);
    updateMeta('', 'og:description', description);
    updateMeta('', 'og:image', image);
    updateMeta('', 'og:url', window.location.href);

    // Update Twitter
    updateMeta('twitter:title', '', title);
    updateMeta('twitter:description', '', description);
    updateMeta('twitter:image', '', image);
    updateMeta('twitter:url', '', window.location.href);

    // Update Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.href);
    }
  }, [selectedResource, view]);

  // Función para obtener el recurso desde el hash
  const getResourceFromHash = (data: Resource[]) => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return null;

    // Primero intentamos buscar por slug amigable
    let res = data.find(r => r.slug === hash);

    // Si no lo encuentra, por compatibilidad con enlaces antiguos, buscamos por ID de Airtable
    if (!res && hash.startsWith('resource-')) {
      const id = hash.replace('resource-', '');
      res = data.find(r => r.id === id);
    }

    return res;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchResources();
        setResources(data);

        const res = getResourceFromHash(data);
        if (res) {
          setSelectedResource(res);
          setView('detail');
        }
        setLoading(false);
      } catch (error) {
        console.error("Error inicializando la app:", error);
        setLoading(false);
      }
    };
    loadData();

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#') {
        setView('grid');
        setSelectedResource(null);
      } else {
        setResources(prev => {
          const res = getResourceFromHash(prev);
          if (res) {
            setSelectedResource(res);
            setView('detail');
          }
          return prev;
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const categories = useMemo(() => {
    const rawCategories = resources.map(r => r.categoria.toUpperCase());
    return ['TODOS', ...new Set(rawCategories)];
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = res.nombre.toLowerCase().includes(searchLower) ||
        res.descripcion.toLowerCase().includes(searchLower) ||
        res.descripcionCorta.toLowerCase().includes(searchLower);
      const matchesCategory = activeCategory === 'TODOS' || res.categoria.toUpperCase() === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchTerm, activeCategory]);

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setView('detail');
    // Ahora usamos el slug en lugar del ID crudo
    window.location.hash = resource.slug;
  };

  const handleBack = () => {
    setView('grid');
    setSelectedResource(null);
    window.location.hash = '';
  };

  // Determinamos qué logo mostrar basándonos en la vista actual
  const currentTopLogo = view === 'detail' ? BRAND_RECURSOS_URL : BRAND_AJRA_URL;

  return (
    <div className="min-h-screen bg-[#F3F4F6] transition-colors duration-500">
      {/* Top Left Logo/Avatar - Cambia según la vista */}
      <div className="p-6">
        <img
          key={view}
          src={currentTopLogo}
          alt={view === 'detail' ? "Logo Recursos" : "Logo AJRA"}
          onClick={handleBack}
          className="w-12 h-12 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-sm border border-gray-100 bg-white object-cover"
        />
      </div>

      {view === 'grid' ? (
        <div className="animate-fadeIn">
          {/* Centered Hero Section */}
          <header className="max-w-6xl mx-auto px-4 text-center pt-2">
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl transition-all duration-700 ease-out transform hover:scale-[1.03] flex items-center justify-center">
                <div className="w-full h-full ajra-gradient flex items-center justify-center p-2">
                  <img
                    src={HERO_ICON_URL}
                    alt="RECURSOS"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              <b>Herramientas reales para negocios reales</b>.
              <br />
              Crea y haz crecer tu negocio online sin complicarte, sin código y sin perder tiempo.
            </p>

            {/* Category Pills */}
            <div className="max-w-[700px] mx-auto flex flex-wrap justify-center gap-2 mb-12">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeCategory === cat
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-violet-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-[700px] mx-auto">
              <div className="relative group">
                <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors"></i>
                <input
                  type="text"
                  placeholder="¿Qué herramienta necesitas hoy?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-none rounded-2xl px-14 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all text-gray-700 bg-white shadow-sm placeholder:text-gray-300"
                />
              </div>
            </div>
          </header>

          <main className="w-[92%] mx-auto py-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
                <div className="text-violet-600 font-black uppercase tracking-[0.3em] text-xs">Sincronizando con la nube...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={handleResourceClick}
                  />
                ))}
              </div>
            )}

            {!loading && filteredResources.length === 0 && (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                <i className="fas fa-search text-gray-200 text-5xl mb-4"></i>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No hay coincidencias para tu búsqueda</p>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {selectedResource && (
            <ResourceDetail
              resource={selectedResource}
              allResources={resources}
              onBack={handleBack}
              onResourceClick={handleResourceClick}
            />
          )}
        </div>
      )}

      <footer className="py-20 text-center">
        <div className="max-w-md mx-auto border-t border-gray-200 pt-8">
          <p className="text-[11px] text-gray-400 font-bold tracking-wider">
            {new Date().getFullYear()} © Desarrollado con 🧠 & 💛 por &lt;/AJRA&gt;
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
