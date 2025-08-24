import React from 'react';

const Hero: React.FC = () => {
  // Função para scroll suave programático
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section id="inicio" className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass max-w-5xl mx-auto p-8 md:p-12 text-center">

        {/* <div className="raised inline-block px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-white/10 to-white/20">
          <span className="text-sm font-semibold text-white">Plataforma Odontológica Integrada</span>
        </div> */}

        <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
          Dentistas.com.br
        </h1>

        <div className="emboss p-4 rounded-xl mb-8 max-w-3xl mx-auto bg-white/5">
          <p className="text-xl md:text-2xl text-white/90">
            Aplicativos para Dentistas
          </p>
          <div className="divider"></div>
          <p className="text-lg md:text-lg text-white/60">
            Software de Código Aberto
          </p>
        </div>

        <div className="divider"></div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">

          <button
            onClick={() => scrollToSection('clinica')}
            className="btn-primary"
          >
            Clínica
          </button>

          <button
            onClick={() => scrollToSection('aplicativos')}
            className="btn-primary"
          >
            Aplicativos Web
          </button>

          <button
            onClick={() => scrollToSection('chatbots')}
            className="btn-primary"
          >
            Chatbots
          </button>

        </div>

      </div>
    </section>
  );
};

export default Hero;
