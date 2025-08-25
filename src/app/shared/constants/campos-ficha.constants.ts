import { Campo } from '../models/campo.model';

export const DEFAULT_CAMPOS_PADRAO: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Nome' },
  { grupo: ' Principal', subgrupo: '', nome: 'codigo', tipo: 'text', label: 'Código' },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'text', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'valor', tipo: 'number', label: 'Valor' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos' },
];

export const DEFAULT_CAMPOS_PADRAO_FICHAS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo' },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'valor', tipo: 'number', label: 'Valor' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];

export const CAMPOS_FICHAS_EXAMES: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
  
  { grupo: 'Exames', subgrupo: 'Anamnese', nome: 'queixaPrincipal', tipo: 'text', label: 'Queixa Principal', expandido: true },
  { grupo: 'Exames', subgrupo: 'Anamnese', nome: 'emTratamentoMedico', tipo: 'boolean', label: 'Está em tratamento médico?' },
  { grupo: 'Exames', subgrupo: 'Anamnese', nome: 'motivoTratamentoMedico', tipo: 'text', label: 'Motivo do tratamento médico' },
  { grupo: 'Exames', subgrupo: 'Anamnese', nome: 'usaMedicamento', tipo: 'boolean', label: 'Toma medicamentos?' },
  { grupo: 'Exames', subgrupo: 'Anamnese', nome: 'quaisMedicamentos', tipo: 'text', label: 'Quais medicamentos?' },
  { grupo: 'Exames', subgrupo: 'Anamnese', nome: 'motivoMedicamentos', tipo: 'text', label: 'Motivo dos medicamentos' },

  { grupo: 'Exames', subgrupo: 'Histórico Familiar', nome: 'diabetes', tipo: 'text', label: 'Diabetes na família', expandido: true },
  { grupo: 'Exames', subgrupo: 'Histórico Familiar', nome: 'coracao', tipo: 'text', label: 'Doenças cardíacas' },


];

export const CAMPOS_FICHAS_DOCUMENTOS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];


export const CAMPOS_FICHAS_PLANOS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];

export const CAMPOS_FICHAS_PAGAMENTOS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'forma', tipo: 'text', label: 'Forma de Pagamento' },
  { grupo: ' Principal', subgrupo: '', nome: 'valor', tipo: 'number', label: 'Valor' },
];

export const CAMPOS_FICHAS_ATENDIMENTOS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
  // { grupo: ' Principal', subgrupo: '', nome: 'valor', tipo: 'number', label: 'Valor' },
];

export const CAMPOS_FICHAS_TRATAMENTOS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
  // { grupo: ' Principal', subgrupo: '', nome: 'valor', tipo: 'number', label: 'Valor' },
];

export const CAMPOS_FICHAS_DENTES: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Dente', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];


export const CAMPOS_FICHAS_DIAGNOSTICOS: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];

export const CAMPOS_FICHAS_RISCO: Campo[] = [
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'text', label: 'Dente', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];

