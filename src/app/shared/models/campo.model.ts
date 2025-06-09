export interface Campo {
  nome: string;
  tipo: string;
  label: string;
  grupo?: string;
  subgrupo?: string; 
  expandido?: boolean;
  obrigatorio?: boolean;
  mascara?: string;
  options?: string[];
}
