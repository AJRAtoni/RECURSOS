import React from 'react';
import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
  onClick: (resource: Resource) => void;
}

const PLACEHOLDER_BG = 'https://raw.githubusercontent.com/AJRAtoni/RECURSOS/64c1208596f96ea6df1f2ea23ae52f2dc9490852/img/recurso.webp';

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  // Verificamos si la imagen es distinta al placeholder predeterminado (es decir, si hay un logo real)
  const hasCustomLogo = resource.imagenUrl && resource.imagenUrl !== PLACEHOLDER_BG;

  return (
    <div 
      onClick={() => onClick(resource)}
      className="group bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {/* Capa 1: Fondo con degradado (Placeholder siempre visible) */}
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(135deg, #6a11cb 0%, #8c1fd1 35%, #b027d6 65%, #ff00a8 100%)',
          }}
        />
        
        {/* Capa 2: Logo centrado con proporción fija (50% del contenedor) */}
        {hasCustomLogo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[50%] h-[50%] flex items-center justify-center">
              <img 
                src={resource.imagenUrl} 
                alt={resource.nombre}
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
              />
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col bg-white border-t border-gray-50">
        <h3 className="text-base font-extrabold text-gray-900 mb-3 uppercase tracking-wider">
          {resource.nombre}
        </h3>
        <p className="text-[13px] text-gray-600 leading-snug line-clamp-2">
          {resource.descripcionCorta}
        </p>
      </div>
    </div>
  );
};