export const CAMPOS_FICHAS_DENTES_ENDO: Campo[] = [
  // Dados principais 
  { grupo: ' Principal', subgrupo: '', nome: 'nome', tipo: 'number', label: 'Dente', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: '', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: '', nome: 'queixa', tipo: 'textarea', label: 'Queixa Principal' },
  { grupo: ' Principal', subgrupo: '', nome: 'obs', tipo: 'textarea', label: 'Evolução' },
  { grupo: ' Principal', subgrupo: '', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },

  // Aspectos Clínicos da Coroa - usando subgrupos
  { grupo: '01) Aspectos Clínicos', subgrupo: 'a) Integridade da Coroa', nome: 'higido', tipo: 'boolean', label: 'Hígida' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'a) Integridade da Coroa', nome: 'ausente', tipo: 'boolean', label: 'Ausente' },

  { grupo: '01) Aspectos Clínicos', subgrupo: 'b) Alterações da Coroa', nome: 'alteracaoCor', tipo: 'boolean', label: 'Alteração de cor' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'b) Alterações da Coroa', nome: 'carie', tipo: 'boolean', label: 'Cárie' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'b) Alterações da Coroa', nome: 'fratura', tipo: 'boolean', label: 'Fratura' },

  { grupo: '01) Aspectos Clínicos', subgrupo: 'c) Restaurações', nome: 'coroaPermanente', tipo: 'boolean', label: 'Coroa Permanente' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'c) Restaurações', nome: 'restaurado', tipo: 'boolean', label: 'Restaurada' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'c) Restaurações', nome: 'coroaProvisoria', tipo: 'boolean', label: 'Provisória' },

  { grupo: '01) Aspectos Clínicos', subgrupo: 'd) Alteração Pulpar', nome: 'exposicaoPulpar', tipo: 'boolean', label: 'Exposição pulpar' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'd) Alteração Pulpar', nome: 'selamentoProvisorio', tipo: 'boolean', label: 'Selamento provisório' },

  { grupo: '01) Aspectos Clínicos', subgrupo: 'e) Tecidos Moles', nome: 'edemaintraoral', tipo: 'boolean', label: 'Edema intra-oral' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'e) Tecidos Moles', nome: 'edemaextraoral', tipo: 'boolean', label: 'Edema extra-oral' },
  { grupo: '01) Aspectos Clínicos', subgrupo: 'e) Tecidos Moles', nome: 'fistula', tipo: 'boolean', label: 'Fístula' },

  // Avaliação da Dor
  { grupo: '02) Dor', subgrupo: 'a) Presença', nome: 'dorPresente', tipo: 'boolean', label: 'Dor: Presente?' },
  { grupo: '02) Dor', subgrupo: 'a) Presença', nome: 'nivelDor', tipo: 'number', label: 'Intensidade (1/leve - 10/severa)' },
  { grupo: '02) Dor', subgrupo: 'a) Presença', nome: 'localizacaoDorLocalizada', tipo: 'boolean', label: 'Dor Localizada' },
  { grupo: '02) Dor', subgrupo: 'a) Presença', nome: 'localizacaoDorDifusa', tipo: 'boolean', label: 'Dor Difusa' },
  { grupo: '02) Dor', subgrupo: 'a) Presença', nome: 'denteLocalizado', tipo: 'text', label: 'Dente(s) com dor (se localizada)' },
  { grupo: '02) Dor', subgrupo: 'a) Presença', nome: 'regiaoDor', tipo: 'text', label: 'Região da dor (se difusa)' },

  // Frequência da Dor
  { grupo: '02) Dor', subgrupo: 'b) Frequência', nome: 'frequenciaConstante', tipo: 'boolean', label: 'Constante' },
  { grupo: '02) Dor', subgrupo: 'b) Frequência', nome: 'frequenciaIntermitente', tipo: 'boolean', label: 'Intermitente' },
  { grupo: '02) Dor', subgrupo: 'b) Frequência', nome: 'frequenciaOcasional', tipo: 'boolean', label: 'Ocasional' },

  // Gatilho da Dor
  { grupo: '02) Dor', subgrupo: 'c) Gatilho', nome: 'gatilhoDorFrio', tipo: 'boolean', label: 'Iniciada por frio' },
  { grupo: '02) Dor', subgrupo: 'c) Gatilho', nome: 'gatilhoDorCalor', tipo: 'boolean', label: 'Iniciada por calor' },
  { grupo: '02) Dor', subgrupo: 'c) Gatilho', nome: 'gatilhoDorMastigação', tipo: 'boolean', label: 'Iniciada por mastigação' },
  { grupo: '02) Dor', subgrupo: 'c) Gatilho', nome: 'gatilhoDorDoce', tipo: 'boolean', label: 'Iniciada por doce' },
  { grupo: '02) Dor', subgrupo: 'c) Gatilho', nome: 'gatilhoDorEspontanea', tipo: 'boolean', label: 'Iniciada espontaneamente' },

  // Alívio da Dor
  { grupo: '02) Dor', subgrupo: 'd) Alívio', nome: 'alivioDorFrio', tipo: 'boolean', label: 'Aliviada por frio' },
  { grupo: '02) Dor', subgrupo: 'd) Alívio', nome: 'alivioDorCalor', tipo: 'boolean', label: 'Aliviada por calor' },
  { grupo: '02) Dor', subgrupo: 'd) Alívio', nome: 'alivioDorAnalgesicos', tipo: 'boolean', label: 'Aliviada por analgesicos' },

  // Duração da Dor
  { grupo: '02) Dor', subgrupo: 'e) Duração', nome: 'duracaoSegundos', tipo: 'boolean', label: 'Duração de segundos' },
  { grupo: '02) Dor', subgrupo: 'e) Duração', nome: 'duracaoMinutos', tipo: 'boolean', label: 'Duração de minutos' },
  { grupo: '02) Dor', subgrupo: 'e) Duração', nome: 'duracaoHoras', tipo: 'boolean', label: 'Duração de horas' },


  // Exame Radiográfico Inicial – Câmara Pulpar
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioCarie', tipo: 'boolean', label: 'Cárie' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioRestauracao', tipo: 'boolean', label: 'Restauração' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioComunicacao', tipo: 'boolean', label: 'Comunicação com meio bucal' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioAcessadaProvisorio', tipo: 'boolean', label: 'Acessada com provisório' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioDensInDente', tipo: 'boolean', label: 'Dens in Dente' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioNoduloPulpar', tipo: 'boolean', label: 'Nódulo pulpar' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioAtresica', tipo: 'boolean', label: 'Atrésica' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'a) Câmara Pulpar', nome: 'radioAmpla', tipo: 'boolean', label: 'Ampla' },

  // Exame Radiográfico Inicial – Canais Radiculares
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'calcificado', tipo: 'boolean', label: 'Calcificação' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'curvaturaAcentuada', tipo: 'boolean', label: 'Curvatura acentuada' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'medicacaoIntracanal', tipo: 'boolean', label: 'Medicação intracanal' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'presencaMaterialObturador', tipo: 'boolean', label: 'Material obturador presente' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'linhaFraturaLocalizacao', tipo: 'text', label: 'Linha de fratura - Localização' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'limaFraturadaLocalizacao', tipo: 'text', label: 'Lima fraturada - Localização' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'perfuracaoLocalizacao', tipo: 'text', label: 'Perfuração - Localização' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'tipoRetentor1', tipo: 'boolean', label: 'Retentor intrarradicular Metálico' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'tipoRetentor2', tipo: 'boolean', label: 'Retentor intrarradicular de Fibra de vidro' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'reabsorcao1', tipo: 'boolean', label: 'Reabsorção Externa' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'reabsorcao2', tipo: 'boolean', label: 'Reabsorção Interna' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'reabsorcao3', tipo: 'boolean', label: 'Reabsorção Lateral' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'reabsorcao4', tipo: 'boolean', label: 'Reabsorção Apical' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'reabsorcao5', tipo: 'boolean', label: 'Reabsorção Anquilose' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'localizacaoReabsorcao', tipo: 'text', label: 'Localização da reabsorção' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'regiaoFurca1', tipo: 'boolean', label: 'Região de furca integra' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'b) Canais Radiculares', nome: 'regiaoFurca2', tipo: 'boolean', label: 'Região de furca alterada' },

  // Exame Radiográfico Inicial – Região Periapical
  { grupo: '03) Radiografia Inicial', subgrupo: 'c) Região Periapical', nome: 'PeriapicalSemAlteracao', tipo: 'boolean', label: 'Sem alteração' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'c) Região Periapical', nome: 'PeriapicalAumentoDeEspaco', tipo: 'boolean', label: 'Aumento de espaço do ligamento periodontal' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'c) Região Periapical', nome: 'PeriapicalRadiolucidezApical', tipo: 'boolean', label: 'Sem alteração' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'c) Região Periapical', nome: 'PeriapicalHipercementose', tipo: 'boolean', label: 'Hipercementose' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'c) Região Periapical', nome: 'PeriapicalOsteite', tipo: 'boolean', label: 'Osteíte condensante' },
  { grupo: '03) Radiografia Inicial', subgrupo: 'c) Região Periapical', nome: 'PeriapicalExtravasamento', tipo: 'boolean', label: 'Material obturador extravasado ' },

  // Teste de Sensibilidade
  { grupo: '04) Testes', subgrupo: 'a) Controle de Sensibilidade', nome: 'denteControle', tipo: 'text', label: 'Dente controle' },
  { grupo: '04) Testes', subgrupo: 'a) Controle de Sensibilidade', nome: 'denteSuspeito', tipo: 'text', label: 'Dente suspeito' },

  { grupo: '04) Testes', subgrupo: 'b) Sensibilidade à dor', nome: 'respostaTestePositiva', tipo: 'boolean', label: 'Resposta positiva' },
  { grupo: '04) Testes', subgrupo: 'b) Sensibilidade à dor', nome: 'respostaTesteNegativa', tipo: 'boolean', label: 'Resposta negativa' },

  { grupo: '04) Testes', subgrupo: 'c) Duração da dor', nome: 'duracaoIgualControle', tipo: 'boolean', label: 'Duração igual ao controle' },
  { grupo: '04) Testes', subgrupo: 'c) Duração da dor', nome: 'duracaoMaisLenta', tipo: 'boolean', label: 'Retorno mais lento que o controle' },

  { grupo: '04) Testes', subgrupo: 'd) Intensidade da dor', nome: 'intensidadeIgualControle', tipo: 'boolean', label: 'Intensidade igual ao controle' },
  { grupo: '04) Testes', subgrupo: 'd) Intensidade da dor', nome: 'intensidadeMaisAgudo', tipo: 'boolean', label: 'Intensidade mais aguda que o controle' },
  // Testes Clínicos
  { grupo: '04) Testes', subgrupo: 'e) Sondagem, mobilidade, palpação e percussão', nome: 'testeSondagem', tipo: 'boolean', label: 'Sondagem: Bolsa Periodontal' },
  { grupo: '04) Testes', subgrupo: 'e) Sondagem, mobilidade, palpação e percussão', nome: 'testeMobilidade', tipo: 'boolean', label: 'Mobilidade' },
  { grupo: '04) Testes', subgrupo: 'e) Sondagem, mobilidade, palpação e percussão', nome: 'testePalpacao', tipo: 'boolean', label: 'Palpação' },
  { grupo: '04) Testes', subgrupo: 'e) Sondagem, mobilidade, palpação e percussão', nome: 'testePercussaoHorizontal', tipo: 'boolean', label: 'Percussão horizontal' },

  // Diagnóstico Pulpar
  // AAE Consensus Conference Recommended Diagnostic Terminology. Journal of Endodontics. 2009;35:1634. 
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar1', tipo: 'boolean', label: 'Polpa Normal' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar2', tipo: 'boolean', label: 'Pulpite Reversível' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar3', tipo: 'boolean', label: 'Pulpite Irreversível Sintomática' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar4', tipo: 'boolean', label: 'Pulpite Irreversível Assintomática' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar5', tipo: 'boolean', label: 'Polpa Necrosada' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar6', tipo: 'boolean', label: 'Tratamento Endodôntico Prévio' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'a) Diagnóstico Pulpar', nome: 'diagnosticoPulpar7', tipo: 'boolean', label: 'Terapia Previamente Iniciada' },
  
  // Diagnóstico Perirradicular
  // AAE Consensus Conference Recommended Diagnostic Terminology. Journal of Endodontics. 2009;35:1634. 
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'b) Diagnóstico Perirradicular', nome: 'diagnosticoPerirradicular1', tipo: 'boolean', label: 'Tecidos apicais normais' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'b) Diagnóstico Perirradicular', nome: 'diagnosticoPerirradicular2', tipo: 'boolean', label: 'Periodontite Apical Sintomática' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'b) Diagnóstico Perirradicular', nome: 'diagnosticoPerirradicular3', tipo: 'boolean', label: 'Periodontite Apical Assintomática' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'b) Diagnóstico Perirradicular', nome: 'diagnosticoPerirradicular4', tipo: 'boolean', label: 'Abscesso Apical Agudo' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'b) Diagnóstico Perirradicular', nome: 'diagnosticoPerirradicular5', tipo: 'boolean', label: 'Abscesso Apical Crônico' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'b) Diagnóstico Perirradicular', nome: 'diagnosticoPerirradicular6', tipo: 'boolean', label: 'Osteíte Condensante' },

  // Plano de Tratamento
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento1', tipo: 'boolean', label: 'Tratamento conservador' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento2', tipo: 'boolean', label: ' Apenas proservação' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento3', tipo: 'boolean', label: 'Tratamento endodôntico ' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento4', tipo: 'boolean', label: 'Continuação de terapia previamente iniciada por outros' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento5', tipo: 'boolean', label: 'Retratamento endodôntico não cirúrgico' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento6', tipo: 'boolean', label: 'Revascularização pulpar' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento7', tipo: 'boolean', label: 'Apicificação' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento8', tipo: 'boolean', label: 'Cirurgia parendodôntica' },
  { grupo: '05) Diagnóstico e Plano de Tratamento', subgrupo: 'c) Plano de Tratamento', nome: 'planoTratamento9', tipo: 'text', label: 'Encaminhamento para avaliação de outra especialidade' },

  // Canais Radiculares
  // CAD – comprimento aparente do dente 
  // CRT – comprimento real de trabalho
  // CRI – comprimento real do instrumento 
  // IAF – Instrumento apical foraminal (Patência)
  // CPT – comprimento provisório de trabalho 
  // IAI - Instrumento inicial apical (Primeiro instrumento do preparo apical)
  // CRD – comprimento real do dente 
  // IM – Instrumento de memória (Último do preparo apical)
  
  // Canal 1
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1Nome', tipo: 'text', label: 'Nome/Sigla'},
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1Ref', tipo: 'text', label: 'Referência Coronária' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1CAD', tipo: 'number', label: 'CAD – comprimento aparente do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1CRI', tipo: 'number', label: 'CRI – comprimento real do instrumento (CAD-2)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1CPT', tipo: 'number', label: 'CPT – comprimento provisório de trabalho (CAD-4)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1CRD', tipo: 'number', label: 'CRD – comprimento real do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1CRT', tipo: 'number', label: 'CRT – comprimento real de trabalho' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1IAF', tipo: 'text', label: 'IAF – Instrumento apical foraminal (Patência)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1IAI', tipo: 'text', label: 'IAI - Instrumento inicial apical' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 1', nome: 'canal1IM', tipo: 'text', label: 'IM – Instrumento de memória (Último do preparo apical)' },
  // Canal 2
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2Nome', tipo: 'text', label: 'Nome/Sigla' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2Ref', tipo: 'text', label: 'Referência Coronária' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2CAD', tipo: 'number', label: 'CAD – comprimento aparente do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2CRI', tipo: 'number', label: 'CRI – comprimento real do instrumento (CAD-2)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2CPT', tipo: 'number', label: 'CPT – comprimento provisório de trabalho (CAD-4)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2CRD', tipo: 'number', label: 'CRD – comprimento real do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2CRT', tipo: 'number', label: 'CRT – comprimento real de trabalho' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2IAF', tipo: 'text', label: 'IAF – Instrumento apical foraminal (Patência)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2IAI', tipo: 'text', label: 'IAI - Instrumento inicial apical' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 2', nome: 'canal2IM', tipo: 'text', label: 'IM – Instrumento de memória (Último do preparo apical)' },
  // Canal 3
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3Nome', tipo: 'text', label: 'Nome/Sigla' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3Ref', tipo: 'text', label: 'Referência Coronária' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3CAD', tipo: 'number', label: 'CAD – comprimento aparente do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3CRI', tipo: 'number', label: 'CRI – comprimento real do instrumento (CAD-2)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3CPT', tipo: 'number', label: 'CPT – comprimento provisório de trabalho (CAD-4)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3CRD', tipo: 'number', label: 'CRD – comprimento real do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3CRT', tipo: 'number', label: 'CRT – comprimento real de trabalho' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3IAF', tipo: 'text', label: 'IAF – Instrumento apical foraminal (Patência)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3IAI', tipo: 'text', label: 'IAI - Instrumento inicial apical' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 3', nome: 'canal3IM', tipo: 'text', label: 'IM – Instrumento de memória (Último do preparo apical)' },
  // Canal 4
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4Nome', tipo: 'text', label: 'Nome/Sigla' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4Ref', tipo: 'text', label: 'Referência Coronária' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4CAD', tipo: 'number', label: 'CAD – comprimento aparente do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4CRI', tipo: 'number', label: 'CRI – comprimento real do instrumento (CAD-2)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4CPT', tipo: 'number', label: 'CPT – comprimento provisório de trabalho (CAD-4)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4CRD', tipo: 'number', label: 'CRD – comprimento real do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4CRT', tipo: 'number', label: 'CRT – comprimento real de trabalho' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4IAF', tipo: 'text', label: 'IAF – Instrumento apical foraminal (Patência)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4IAI', tipo: 'text', label: 'IAI - Instrumento inicial apical' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 4', nome: 'canal4IM', tipo: 'text', label: 'IM – Instrumento de memória (Último do preparo apical)' },
  // Canal 5
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5Nome', tipo: 'text', label: 'Nome/Sigla' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5Ref', tipo: 'text', label: 'Referência Coronária' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5CAD', tipo: 'number', label: 'CAD – comprimento aparente do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5CRI', tipo: 'number', label: 'CRI – comprimento real do instrumento (CAD-2)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5CPT', tipo: 'number', label: 'CPT – comprimento provisório de trabalho (CAD-4)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5CRD', tipo: 'number', label: 'CRD – comprimento real do dente' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5CRT', tipo: 'number', label: 'CRT – comprimento real de trabalho' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5IAF', tipo: 'text', label: 'IAF – Instrumento apical foraminal (Patência)' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5IAI', tipo: 'text', label: 'IAI - Instrumento inicial apical' },
  { grupo: '06) Canais Radiculares', subgrupo: 'Canal 5', nome: 'canal5IM', tipo: 'text', label: 'IM – Instrumento de memória (Último do preparo apical)' },


  // Medicação Intracanal Consulta 1
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 1', nome: 'medicacaoIntracanalConsulta1a', tipo: 'boolean', label: 'Hipoclorito de sódio' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 1', nome: 'medicacaoIntracanalConsulta1b', tipo: 'boolean', label: 'Clorexidina' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 1', nome: 'medicacaoIntracanalConsulta1c', tipo: 'boolean', label: 'Otosporin' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 1', nome: 'medicacaoIntracanalConsulta1d', tipo: 'boolean', label: 'Hidróxido de cálcio' },
  
  // Medicação Intracanal Consulta 2
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 2', nome: 'medicacaoIntracanalConsulta2a', tipo: 'boolean', label: 'Hipoclorito de sódio' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 2', nome: 'medicacaoIntracanalConsulta2b', tipo: 'boolean', label: 'Clorexidina' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 2', nome: 'medicacaoIntracanalConsulta2c', tipo: 'boolean', label: 'Otosporin' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 2', nome: 'medicacaoIntracanalConsulta2d', tipo: 'boolean', label: 'Hidróxido de cálcio' },
  
  // Medicação Intracanal Consulta 3
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 3', nome: 'medicacaoIntracanalConsulta3a', tipo: 'boolean', label: 'Hipoclorito de sódio' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 3', nome: 'medicacaoIntracanalConsulta3b', tipo: 'boolean', label: 'Clorexidina' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 3', nome: 'medicacaoIntracanalConsulta3c', tipo: 'boolean', label: 'Otosporin' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 3', nome: 'medicacaoIntracanalConsulta3d', tipo: 'boolean', label: 'Hidróxido de cálcio' },
  
  // Medicação Intracanal Consulta 4
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 4', nome: 'medicacaoIntracanalConsulta4a', tipo: 'boolean', label: 'Hipoclorito de sódio' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 4', nome: 'medicacaoIntracanalConsulta4b', tipo: 'boolean', label: 'Clorexidina' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 4', nome: 'medicacaoIntracanalConsulta4c', tipo: 'boolean', label: 'Otosporin' },
  { grupo: '07) Medicação Intracanal', subgrupo: 'Consulta 4', nome: 'medicacaoIntracanalConsulta4d', tipo: 'boolean', label: 'Hidróxido de cálcio' },
  
  // Grampo do Isolamento
  { grupo: '08) Técnica', subgrupo: 'a) Grampo do Isolamento', nome: 'grampoIsolamento', tipo: 'text', label: 'Grampo do Isolamento Absoluto' },
  // Preparo Químico-Mecânico: Técnica de Instrumentação
  { grupo: '08) Técnica', subgrupo: 'b) Técnica de Instrumentação', nome: 'tecnicaInstrumentacao1', tipo: 'boolean', label: 'Manual' },
  { grupo: '08) Técnica', subgrupo: 'b) Técnica de Instrumentação', nome: 'tecnicaInstrumentacao2', tipo: 'boolean', label: 'Rotação contínua - ROTATÓRIA' },
  { grupo: '08) Técnica', subgrupo: 'b) Técnica de Instrumentação', nome: 'tecnicaInstrumentacao3', tipo: 'boolean', label: 'Reciprocante' },
  { grupo: '08) Técnica', subgrupo: 'b) Técnica de Instrumentação', nome: 'tecnicaInstrumentacao4', tipo: 'boolean', label: 'OSCILATÓRIA' },
  { grupo: '08) Técnica', subgrupo: 'b) Técnica de Instrumentação', nome: 'tecnicaInstrumentacao5', tipo: 'boolean', label: 'Híbrida' },
  // Irrigação
  { grupo: '08) Técnica', subgrupo: 'c) Irrigação', nome: 'hipoclorito', tipo: 'text', label: 'Hipoclorito de sódio (%)' },
  { grupo: '08) Técnica', subgrupo: 'c) Irrigação', nome: 'clorexidinaLiquida', tipo: 'boolean', label: 'Clorexidina Líquida (2%)' },
  { grupo: '08) Técnica', subgrupo: 'c) Irrigação', nome: 'clorexidinaGel', tipo: 'boolean', label: 'Clorexidina Gel (2%)' },
  { grupo: '08) Técnica', subgrupo: 'c) Irrigação', nome: 'edta', tipo: 'boolean', label: 'EDTA a 17%' },
  { grupo: '08) Técnica', subgrupo: 'c) Irrigação', nome: 'ObsIrrigacao', tipo: 'text', label: 'Observaçao sobre a irrigação' },
  // Potencialização da substância química
  { grupo: '08) Técnica', subgrupo: 'd) Potencialização da substância química', nome: 'potencializacao', tipo: 'boolean', label: 'Potencialização da substância química?' },
  { grupo: '08) Técnica', subgrupo: 'd) Potencialização da substância química', nome: 'tecnicaPotencializacao', tipo: 'text', label: 'Técnica de potencialização' },
  // Técnica de Obturação
  { grupo: '08) Técnica', subgrupo: 'e) Técnica de Obturação', nome: 'tecnicaObturação1', tipo: 'boolean', label: 'Cone único' },
  { grupo: '08) Técnica', subgrupo: 'e) Técnica de Obturação', nome: 'tecnicaObturação2', tipo: 'boolean', label: 'Condensação lateral' },
  { grupo: '08) Técnica', subgrupo: 'e) Técnica de Obturação', nome: 'tecnicaObturação3', tipo: 'boolean', label: 'Termoplastificada' },
  { grupo: '08) Técnica', subgrupo: 'e) Técnica de Obturação', nome: 'tecnicaObturação4', tipo: 'boolean', label: 'Plug de MTA' },
  { grupo: '08) Técnica', subgrupo: 'e) Técnica de Obturação', nome: 'coneSelecionado', tipo: 'text', label: 'Cone selecionado' },
  { grupo: '08) Técnica', subgrupo: 'e) Técnica de Obturação', nome: 'cimentoObturador', tipo: 'text', label: 'Cimento obturador' },

  // Selamento Coronário Provisório Consulta 1
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 1', nome: 'selamentoCoronarProvisorioConsulta1a', tipo: 'boolean', label: 'Teflon' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 1', nome: 'selamentoCoronarProvisorioConsulta1b', tipo: 'boolean', label: 'Coltosol' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 1', nome: 'selamentoCoronarProvisorioConsulta1c', tipo: 'boolean', label: 'Resina composta' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 1', nome: 'selamentoCoronarProvisorioConsulta1d', tipo: 'boolean', label: 'Resina flow' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 1', nome: 'selamentoCoronarProvisorioConsulta1e', tipo: 'boolean', label: 'Ionômero de vidro' },

  // Selamento Coronário Provisório Consulta 2
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 2', nome: 'selamentoCoronarProvisorioConsulta2a', tipo: 'boolean', label: 'Teflon' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 2', nome: 'selamentoCoronarProvisorioConsulta2b', tipo: 'boolean', label: 'Coltosol' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 2', nome: 'selamentoCoronarProvisorioConsulta2c', tipo: 'boolean', label: 'Resina composta' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 2', nome: 'selamentoCoronarProvisorioConsulta2d', tipo: 'boolean', label: 'Resina flow' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 2', nome: 'selamentoCoronarProvisorioConsulta2e', tipo: 'boolean', label: 'Ionômero de vidro' },
  
  // Selamento Coronário Provisório Consulta 3
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 3', nome: 'selamentoCoronarProvisorioConsulta3a', tipo: 'boolean', label: 'Teflon' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 3', nome: 'selamentoCoronarProvisorioConsulta3b', tipo: 'boolean', label: 'Coltosol' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 3', nome: 'selamentoCoronarProvisorioConsulta3c', tipo: 'boolean', label: 'Resina composta' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 3', nome: 'selamentoCoronarProvisorioConsulta3d', tipo: 'boolean', label: 'Resina flow' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 3', nome: 'selamentoCoronarProvisorioConsulta3e', tipo: 'boolean', label: 'Ionômero de vidro' },

  // Selamento Coronário Provisório Consulta 4
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 4', nome: 'selamentoCoronarProvisorioConsulta4a', tipo: 'boolean', label: 'Teflon' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 4', nome: 'selamentoCoronarProvisorioConsulta4b', tipo: 'boolean', label: 'Coltosol' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 4', nome: 'selamentoCoronarProvisorioConsulta4c', tipo: 'boolean', label: 'Resina composta' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 4', nome: 'selamentoCoronarProvisorioConsulta4d', tipo: 'boolean', label: 'Resina flow' },
  { grupo: '09) Selamento Coronário Provisório', subgrupo: 'Consulta 4', nome: 'selamentoCoronarProvisorioConsulta4e', tipo: 'boolean', label: 'Ionômero de vidro' },

  // Extras
  { grupo: '10) Extras', subgrupo: '', nome: 'extras1', tipo: 'boolean', label: 'Remoção de retentor intracanal' },
  { grupo: '10) Extras', subgrupo: '', nome: 'extras2', tipo: 'boolean', label: 'Remoção de instrumento fraturado' },
  { grupo: '10) Extras', subgrupo: '', nome: 'extras3', tipo: 'boolean', label: 'Fechamento de perfuração' },
  { grupo: '10) Extras', subgrupo: '', nome: 'extras4', tipo: 'boolean', label: 'Calcificação' },

  // Tomografia Computadorizada
  { grupo: '11) Tomografia Computadorizada de Feixe Cônico', subgrupo: '', nome: 'tomografiaNecessaria', tipo: 'boolean', label: 'Necessária?' },
  { grupo: '11) Tomografia Computadorizada de Feixe Cônico', subgrupo: '', nome: 'tomografiaMotivo', tipo: 'text', label: 'Motivo' },
  { grupo: '11) Tomografia Computadorizada de Feixe Cônico', subgrupo: '', nome: 'tomografiaResultado', tipo: 'textarea', label: 'Resultado' },
];

export const CAMPOS_FICHAS_DENTES_PERIO: Campo[] = [
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'nome', tipo: 'text', label: 'Dente', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];

export const CAMPOS_FICHAS_ANAMNESE: Campo[] = [
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'nome', tipo: 'text', label: 'Titulo', obrigatorio: true, expandido: true },
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'data', tipo: 'date', label: 'Criado em' },
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'obs', tipo: 'textarea', label: 'Observações' },
  { grupo: ' Principal', subgrupo: 'subgrupo', nome: 'nuvem', tipo: 'url', label: 'Arquivos na nuvem' },
];
