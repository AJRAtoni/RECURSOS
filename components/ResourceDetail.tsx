import React, { useEffect, useMemo, useState } from 'react';
import { Resource } from '../types';
import { ResourceCard } from './ResourceCard';

interface ResourceDetailProps {
  resource: Resource;
  allResources: Resource[];
  onBack: () => void;
  onResourceClick: (resource: Resource) => void;
}

const PLACEHOLDER_BG = '/images/recurso.webp';
export const ResourceDetail: React.FC<ResourceDetailProps> = ({ resource, allResources, onBack, onResourceClick }) => {
  const [copied, setCopied] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number | null>(null);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageContainerRef.current) return;

    const updateHeight = () => {
      if (imageContainerRef.current) {
        setHeaderHeight(imageContainerRef.current.offsetHeight);
      }
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(imageContainerRef.current);

    // Ejecutar inicialmente
    updateHeight();

    return () => resizeObserver.disconnect();
  }, [resource]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resource]);

  const relatedResources = useMemo(() => {
    return allResources
      .filter(r => r.categoria === resource.categoria && r.id !== resource.id)
      .slice(0, 3);
  }, [resource, allResources]);

  const videoId = useMemo(() => {
    if (!resource.youtubeUrl) return null;
    const url = resource.youtubeUrl.trim();
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
  }, [resource.youtubeUrl]);

  const embedUrl = useMemo(() => {
    if (!videoId) return '';
    const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    return `https://www.youtube.com/embed/${videoId}?rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(window.location.href)}`;
  }, [videoId]);

  const shareUrl = window.location.href;
  const shareText = `Este recurso puede ahorrarte mucho tiempo: ${resource.nombre}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCustomLogo = resource.imagenUrl && resource.imagenUrl !== PLACEHOLDER_BG;

  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'facil':
      case 'fácil':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'medio':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'avanzado':
      case 'dificil':
      case 'difícil':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Componente interno para la Ficha
  const ResourceSheet = ({ isMobile = false, forceHeight = null }: { isMobile?: boolean, forceHeight?: number | null }) => (
    <div
      className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden ${!isMobile ? 'h-full' : 'h-auto mb-8'}`}
      style={(!isMobile && forceHeight) ? { height: `${forceHeight}px` } : {}}
    >
      <div className="relative z-10 flex flex-col h-full">
        <h4 className="text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center pt-2">Ficha del Recurso</h4>

        <div className="flex flex-col justify-center flex-grow space-y-6">
          <a
            href={resource.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-4 px-6 text-center text-white rounded-2xl font-bold shadow-lg shadow-violet-500/30 transition-all transform hover:-translate-y-1 hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6a11cb 0%, #8c1fd1 35%, #b027d6 75%, #e914fb 100%)',
            }}
          >
            <span className="text-base md:text-lg">Abrir {resource.nombre}</span>
            <i className="fas fa-external-link-alt ml-3 text-sm"></i>
          </a>

          <div className="space-y-6 pt-6 border-t border-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">Categoría</span>
              <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[0.65rem] font-extrabold rounded-lg uppercase border border-slate-100/50">
                {resource.categoria}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em]">Dificultad</span>
              <span className={`px-3 py-1.5 text-[0.65rem] font-extrabold rounded-lg uppercase border ${getDifficultyColor(resource.dificultad)}`}>
                {resource.dificultad || 'Facil'}
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.15em] block">Compartir</span>
              <div className="flex items-center justify-start gap-3">
                {[
                  { icon: 'fa-x-twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
                  { icon: 'fa-linkedin-in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
                  { icon: 'fa-threads', href: `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + ' ' + shareUrl)}` }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-violet-600 transition-all shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <i className={`fab ${social.icon} text-base`}></i>
                  </a>
                ))}
                <button
                  onClick={handleCopyLink}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border ${copied ? 'bg-green-50 text-green-600 border-green-100' : 'bg-white text-slate-600 hover:text-violet-600 border-slate-100 hover:shadow-md'}`}
                >
                  <i className={`fas ${copied ? 'fa-check' : 'fa-link'} text-base`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4">
      <button
        onClick={onBack}
        className="mb-8 flex items-center text-slate-400 hover:text-violet-600 transition-colors font-semibold text-sm uppercase tracking-wider"
      >
        <i className="fas fa-arrow-left mr-2"></i> Explorar recursos
      </button>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

        {/* COLUMNA IZQUIERDA (Imagen + Contenido) */}
        <div className="lg:col-span-8 space-y-10 md:space-y-12">

          {/* Imagen de Cabecera */}
          <div
            ref={imageContainerRef}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 bg-white aspect-video"
          >
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #8c1fd1 35%, #b027d6 75%, #e914fb 100%)',
              }}
            />
            {hasCustomLogo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[50%] h-[50%] flex items-center justify-center">
                  <img
                    src={resource.imagenUrl}
                    alt={resource.nombre}
                    className="max-w-full max-h-full object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Textos Principales */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-violet-100">
                {resource.categoria}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
              {resource.nombre}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-violet-500 pl-4">
              {resource.descripcionCorta}
            </p>
          </div>

          {/* Bloque Descripción */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-violet-500/20">
                <i className="fas fa-align-left text-sm"></i>
              </div>
              <h3 className="font-bold text-xl uppercase tracking-widest">¿Qué es {resource.nombre}?</h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-base md:text-lg leading-relaxed whitespace-pre-line opacity-90">
                {resource.descripcion}
              </p>
            </div>
          </div>



          {/* Bloques de Casos de Uso y No usara */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Casos de Uso */}
            {resource.casosUso && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-check-circle text-sm"></i>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 uppercase tracking-widest">Ideal para...</h3>
                </div>
                <ul className="space-y-4 flex-grow">
                  {resource.casosUso.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i} className="flex items-start text-slate-600 text-sm md:text-base leading-relaxed">
                      <i className="fas fa-check text-green-500 mt-1.5 mr-3 text-[10px] flex-shrink-0"></i>
                      <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No lo uses si... */}
            {resource.noUsar && (
              <div className="bg-red-50/30 rounded-[2.5rem] p-8 shadow-xl border border-red-100/50 flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-times-circle text-sm"></i>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 uppercase tracking-widest">No lo uses si...</h3>
                </div>
                <ul className="space-y-4 flex-grow">
                  {resource.noUsar.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i} className="flex items-start text-slate-600 text-sm md:text-base leading-relaxed">
                      <i className="fas fa-exclamation-triangle text-red-400 mt-1.5 mr-3 text-[10px] flex-shrink-0"></i>
                      <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Caso Real AJRA */}
          {resource.caso && (
            <div
              className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-violet-500/20 text-white"
              style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #8c1fd1 35%, #b027d6 75%, #e914fb 100%)',
              }}
            >
              <div className="relative z-10 flex items-center mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-black/10">
                  <i className="fas fa-briefcase text-violet-600 text-sm"></i>
                </div>
                <h3 className="font-bold text-xl text-white uppercase tracking-widest">Caso Real</h3>
              </div>
              <div className="relative z-10 prose prose-invert max-w-none">
                <p className="text-violet-50 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium">
                  {resource.caso}
                </p>
              </div>
            </div>
          )}

          {/* Bloque EL VEREDICTO DE AJRA */}
          {resource.veredicto && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 shadow-lg shadow-slate-200">
                  <img src="https://ajra.es/images/AJRA.webp" alt="AJRA Avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 uppercase tracking-widest">En Palabras de AJRA</h3>
              </div>
              <div className="prose max-w-none">
                <p className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line">
                  {resource.veredicto}
                </p>
              </div>
            </div>
          )}

          {/* Video Análisis */}
          {videoId && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-red-500/20">
                  <i className="fab fa-youtube text-white text-sm"></i>
                </div>
                <h3 className="font-bold text-xl text-slate-900 uppercase tracking-widest">Análisis en Video</h3>
              </div>

              <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-inner bg-black">
                <iframe
                  src={embedUrl}
                  title={`Video sobre ${resource.nombre}`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* FICHA MÓVIL (Solo visible en LG-) */}
          <div className="lg:hidden block pt-4">
            <ResourceSheet isMobile />
          </div>
        </div>

        {/* COLUMNA DERECHA (Sidebar Sticky) */}
        <div className="lg:col-span-4 h-full">
          <div className="lg:sticky lg:top-8 space-y-6">

            {/* Ficha de Escritorio Sticky */}
            <div className="hidden lg:block">
              <ResourceSheet forceHeight={headerHeight} />
            </div>

            {/* Verificación */}
            <div className="bg-violet-50/40 p-6 rounded-[2rem] border border-violet-100/50 text-center">
              <p className="text-[11px] text-violet-900/70 leading-relaxed font-semibold italic">
                "Herramienta verificada por AJRA para garantizar la máxima calidad y utilidad."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recursos Similares */}
      {relatedResources.length > 0 && (
        <div className="mt-20 md:mt-32 pt-12 border-t border-slate-200/60">
          <h3 className="text-xl font-black text-slate-900 mb-10 tracking-tight uppercase border-b-2 border-violet-600 inline-block pb-1">
            Recursos Similares
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {relatedResources.map(related => (
              <ResourceCard
                key={related.id}
                resource={related}
                onClick={onResourceClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
