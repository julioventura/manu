// Alteração: remoção de logs de depuração (console.log)
/*
  Métodos do arquivo UtilService:
  1. formata_email(email: string): string - Formata o email removendo espaços extras e convertendo para minúsculas.
  2. formata_cpf(cpf: string): string - Remove caracteres não numéricos e formata o CPF no padrão xxx.xxx.xxx-xx.
  3. pad(num: any, size: number): string - Preenche com zeros à esquerda o número para atingir o tamanho especificado.
  4. isNumeric(n: any): boolean - Verifica se o valor é numérico.
  5. clone(object: any): any - Realiza uma cópia profunda de um objeto.
  6. formata_valor(x: any, decimais?: number): string - Formata um valor numérico com separador de milhar e casas decimais.
  7. capitalizar(str: string): string - Converte a string para minúsculas e capitaliza a primeira letra de cada palavra, com exceções.
  8. isValidUrl(url: string): boolean - Verifica se a URL passada é válida.
  9. isImageUrl(url: string): boolean - Verifica se a URL corresponde a uma imagem (com base na extensão).
  10. titulo_ajuste_plural(titulo: string): string - Retorna o título no formato plural conforme regras definidas.
  11. titulo_ajuste_singular(titulo: string): string - Retorna o título no formato singular conforme regras definidas.
  12. calcularDigitoVerificador(codigo: string): number - Calcula o dígito verificador de um código.
  13. goHome(): void - Navega para a rota '/home'.
  14. go(route: string): void - Navega para a rota informada.
  15. go_url(url: string): void - Abre a URL em uma nova aba ou janela.
  16. voltar(): void - Retorna à rota anterior utilizando o NavegacaoService.
*/


import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavegacaoService } from '../services/navegacao.service';
import { AngularFireStorage } from '@angular/fire/compat/storage'; 
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

export class UtilService {
  snackBar = inject(MatSnackBar);

  constructor(
    private router: Router,
    private navegacaoService: NavegacaoService,
    private storage: AngularFireStorage
  ) { }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  // Regex para validação de email
  public EMAIL_REGEXP = /^[^@]+@([^@.]+\.)+[^@.]+$/;

  public ALFABETO: string = 'ABCDEFGHIJKLMNOPQRSTUVXYWZ';

  public milisegundos_de_um_dia = 86400000;
  public milisegundos_de_um_mes = 2592000000;

  public CADEADO_ABERTO = "/src/img/cadeado-aberto.png";
  public CADEADO_FECHADO = "/src/img/cadeado-fechado.png";

  public NOVO_CLIENTE = 'NOVO CLIENTE';
  public NOVO_ADVOGADO = 'NOVO ADVOGADO';
  public NOVA_MENSAGEM = 'NOVA MENSAGEM';
  public NOVO_EVENTO = 'NOVO EVENTO';

  public AGENDA = 'Agenda';
  public AGENDA_TITLE = 'Agenda';

  public CONFIRM_DELETE = 'EXCLUIR?';
  public INCLUIDO = 'INCLUIDO';
  public ENVIADA = 'ENVIADA';
  public SALVO = 'SALVO';
  public ERRO = 'ERRO';
  public EDITANDO = 'EDITANDO';
  public COMPLETAR = 'COMPLETAR';

  public GRAY = 'gray';
  public BLUE = 'dodgerblue';
  public ORANGE = 'orange';
  public GREEN = 'green';
  public RED = 'red';

