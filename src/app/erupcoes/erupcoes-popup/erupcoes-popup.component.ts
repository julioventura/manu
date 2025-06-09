import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DateUtils } from '../../shared/utils/date-utils';

interface DialogData {
  nome: string;
  nascimento: string;
  telefone: string;
  idade: string;
  dataChamadaInicial: string;
  dataUltimaChamada: string;
  dataResposta: string;
  dataComparecimento: string;
}

@Component({
  selector: 'app-erupcoes-popup',
  templateUrl: './erupcoes-popup.component.html',
  styleUrls: ['./erupcoes-popup.component.scss']
})
export class ErupcoesPopupComponent implements OnInit {
  public data?: DialogData;
  public idade: string = '';

  constructor(public dialogRef: MatDialogRef<ErupcoesPopupComponent>) {}

  ngOnInit(): void {
    if (this.data?.nascimento) {
      this.idade = DateUtils.idade(this.data.nascimento);
    } else {
      this.idade = 'Idade não disponível';
    }
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
