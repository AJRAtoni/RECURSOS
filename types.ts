export interface Resource {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  categoria: string;
  enlace: string;
  imagenUrl: string;
  fechaCreacion: string;
  youtubeUrl?: string;
  dificultad?: string;
  casosUso?: string;
  noUsar?: string;
  veredicto?: string;
}

export interface AirtableRecord {
  id: string;
  fields: {
    Nombre?: string;
    "Descripcion Larga"?: string;
    "Descripción Larga"?: string;
    Descripcion?: string;
    "Descripción"?: string;
    "Descripcion Corta"?: string;
    "Descripción Corta"?: string;
    Categoria?: string;
    "Categoría"?: string;
    Enlace?: string;
    Imagen?: Array<{ url: string }>;
    Created?: string;
    YOUTUBE?: string;
    Youtube?: string;
    YouTube?: string;
    Dificultad?: string;
    "Casos de uso"?: string;
    "No Usarla"?: string;
    AJRA?: string;
  };
}

export type ViewState = 'grid' | 'detail';