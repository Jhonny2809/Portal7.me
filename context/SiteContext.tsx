
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { SiteConfig, SiteSection } from '../types';

interface SiteContextType {
  config: SiteConfig | null;
  sections: SiteSection[];
  refreshConfig: () => Promise<void>;
  loading: boolean;
}

const SiteContext = createContext<SiteContextType>({ config: null, sections: [], refreshConfig: async () => {}, loading: true });

export const useSite = () => useContext(SiteContext);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Inicia o loading apenas na primeira carga ou se explicitamente chamado
    try {
      // 1. Tenta carregar Configurações
      const { data: configData, error: configError } = await supabase
        .from('site_config')
        .select('*')
        .limit(1);
      
      if (!configError && configData && configData.length > 0) {
        setConfig(configData[0]);
      } else if (configError) {
        console.warn("Aviso: Tabela 'site_config' pode estar vazia ou inacessível.", configError.message);
      }

      // 2. Tenta carregar Seções
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('display_order');
      
      if (!sectionsError && sectionsData) {
        setSections(sectionsData);
      } else if (sectionsError) {
        console.warn("Aviso: Tabela 'sections' pode estar vazia ou inacessível.", sectionsError.message);
      }
      
    } catch (error) {
      console.error("Erro crítico ao carregar dados do Supabase:", error);
    } finally {
      // Garante que o loading termine em no máximo 5 segundos para não travar a tela
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (config?.facebook_pixel_id) {
      import('react-facebook-pixel')
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init(config.facebook_pixel_id!);
          ReactPixel.pageView();
        })
        .catch(() => console.log("Facebook Pixel não pôde ser carregado."));
    }
  }, [config?.facebook_pixel_id]);

  return (
    <SiteContext.Provider value={{ config, sections, refreshConfig: fetchData, loading }}>
      {children}
    </SiteContext.Provider>
  );
};
