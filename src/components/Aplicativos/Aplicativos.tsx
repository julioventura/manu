import React from 'react';
import { Bot, Monitor, Mail, MessageSquare } from "lucide-react";

interface AppCardProps {
  title: string;
  description: string;
  description2: string;
  icon: React.ReactNode;
  url: string;
}

const AppCard: React.FC<AppCardProps> = ({ title, description, description2, icon, url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card p-6 flex flex-col items-center text-center"
    >
      <div className="icon mb-4 text-white text-4xl raised p-4 rounded-full bg-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 text-white drop-shadow-lg">{title}</h3>

      {/* Container flex para empurrar descriptions para baixo */}
      <div className="flex flex-col justify-end items-center mt-auto space-y-3 w-full">
        {description && (
          <p className="text-white/80 text-sl backdrop-blur-sm py-2 px-4 rounded-lg bg-white/10 border border-white/20 shadow-inner">{description}</p>
        )}
        {description2 && (
          <p className="text-white/80 text-sl inset py-2 px-4 rounded-lg w-full bg-black/20 shadow-inner">{description2}</p>
        )}
      </div>
    </a>
  );
};

const Aplicativos: React.FC = () => {
  const apps = [
    {
      title: "FASTBOT",
      description: "Crie seu chatbot em 3 minutos",
      description2: "Gratuito e Open Source",
      icon: <Bot size={32} />,
      url: "https://dentistas.com.br/fastbot"
    },
    {
      title: "Agenda Google",
      description: "Monitore calendários facilmente",
      description2: "Integração completa",
      icon: <Monitor size={32} />,
      url: "https://dentistas.com.br/agenda"
    },
    {
      title: "Gmail Monitor",
      description: "Monitoramento de emails",
      description2: "Alertas em tempo real",
      icon: <Mail size={32} />,
      url: "https://dentistas.com.br/gmail"
    },
    {
      title: "WhatsApp Transcriptor",
      description: "Transcritor de áudios com registro das conversas",
      description2: "Automação do N8N (Entre em contato)",
      icon: <MessageSquare size={32} />,
      url: ""
    }
  ];

  return (
    <section id="aplicativos" className="py-12 px-4">
      <div className="glass max-w-6xl mx-auto p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Aplicativos Web</h2>
          <div className="divider"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {apps.map((app, index) => (
            <AppCard
              key={index}
              title={app.title}
              description={app.description}
              description2={app.description2}
              icon={app.icon}
              url={app.url}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Aplicativos;