  public DIASDASEMANA = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
  ];

  public DIASDASEMANACURTOS = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sab'
  ];

  public MESESDOANO = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];

  public MESESDOANOCURTOS = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ];

  // Divisão dentária
  public ARCADA1 = ["11", "12", "13", "14", "15", "16", "17", "18"];
  public ARCADA2 = ["21", "22", "23", "24", "25", "26", "27", "28"];
  public ARCADA3 = ["31", "32", "33", "34", "35", "36", "37", "38"];
  public ARCADA4 = ["41", "42", "43", "44", "45", "46", "47", "48"];
  public DENTES = [...this.ARCADA1, ...this.ARCADA2, ...this.ARCADA3, ...this.ARCADA4];


  public formata_email(email: string): string {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  // Funções para CPF
  public formata_cpf(cpf: string): string {
    cpf = cpf.replace(/\D/g, ''); // Limpa tudo que não é número
    if (cpf.length !== 11) return ''; // Verifica se o CPF tem 11 dígitos

    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); // Formata CPF
  }


  // Funções auxiliares
  public pad(num: string | number, size: number): string {
    return num.toString().padStart(size, '0');
  }

  public isNumeric(n: string | number): boolean {
    return !isNaN(parseFloat(n.toString())) && isFinite(Number(n));
  }

  // Função para clonar um objeto
  public clone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }

  public formata_valor(x: string | number, decimais: number = 2): string {
    const numero = parseFloat(x.toString()).toFixed(decimais).toString();
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // ====================================
  // NOVOS 2024
  // ====================================

  /**
 * capitalize(text: string): string
 * @param text - Texto a ser formatado.
 * @returns O mesmo texto com a primeira letra de cada palavra em maiúsculo.
 * @description Essa função utiliza expressão regular para capitalizar a primeira letra de cada palavra.
 */
  capitalize(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  }


  public capitalizar(str: string): string {

    if (!str || typeof str !== 'string') {
      return '';
    }

    str = str.toLowerCase().trim(); // Converte tudo para minúsculas e remove espaços no início e no fim

    // Capitaliza a primeira letra de cada palavra
    str = str.replace(/(?:^|\s)\S/g, function (letter) {
      return letter.toUpperCase();
    });

    // Exceções que devem permanecer em minúsculas
    const excecoesMinusculas = 'de do da dos das por para e com em à'.split(' ');

    // Exceções que devem permanecer em MAIÚSCULAS (exemplo: siglas de estados)
    const excecoesMaiusculas = 'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ');

    str = str.split(' ').map(palavra => {
      if (excecoesMinusculas.includes(palavra.toLowerCase())) {
        return palavra.toLowerCase();
      } else if (excecoesMaiusculas.includes(palavra.toUpperCase())) {
        return palavra.toUpperCase();
      } else {
        return palavra;  // Mantém o restante como está
      }
    }).join(' ');


    return str;
  }


  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isImageUrl(url: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    try {
      const parsedUrl = new URL(url);
      const extension = parsedUrl.pathname.split('.').pop();
      return imageExtensions.includes(extension!.toLowerCase());
    } catch {
      return false;
    }
  }

  formatUrl(url: string, type: string = ''): string {
    if (!url) return '';

    url = url.trim();

    // Se não tiver '@', verifica se tem protocolo http:// ou https://
    if (!url.includes('@')) {
      url = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
    if (url.startsWith('http')) return url;

    switch (type) {
    case 'instagram':
      return `https://www.instagram.com/${url}`;
    case 'facebook':
      return `https://www.facebook.com/${url}`;
    case 'linkedin':
      return `https://www.linkedin.com/in/${url}`;
    case 'youtube':
      return `https://www.youtube.com/channel/${url}`;
    case 'twitter':
      return `https://twitter.com/${url}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${url}`;
    case 'pinterest':
      return `https://www.pinterest.com/${url}`;
    default:
      // Se não for um tipo conhecido, ou vazio, adiciona https:// se não tiver
      return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
  }

  titulo_ajuste_plural(titulo: string): string {
    switch (titulo) {
    case 'usuarios':
      return 'Usuários';
    case 'associados':
      return 'Associados';
    case 'professores':
      return 'Professores';
    case 'alunos':
      return 'Alunos';
    case 'pacientes':
      return 'Pacientes';
    case 'proteticos':
      return 'Protéticos';
    case 'equipe':
      return 'Equipe';
    case 'dentistas':
      return 'Dentistas';
    case 'dentais':
      return 'Dentais';
    case 'empresas':
      return 'Empresas';
    case 'fornecedores':
      return 'Fornecedores';
    case 'exames':
      return 'Exames';
    case 'documentos':
      return 'Documentos';
    case 'planos':
      return 'Planos';
    case 'atendimentos':
      return 'Atendimentos';
    case 'consultas':
      return 'Consultas';
    case 'pagamentos':
      return 'Pagamentos';
    case 'dentes':
      return 'Dentes';
    case 'dentesendo':
      return 'Endodontia';
    case 'dentesperio':
      return 'Periodontia';
    case 'anamnese':
      return 'Anamneses';
    case 'diagnosticos':
      return 'Diagnósticos';
    case 'risco':
      return 'Riscos de Cárie';
    case 'erupcoes':
      return 'Erupções Dentárias';
    default:
      return 'Registros';
    }
  }

  titulo_ajuste_singular(titulo: string): string {
    switch (titulo) {
    case 'usuarios':
      return 'Usuário';
    case 'associados':
      return 'Associado';
    case 'professores':
      return 'Professor';
    case 'alunos':
      return 'Aluno';
    case 'pacientes':
      return 'Paciente';
    case 'proteticos':
      return 'Protético';
    case 'equipe':
      return 'Equipe';
    case 'dentistas':
      return 'Dentista';
    case 'dentais':
      return 'Dental';
    case 'empresas':
      return 'Empresa';
    case 'fornecedores':
      return 'Fornecedor';
    case 'notas':
      return 'Anotação';
    case 'exames':
      return 'Exame';
    case 'documentos':
      return 'Documento';
    case 'planos':
      return 'Plano';
    case 'atendimentos':
      return 'Atendimento';
    case 'consultas':
      return 'Consultas';
    case 'pagamentos':
      return 'Pagamento';
    case 'dentes':
      return 'Dente';
    case 'dentesendo':
      return 'Endodontia';
    case 'dentesperio':
      return 'Periodontia';
    case 'anamnese':
      return 'Anamnese';
    case 'diagnosticos':
      return 'Diagnóstico';
    case 'risco':
      return 'Risco de Cárie';
    case 'erupcoes':
      return 'Erupção Dentária';
    default:
      return 'Registros';
    }
  }

  // Função para calcular o dígito verificador
  calcularDigitoVerificador(codigo: string): number {
    return codigo.split('').reduce((acc, num) => acc + parseInt(num, 10), 0) % 10;
  }

  // Método para ir para a página home
  goHome() {
    this.router.navigate(['/home']);
  }

  go(route: string) {
    this.router.navigate(['/' + route]);
  }

  go_url(url: string): void {
    // Garantir que a URL tem o protocolo correto
    if (url && url.trim() !== '') {
      // Se a URL não começar com http:// ou https://, adicionar https://
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      window.open(url, '_blank'); // Abre em uma nova aba ou janela
    } else {
      console.warn('URL inválida ou vazia');
    }
  }



  // Método para fazer upload de arquivos no Firebase Storage
  // uploadFile(path: string, file: File): Observable<string> {
  //   const filePath = `${path}/${file.name}`; // Define o caminho no Firebase Storage
  //   const fileRef = this.storage.ref(filePath);
  //   const task = this.storage.upload(filePath, file);

  //   return new Observable<string>(observer => {
  //     task.snapshotChanges().pipe(
  //       finalize(() => {
  //         fileRef.getDownloadURL().subscribe(url => {
  //           observer.next(url); // Retorna a URL do arquivo após o upload
  //           observer.complete();
  //         });
  //       })
  //     ).subscribe();
  //   });
  // }


  voltar() {
    this.navegacaoService.goBack();
  }



  // Formatador de telefone para exibição
  formatarTelefone (tel: string): string {
    if (!tel) return '';

    // Remove todos os caracteres não-numéricos
    const numbers = tel.replace(/\D/g, '');

    // Formata baseado no tamanho
    if (numbers.length === 11) { // Celular com DDD
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else if (numbers.length === 10) { // Fixo com DDD
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }

    return tel; // Retorna original se não conseguir formatar
  }


  // Método para normalizar datas para o padrão dd/mm/yyyy
  public normalizarFormatoData(data: string): string | null {
    if (!data) return null;
    
    // Remover espaços em branco extras
    data = data.trim();
    
    // Handle malformed dates like "03/112018" (missing slash between month and year)
    if (data.match(/^\d{2}\/\d{6}$/)) {
      // Insert slash between month and year
      data = data.substring(0, 3) + data.substring(3, 5) + '/' + data.substring(5);
    }
    
    // Identificar o formato pela presença de separadores
    if (data.includes('-')) {
      // Formato com hífen (yyyy-mm-dd ou dd-mm-yyyy)
      const partes = data.split('-');
      
      // Safety check - ensure all parts exist before accessing
      if (!partes || partes.length < 3) {
        console.warn('Formato de data com hífen inválido:', data);
        return null;
      }
  
      if (partes[0].length === 4) {
        // É yyyy-mm-dd, converter para dd/mm/yyyy
        const [ano, mes, dia] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
      } else {
        // É dd-mm-yyyy, converter para dd/mm/yyyy
        const [dia, mes, ano] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
      }
    } else if (data.includes('/')) {
      // Formato com barra (dd/mm/yyyy ou yyyy/mm/dd)
      const partes = data.split('/');
      
      // Safety check - ensure all parts exist before accessing
      if (!partes || partes.length < 3) {
        console.warn('Formato de data com barra inválido:', data);
        return null;
      }
  
      if (partes[0].length === 4) {
        // É yyyy/mm/dd, converter para dd/mm/yyyy
        const [ano, mes, dia] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
      } else {
        // Já está em dd/mm/yyyy, apenas garantir o formato correto
        const [dia, mes, ano] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano.length === 2 ? '20' + ano : ano}`;
      }
    }
  
    // Se não tem separador reconhecido, assume que está em um formato desconhecido
    console.warn('Formato de data não reconhecido:', data);
    return data;
  }


  // Método para calcular idade em meses a partir da data de nascimento (dd/mm/yyyy)
  public calcularIdadeEmMeses(dataNascimento: string | null): number {
    if (!dataNascimento) return 0;

    const normalizedDate = this.normalizarFormatoData(dataNascimento);
    if (!normalizedDate) return 0; // Return 0 if date couldn't be normalized
    
    try {
      // Extrair componentes da data (formato dd/mm/yyyy)
      const partes = normalizedDate.split('/');
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Mês em JS é 0-indexed
      const ano = parseInt(partes[2], 10);

      const dataNasc = new Date(ano, mes, dia);
      const hoje = new Date();

      // Cálculo da diferença em meses
      const diffAnos = hoje.getFullYear() - dataNasc.getFullYear();
      const diffMeses = hoje.getMonth() - dataNasc.getMonth();
      const idadeMeses = (diffAnos * 12) + diffMeses;

      // Ajuste para quando o dia do mês atual é menor que o dia de nascimento
      if (hoje.getDate() < dia) {
        return idadeMeses - 1;
      }

      return idadeMeses;
    } catch (error) {
      console.error('Erro ao calcular idade em meses:', error);
      return 0;
    }
  }


}
