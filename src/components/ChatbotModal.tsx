/**
 * ==================================
 * ChatbotModal
 * ==================================
 * 
 * Componente de chatbot interativo com assistência contextual baseado na página atual.
 * Suporta múltiplos estados de visualização (minimizado, normal, maximizado) e
 * estilos visuais (alto-relevo ou baixo-relevo). Integra-se com webhook externo
 * para processamento de mensagens, com fallback para respostas locais.
 * 
 * Estados:
 * - chatState: Estado de visualização (minimizado, normal, maximizado)
 * - messages: Histórico de mensagens
 * - inputValue: Controle do campo de entrada
 * - isLoading: Indicador de carregamento de resposta
 * - isElevated: Controle de estilo visual (true=alto-relevo, false=baixo-relevo)
 * 
 * Funções:
 * - getPageContext: Determina contexto da página atual
 * - getInitialMessage: Cria mensagem de boas-vindas contextualizada
 * - sendToWebhook: Envia mensagens para webhook N8N externo
 * - getBotResponseLocal: Gera respostas locais quando webhook falha
 * - scrollToBottom: Auto-scroll para novas mensagens
 * - handleSendMessage: Lógica de processamento de mensagens
 * - toggleChatState: Alterna entre estados de visualização
 * - getChatbotStyle: Gera estilos CSS baseados no estado atual
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Maximize2, Minimize2, X, Send, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';

type ChatState = 'minimized' | 'normal' | 'maximized';
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

const ChatbotModal = () => {
  // Estados principais do componente
  const [chatState, setChatState] = useState<ChatState>('minimized');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Controle de estilo visual (alto-relevo vs baixo-relevo)
  const [isElevated] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Constantes de estilo para o chatbot
  const chatbotBgColor = '#1a1b3a';
  const chatbotTextColor = '#e0e0e0';
  const chatbotShadowLight = 'rgba(147, 51, 234, 0.3)';
  const chatbotShadowDark = 'rgba(0, 0, 0, 0.7)';

  /**
   * getPageContext
   * Determina o contexto da página atual com base na URL
   * Usado para personalizar respostas e mensagem inicial
   */
  const getPageContext = useCallback(() => {
    switch (location.pathname) {
      case '/':
        return 'página inicial do Dentistas.com.br com informações sobre as aplicações disponíveis';
      case '/terms':
        return 'página de Termos de Uso do Dentistas.com.br';
      case '/privacy':
        return 'página de Política de Privacidade do Dentistas.com.br';
      case '/license':
        return 'página de Licença MIT do Dentistas.com.br';
      default:
        return 'uma página do Dentistas.com.br';
    }
  }, [location.pathname]);

  /**
   * getInitialMessage
   * Cria mensagem de boas-vindas personalizada baseada na página atual
   * Memorizada com useCallback para evitar re-renders desnecessários
   */
  const getInitialMessage = useCallback(() => {
    const pageContext = getPageContext();
    return `Olá! 👋 Bem-vindo à ${pageContext}. Sou o assistente do Dentistas.com.br e estou aqui para ajudar você!`;
  }, [getPageContext]);

  /**
   * Inicialização de mensagens
   * Carrega a mensagem inicial quando o chat é aberto pela primeira vez
   */
  useEffect(() => {
    if (chatState === 'normal' && messages.length === 0) {
      setMessages([{ id: 1, text: getInitialMessage(), sender: 'bot' }]);
    }
  }, [chatState, messages.length, getInitialMessage]);

  /**
   * sendToWebhook
   * Envia mensagem do usuário para o webhook N8N configurado
   * Inclui contexto da página atual e outros metadados úteis
   * Em caso de falha, utiliza resposta local como fallback
   */
  const sendToWebhook = async (userMessage: string): Promise<string> => {
    try {
      setIsLoading(true);

      const webhookUrl: string | undefined = import.meta.env.VITE_WEBHOOK_N8N_URL as string | undefined;

      // Se a URL do webhook não estiver configurada, usar resposta local sem erro
      if (!webhookUrl || webhookUrl.trim() === '') {
        console.info('Webhook N8N não configurado - usando respostas locais');
        return getBotResponseLocal(userMessage);
      }

      const payload = {
        message: userMessage,
        page: location.pathname,
        pageContext: getPageContext(),
        timestamp: new Date().toISOString(),
        sessionId: Date.now() // ID único da sessão
      };

      const response = await fetch(String(webhookUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = (await response.json()) as { response?: string; message?: string };

      // Retorna a resposta do webhook ou uma mensagem padrão
      return data.response ?? data.message ?? 'Obrigado pela sua mensagem! Como posso ajudar você?';

    } catch (error) {
      console.error('Erro ao enviar para webhook:', error);

      // Fallback para resposta local em caso de erro
      return getBotResponseLocal(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * getBotResponseLocal
   * Sistema de fallback com respostas locais contextualizadas
   * Usado quando o webhook N8N não está disponível ou falha
   * Respostas são específicas para cada página e tipo de consulta
   */
  const getBotResponseLocal = (userMessage: string): string => {
    const pageContext = getPageContext();

    // Respostas contextualizadas baseadas na página
    if (location.pathname === '/') {
      if (userMessage.toLowerCase().includes('aplicação') || userMessage.toLowerCase().includes('app')) {
        return 'Aqui no Dentistas.com.br temos várias aplicações disponíveis: Calendar Monitor, Gmail Monitor, Fastbot e WhatsApp Monitor. Todas são gratuitas e de código aberto! Qual te interessa?';
      }
      if (userMessage.toLowerCase().includes('fastbot')) {
        return 'O Fastbot é perfeito para você! Permite criar um chatbot profissional para seu consultório em apenas 3 minutos. É rápido, fácil e está disponível agora mesmo!';
      }
      if (userMessage.toLowerCase().includes('github')) {
        return 'Todo nosso código é open source! Você pode ver, contribuir e usar livremente. Acesse nosso GitHub através dos links nos cards das aplicações.';
      }
    }

    if (location.pathname === '/terms') {
      return `Estou aqui para ajudar com dúvidas sobre nossos Termos de Uso. Posso esclarecer qualquer ponto específico que você queira entender melhor!`;
    }

    if (location.pathname === '/privacy') {
      return `Sobre nossa Política de Privacidade: protegemos seus dados com o máximo cuidado. Que aspecto da privacidade gostaria de saber mais?`;
    }

    if (location.pathname === '/license') {
      return `Nossa licença MIT garante que todo código é aberto e livre para uso. Isso significa transparência total e liberdade para adaptar às suas necessidades!`;
    }

    // Respostas gerais
    const responses = [
      `Estou aqui na ${pageContext} para ajudar. Como posso auxiliar você hoje?`,
      `Vejo que você está na ${pageContext}. Em que posso ajudar?`,
      'Sou o assistente do Dentistas.com.br! Posso esclarecer dúvidas sobre nossas aplicações e serviços.',
      'Precisa de ajuda com alguma de nossas ferramentas? Estou aqui para isso!',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  /**
   * scrollToBottom
   * Controla o scroll automático das mensagens
   * Mantém a visualização sempre na mensagem mais recente
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Aplica scroll automático quando novas mensagens são adicionadas
  useEffect(scrollToBottom, [messages]);

  /**
   * handleSendMessage
   * Processa o envio de mensagens do usuário e obtenção de respostas
   * Gerencia estados de loading e atualização da interface
   */
  const handleSendMessage = async (): Promise<void> => {
    if (inputValue.trim() === '') return;

    const newMessage: Message = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Adicionar mensagem de loading
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: 'Digitando...',
      sender: 'bot',
      isLoading: true
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Enviar para webhook N8N e aguardar resposta
    const botResponse = await sendToWebhook(currentInput);

    // Remover mensagem de loading e adicionar resposta real
    setMessages((prev) => {
      const withoutLoading = prev.filter((msg) => !msg.isLoading);
      return [...withoutLoading, {
        id: Date.now() + 2,
        text: botResponse,
        sender: 'bot'
      }];
    });
  };

  /**
   * toggleChatState
   * Alterna entre os estados de visualização do chatbot
   * (minimizado, normal ou maximizado)
   */
  const toggleChatState = (newState: ChatState) => {
    setChatState(newState);
  };

  /**
   * Estilos base comuns para todos os estados do chatbot
   * Define propriedades consistentes independente do modo
   */
  const commonChatbotStyles = {
    position: 'fixed',
    zIndex: 1000,
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    color: chatbotTextColor,
    fontFamily: "'Inter', sans-serif",
  };

  /**
   * getChatbotStyle
   * Gera estilos específicos para cada estado do chatbot
   * Suporta dois modos visuais: alto-relevo ou baixo-relevo
   */
  const getChatbotStyle = () => {
    // Estilos específicos para cada estado do chat (minimizado, normal, maximizado)
    // com suporte para os dois modos: alto-relevo (elevated) e baixo-relevo (carved)

    if (isElevated) {
      // Estilos para alto-relevo (elevated)
      switch (chatState) {
        case 'minimized':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: '20px',
            width: '70px',
            height: '70px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: chatbotBgColor,
            boxShadow: `0 10px 15px -3px ${chatbotShadowDark}, 0 4px 6px -4px ${chatbotShadowDark}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          };
        case 'normal':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: isMobile ? '10px' : '20px',
            left: isMobile ? '10px' : 'auto',
            width: isMobile ? 'calc(100vw - 20px)' : 'clamp(300px, 33vw, 450px)',
            height: '80vh',
            maxHeight: '650px',
            background: chatbotBgColor,
            boxShadow: `0 20px 25px -5px ${chatbotShadowDark}, 0 8px 10px -6px ${chatbotShadowDark}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          };
        case 'maximized':
          return {
            ...commonChatbotStyles,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: '0px',
            background: chatbotBgColor,
            boxShadow: 'none',
          };
        default:
          return {};
      }
    } else {
      // Estilos para baixo-relevo (carved) - original
      switch (chatState) {
        case 'minimized':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: '20px',
            width: '70px',
            height: '70px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: `linear-gradient(145deg, ${chatbotBgColor}, ${chatbotShadowLight})`,
            boxShadow: `10px 10px 20px ${chatbotShadowDark}, -10px -10px 20px ${chatbotShadowLight}`,
          };
        case 'normal':
          return {
            ...commonChatbotStyles,
            bottom: '20px',
            right: isMobile ? '10px' : '20px',
            left: isMobile ? '10px' : 'auto',
            width: isMobile ? 'calc(100vw - 20px)' : 'clamp(300px, 33vw, 450px)',
            height: '80vh',
            maxHeight: '650px',
            background: chatbotBgColor,
            boxShadow: `12px 12px 25px ${chatbotShadowDark}, -12px -12px 25px ${chatbotShadowLight}`,
          };
        case 'maximized':
          return {
            ...commonChatbotStyles,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: '0px',
            background: chatbotBgColor,
            boxShadow: `0 0 0 transparent`,
          };
        default:
          return {};
      }
    }
  };

  /**
   * Renderização do chatbot no estado minimizado
   * Exibe apenas um botão flutuante com ícone
   */
  if (chatState === 'minimized') {
    return (
      <div
        style={getChatbotStyle()}
        onClick={() => toggleChatState('normal')}
        role="button"
        aria-label="Abrir chatbot"
        className="neu-chatbot-minimized"
      >
        <Bot size={32} color={chatbotTextColor} />
      </div>
    );
  }

  /**
   * Renderização do chatbot nos estados normal e maximizado
   * Inclui cabeçalho, área de mensagens e área de entrada
   */
  return (
    <div style={getChatbotStyle()} className="neu-chatbot-container">
      {/* Header do Chatbot */}
      <div style={{
        padding: '15px 20px',
        borderTopLeftRadius: chatState === 'normal' ? '24px' : '0px',
        borderTopRightRadius: chatState === 'normal' ? '24px' : '0px',
        background: isElevated
          ? `rgba(255, 255, 255, 0.05)`
          : `linear-gradient(145deg, ${chatbotShadowLight}, ${chatbotBgColor})`,
        boxShadow: isElevated
          ? 'none'
          : `inset 5px 5px 10px ${chatbotShadowDark}, inset -5px -5px 10px ${chatbotShadowLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        borderBottom: isElevated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      }}>
        <div className="flex items-center">
          <Bot size={24} style={{ marginRight: '10px', color: chatbotTextColor }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: chatbotTextColor }}>
            Assistente Virtual {isLoading && <span className="animate-pulse">●</span>}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {chatState === 'normal' && (
            <button
              onClick={() => toggleChatState('maximized')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              aria-label="Maximizar chatbot"
            >
              <Maximize2 size={18} color={chatbotTextColor} />
            </button>
          )}
          {chatState === 'maximized' && (
            <button
              onClick={() => toggleChatState('normal')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              aria-label="Restaurar chatbot"
            >
              <Minimize2 size={18} color={chatbotTextColor} />
            </button>
          )}
          <button
            onClick={() => toggleChatState('minimized')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
            aria-label="Minimizar chatbot"
          >
            <X size={20} color={chatbotTextColor} />
          </button>
        </div>
      </div>

      {/* Área de Mensagens - Container de histórico da conversa */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', background: chatbotBgColor }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 15px',
                borderRadius: '18px',
                color: msg.sender === 'user' ? chatbotBgColor : chatbotTextColor,
                background: msg.sender === 'user'
                  ? `linear-gradient(145deg, #06b6d4, #0891b2)`
                  : isElevated
                    ? 'rgba(255, 255, 255, 0.05)'
                    : `linear-gradient(145deg, ${chatbotShadowLight}, ${chatbotBgColor})`,
                boxShadow: isElevated
                  ? '0 2px 5px rgba(0, 0, 0, 0.2)'
                  : `3px 3px 6px ${chatbotShadowDark}, -3px -3px 6px ${chatbotShadowLight}`,
                wordWrap: 'break-word',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                opacity: msg.isLoading ? 0.7 : 1,
                border: isElevated && msg.sender === 'bot' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              {msg.sender === 'bot' && <Bot size={16} className="inline mr-2 mb-0.5" />}
              {msg.sender === 'user' && <User size={16} className="inline mr-2 mb-0.5" />}
              {msg.isLoading ? (
                <span className="animate-pulse">Digitando...</span>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input - Campo de entrada e botão de envio */}
      <div style={{
        padding: '15px 20px',
        borderBottomLeftRadius: chatState === 'normal' ? '24px' : '0px',
        borderBottomRightRadius: chatState === 'normal' ? '24px' : '0px',
        background: isElevated
          ? 'rgba(255, 255, 255, 0.05)'
          : `linear-gradient(145deg, ${chatbotShadowLight}, ${chatbotBgColor})`,
        boxShadow: isElevated
          ? 'none'
          : `inset 5px 5px 10px ${chatbotShadowDark}, inset -5px -5px 10px ${chatbotShadowLight}`,
        display: 'flex',
        alignItems: 'center',
        borderTop: isElevated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}

          onKeyDown={e => {
            if (e.key === 'Enter' && !isLoading) {
              void handleSendMessage();
            }
          }}

          placeholder={isLoading ? "Aguardando resposta..." : "Digite sua mensagem..."}
          disabled={isLoading}
          style={{
            flexGrow: 1,
            padding: '12px 15px',
            border: isElevated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            borderRadius: '12px',
            background: chatbotBgColor,
            color: chatbotTextColor,
            outline: 'none',
            fontSize: '0.9rem',
            marginRight: '10px',
            boxShadow: isElevated
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
              : `inset 3px 3px 6px ${chatbotShadowDark}, inset -3px -3px 6px ${chatbotShadowLight}`,
            opacity: isLoading ? 0.6 : 1,
          }}
        />
        <button
          onClick={() => { void handleSendMessage(); }}
          disabled={isLoading}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '50%',
            background: isLoading
              ? `linear-gradient(145deg, #64748b, #475569)`
              : `linear-gradient(145deg, #06b6d4, #0891b2)`,
            color: chatbotBgColor,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            boxShadow: isElevated
              ? '0 4px 6px rgba(0, 0, 0, 0.4)'
              : `4px 4px 8px ${chatbotShadowDark}, -4px -4px 8px ${chatbotShadowLight}`,
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseDown={(e) => !isLoading && (e.currentTarget.style.boxShadow = isElevated
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
            : `inset 2px 2px 4px ${chatbotShadowDark}, inset -2px -2px 4px ${chatbotShadowLight}`)}
          onMouseUp={(e) => !isLoading && (e.currentTarget.style.boxShadow = isElevated
            ? '0 4px 6px rgba(0, 0, 0, 0.4)'
            : `4px 4px 8px ${chatbotShadowDark}, -4px -4px 8px ${chatbotShadowLight}`)}
          aria-label="Enviar mensagem"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatbotModal;
