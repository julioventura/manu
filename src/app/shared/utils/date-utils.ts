export class DateUtils {
  /**
     * Converte uma data em qualquer formato para o formato "00-00-0000".
     * @param data - A data a ser convertida (string ou Date).
     * @returns A data no formato "dd-MM-yyyy".
     */
  static converteData(data: string | Date): string {
    try {
      let parsedDate: Date;

      if (typeof data === 'string') {
        // Normalizar separadores (substituir "-" por "/")
        data = data.replace(/-/g, '/');

        // Verificar se o formato é dd/mm/aa ou dd/mm/aaaa
        if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(data)) {
          const [dia, mes, ano] = data.split('/');

          // Converter o ano para quatro dígitos com base na regra
          const anoCorrigido = ano.length === 2 ? (parseInt(ano) >= 50 ? `19${ano}` : `20${ano}`) : ano;

          parsedDate = new Date(+anoCorrigido, +mes - 1, +dia); // Constrói a data
        }
        // Verificar se o formato é aa/mm/dd ou aaaa/mm/dd
        else if (/^\d{2,4}\/\d{1,2}\/\d{1,2}$/.test(data)) {
          const [ano, mes, dia] = data.split('/');

          // Converter o ano para quatro dígitos com base na regra
          const anoCorrigido = ano.length === 2 ? (parseInt(ano) >= 50 ? `19${ano}` : `20${ano}`) : ano;

          parsedDate = new Date(+anoCorrigido, +mes - 1, +dia); // Constrói a data
        } else {
          throw new Error("Formato de data não reconhecido.");
        }

        if (isNaN(parsedDate.getTime())) {
          throw new Error("Data inválida.");
        }
      } else if (data instanceof Date) {
        parsedDate = data;
      } else {
        throw new Error("Formato de data não suportado.");
      }

      const dia = String(parsedDate.getDate()).padStart(2, '0');
      const mes = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const ano = parsedDate.getFullYear();

      return `${dia}-${mes}-${ano}`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Erro ao converter a data: " + error.message);
      } else {
        throw new Error("Erro desconhecido ao converter a data.");
      }
    }
  }

  /**
     * Calcula a idade no formato "x anos e y meses".
     * @param dataNascimento - A data de nascimento (string ou Date).
     * @returns A idade como string no formato "x anos e y meses".
     */
  static idade(dataNascimento: string | Date): string {
    try {
      const nascimento = new Date(this.converteData(dataNascimento).split('-').reverse().join('-'));
      const hoje = new Date();

      let anos = hoje.getFullYear() - nascimento.getFullYear();
      let meses = hoje.getMonth() - nascimento.getMonth();
      let dias = hoje.getDate() - nascimento.getDate();

      if (dias < 0) {
        meses -= 1;
        const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
        dias += ultimoDiaMesAnterior;
      }

      if (meses < 0) {
        anos -= 1;
        meses += 12;
      }

      if (anos === 0 && meses === 0) {
        return `${dias} dia${dias > 1 ? 's' : ''}`;
      } else if (anos === 0) {
        return `${meses} ${meses > 1 ? 'meses' : 'mês'}`;
      } else if (meses === 0) {
        return `${anos} ano${anos > 1 ? 's' : ''}`;
      } else {
        return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} ${meses > 1 ? 'meses' : 'mês'}`;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Erro ao calcular a idade: " + error.message);
      } else {
        throw new Error("Erro desconhecido ao calcular a idade.");
      }
    }
  }

  /**
     * Calcula os anos de idade com uma casa decimal.
     * @param dataNascimento - A data de nascimento (string ou Date).
     * @returns Os anos de idade com uma casa decimal.
     */
  static anos(dataNascimento: string | Date): number {
    const nascimento = new Date(this.converteData(dataNascimento).split('-').reverse().join('-'));
    const hoje = new Date();

    const totalMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (hoje.getMonth() - nascimento.getMonth());
    return Math.round((totalMeses / 12) * 10) / 10;
  }

  /**
     * Calcula o total de meses de vida.
     * @param dataNascimento - A data de nascimento (string ou Date).
     * @returns O total de meses de vida como número inteiro.
     */
  static meses(dataNascimento: string | Date): number {
    const nascimento = new Date(this.converteData(dataNascimento).split('-').reverse().join('-'));
    const hoje = new Date();

    const totalMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (hoje.getMonth() - nascimento.getMonth());
    return totalMeses;
  }

  /**
     * Obtém o timestamp atual em milissegundos.
     * @returns Timestamp atual.
     */
  static getAgoraEmMilisegundos(): number {
    return Date.now();
  }

  /**
     * Obtém o timestamp de uma data específica.
     * @param data - Data em string.
     * @returns Timestamp da data.
     */
  static getTempoDecorridoEmMilisegundos(data: string): number {
    return Date.parse(data);
  }

  /**
     * Formata uma string de data para o formato "dd/MM/yyyy".
     * @param data - String de data.
     * @returns Data formatada.
     */
  static formataData(data: string): string {
    if (!data) {
      return '';
    }

    data = data.replace(/\D/g, ''); // Limpa tudo que não é número

    if (data.length === 6) {
      let ano = Number(data.substr(4, 2)) + 1900;
      if (ano < 1950) {
        ano += 100;
      }
      return `${data.substr(0, 2)}/${data.substr(2, 2)}/${ano}`;
    } else if (data.length === 8) {
      return `${data.substr(0, 2)}/${data.substr(2, 2)}/${data.substr(4, 4)}`;
    }

    return data;
  }

  /**
     * Obtém a data de hoje no formato "dd/MM/yyyy".
     * @returns Data atual formatada.
     */
  static hoje(): string {
    const hoje = new Date();
    const dia = this.pad(hoje.getDate(), 2);
    const mes = this.pad(hoje.getMonth() + 1, 2);
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  /**
     * Adiciona zeros à esquerda de um número para um tamanho específico.
     * @param num - Número a ser formatado.
     * @param size - Tamanho desejado.
     * @returns Número formatado como string.
     */
  static pad(num: string | number, size: number): string {
    return num.toString().padStart(size, '0');
  }
}
