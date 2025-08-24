import React from 'react';
import { Bot } from "lucide-react";

interface AppCardProps {
  title: string;
  description: string;
  description2: string;
  icon: React.ReactNode;
  url: string;
}

// const AppCard: React.FC<AppCardProps> = ({ title, description2, icon, url }) => {
const AppCard: React.FC<AppCardProps> = ({ title, description, description2, icon, url }) => {
  const content = (
    <>
      <div className="icon mb-4 text-white text-4xl raised p-4 rounded-full bg-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 text-white drop-shadow-lg">{title}</h3>

      {/* Container flex para empurrar descriptions para baixo */}
      <div className="flex flex-col justify-end items-center mt-auto space-y-3 w-full">
        {description && (
          <p className="text-white/80 text-sm backdrop-blur-sm py-2 px-4 rounded-lg bg-white/10 border border-white/20 shadow-inner">{description}</p>
        )}
        {description2 && (
          <p className="text-white/80 text-sm inset py-2 px-4 rounded-lg w-full bg-black/20 shadow-inner">{description2}</p>
        )}
      </div>
    </>
  );

  if (url && url.trim() !== '') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card p-6 flex flex-col items-center text-center h-full"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center h-full">
      {content}
    </div>
  );
};

const Clinicas: React.FC = () => {
  const apps = [
    {
      title: "Clínica Integrada - UFRJ",
      description: "",
      description2: "Em uso desde 2017",
      icon: <Bot size={32} />,
      url: "https://dentistas.com.br/clinicaintegrada"
    },
    {
      title: "Acompanhamento de Erupcões Dentárias - UFC",
      description: "",
      description2: "USO RESTRITO DE PROJETO",
      icon: <Bot size={32} />,
      url: ""
    },
    {
      title: "Clínica de Endodontia - UPE",
      description: "",
      description2: "Em uso desde 2024",
      icon: <Bot size={32} />,
      url: "https://dentistas.com.br/clinica"
    }
  ];

  return (
    <section id="clinica" className="py-12 px-4">
      <div className="glass max-w-6xl mx-auto p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Clínica Odontológica</h2>
          <div className="divider"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

export default Clinicas;
