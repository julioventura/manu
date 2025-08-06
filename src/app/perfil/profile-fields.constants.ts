import { Validators, ValidatorFn } from '@angular/forms';

export interface ProfileField {
  controlName: string;
  defaultValue: string;
  validators?: ValidatorFn[];
  label?: string;
  type?: string;
  placeholder?: string;
  group?: string;
}

export const PROFILE_FORM_FIELDS: ProfileField[] = [
  { 
    controlName: 'nome', 
    defaultValue: '', 
    validators: [Validators.required],
    label: 'Nome Completo',
    type: 'text',
    placeholder: 'Seu nome completo',
    group: '01. Dados Pessoais'
  },
  { 
    controlName: 'username', 
    defaultValue: '',
    label: 'Nome de Usuário',
    type: 'text',
    validators: [Validators.required],
    placeholder: 'Seu nome (apelido) de usuário',
    group: '01. Dados Pessoais'
  },
  { 
    controlName: 'nascimento', 
    defaultValue: '',
    label: 'Nascimento',
    type: 'date',
    group: '01. Dados Pessoais'
  },

  // Capa da homepage e cartão de visitas digital
  {
    controlName: 'nome_capa',
    defaultValue: '',
    label: 'Nome profissional',
    type: 'text',
    placeholder: 'Como deve ser chamado(a). Inclua Dr(a) se desejar',
    group: '02. Capa da Homepage e Cartão de Visitas Digital'
  },
  {
    controlName: 'titulo_profissional',
    defaultValue: '',
    label: 'Titulo Profissional Simplificado',
    type: 'text',
    placeholder: 'Titulo profissional para a homepage e cartão',
    group: '02. Capa da Homepage e Cartão de Visitas Digital'
  },
  {
    controlName: 'especialidade_principal',
    defaultValue: '',
    label: 'Especialidade principal',
    type: 'text',
    placeholder: 'Em uma linha, para a homepage e cartão',
    group: '02. Capa da Homepage e Cartão de Visitas Digital'
  },
  {
    controlName: 'foto',
    defaultValue: '',
    label: 'Foto pessoal',
    type: 'url',
    placeholder: 'URL da sua foto',
    group: '02. Capa da Homepage e Cartão de Visitas Digital'
  },
  {
    controlName: 'fotoCapa',
    defaultValue: '',
    label: 'Imagem de capa',
    type: 'url',
    placeholder: 'Pode ser a sua foto ou outra imagem',
    group: '02. Capa da Homepage e Cartão de Visitas Digital'
  },

  // Cartão de visitas digital
  { 
    controlName: 'whatsapp', 
    defaultValue: '',
    label: 'WhatsApp',
    type: 'tel',
    placeholder: '(99) 99999-9999',
    group: '03. Cartão de visitas digital'
  },
  { 
    controlName: 'telefone', 
    defaultValue: '',
    label: 'Telefone(s)',
    type: 'tel',
    placeholder: '(99) 9999-9999',
    group: '03. Cartão de visitas digital'
  },
  {
    controlName: 'email',
    defaultValue: '',
    validators: [Validators.email, Validators.required],
    label: 'Email',
    type: 'email',
    placeholder: 'Seu email',
    group: '03. Cartão de visitas digital'
  },
  {
    controlName: 'site',
    defaultValue: '',
    label: 'Site',
    type: 'url',
    placeholder: '',
    group: '03. Cartão de visitas digital'
  },
  
  // Informações Profissionais
  {
    controlName: 'cro',
    defaultValue: '',
    label: 'CRO',
    type: 'text',
    group: '03. Informações Profissionais'
  },
  {
    controlName: 'especialidades',
    defaultValue: '',
    label: 'Especialidades',
    type: 'textarea',
    placeholder: 'Suas especialidades',
    group: '03. Informações Profissionais'
  },
  {
    controlName: 'bio',
    defaultValue: '',
    label: 'Biografia',
    type: 'textarea',
    placeholder: 'Bio',
    group: '03. Informações Profissionais'
  },
  { 
    controlName: 'formacao', 
    defaultValue: '',
    label: 'Formação Profissional',
    type: 'textarea',
    group: '03. Informações Profissionais'
  },


  // Redes Sociais
  { 
    controlName: 'instagram', 
    defaultValue: '',
    label: 'Instagram',
    type: 'text',
    placeholder: '@usuario',
    group: '04. Redes Sociais'
  },
  { 
    controlName: 'facebook', 
    defaultValue: '',
    label: 'Facebook',
    type: 'text',
    group: '04. Redes Sociais'
  },
  { 
    controlName: 'linkedin', 
    defaultValue: '',
    label: 'LinkedIn',
    type: 'text',
    group: '04. Redes Sociais'
  },
  { 
    controlName: 'twitter', 
    defaultValue: '',
    label: 'Twitter',
    type: 'text',
    group: '04. Redes Sociais'
  },
  { 
    controlName: 'youtube', 
    defaultValue: '',
    label: 'YouTube',
    type: 'text',
    group: '04. Redes Sociais'
  },
  { 
    controlName: 'pinterest', 
    defaultValue: '',
    label: 'Pinterest',
    type: 'text',
    group: '04. Redes Sociais'
  },
  { 
    controlName: 'tiktok', 
    defaultValue: '',
    label: 'TikTok',
    type: 'text',
    group: '04. Redes Sociais'
  },

];

/**
 * Creates a configuration object for a reactive form group from the profile fields
 * @returns Object with control names as keys and [defaultValue, validators] arrays as values
 */
export function getProfileFormConfig(): { [key: string]: [string, ValidatorFn[]] } {
  const formConfig: { [key: string]: [string, ValidatorFn[]] } = {};
  
  PROFILE_FORM_FIELDS.forEach(field => {
    formConfig[field.controlName] = [
      field.defaultValue, 
      field.validators || []
    ];
  });
  
  return formConfig;
}

/**
 * Groups profile fields by their group property
 * @returns Object with group names as keys and arrays of fields as values
 */
export function getGroupedProfileFields(): { [key: string]: ProfileField[] } {
  return PROFILE_FORM_FIELDS.reduce((groups: { [key: string]: ProfileField[] }, field) => {
    const group = field.group || 'Outros';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(field);
    return groups;
  }, {});
}
