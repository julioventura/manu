// Alteração: remoção de logs de depuração (console.log)
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  templateUrl: './whatsapp-button.component.html',
  styleUrls: ['./whatsapp-button.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class WhatsappButtonComponent {
  @Input() phoneNumber: string = '5521981707207'; // Número padrão, deve ser substituído
  @Input() message: string = 'Olá! Gostaria de conversar. '; // Mensagem padrão
  @Input() isChatbotExpanded: boolean = false; // Para verificar se o chatbot está expandido

  openWhatsapp(): void {
    
    // Verifica se há um número de telefone
    if (!this.phoneNumber || this.phoneNumber.trim() === '') {
      console.error('WhatsApp button clicked but no phone number provided');
      alert('Número de WhatsApp não disponível');
      return;
    }
    
    // Formata a URL do WhatsApp com número e mensagem
    const encodedMessage = encodeURIComponent(this.message);
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    
    // Abre o WhatsApp em uma nova guia
    window.open(whatsappUrl, '_blank');
  }
}
