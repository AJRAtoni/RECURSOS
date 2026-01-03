import { Resource, AirtableRecord } from '../types';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Recursos';

const DEFAULT_RESOURCE_IMAGE = 'https://raw.githubusercontent.com/AJRAtoni/RECURSOS/64c1208596f96ea6df1f2ea23ae52f2dc9490852/img/recurso.webp';

const createSlug = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Reemplazar espacios por -
    .replace(/[^\w-]+/g, '')        // Eliminar caracteres especiales
    .replace(/--+/g, '-');          // Evitar múltiples guiones
};

export const fetchResources = async (): Promise<Resource[]> => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?sort%5B0%5D%5Bfield%5D=Nombre&sort%5B0%5D%5Bdirection%5D=asc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records.map((record: AirtableRecord) => {
      const nombre = record.fields.Nombre || 'Sin nombre';
      const slug = createSlug(nombre);

      const descripcion = record.fields['Descripcion Larga'] ||
        record.fields['Descripción Larga'] ||
        record.fields['Descripción'] ||
        record.fields.Descripcion || '';

      const descripcionCorta = record.fields['Descripcion Corta'] ||
        record.fields['Descripción Corta'] ||
        descripcion.substring(0, 80) || '';

      const categoria = record.fields['Categoría'] || record.fields.Categoria || 'General';

      return {
        id: record.id,
        slug: slug,
        nombre: nombre,
        descripcion: descripcion,
        descripcionCorta: descripcionCorta,
        categoria: categoria,
        enlace: record.fields.Enlace || '#',
        imagenUrl: record.fields.Imagen?.[0]?.url || DEFAULT_RESOURCE_IMAGE,
        fechaCreacion: record.fields.Created || new Date().toISOString(),
        youtubeUrl: record.fields.YOUTUBE || record.fields.Youtube || record.fields.YouTube || '',
        dificultad: record.fields.Dificultad || 'Facil',
        casosUso: record.fields['Casos de uso'] || '',
        noUsar: record.fields['No Usarla'] || '',
        veredicto: record.fields.AJRA || '',
      };
    });
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    return [];
  }
};