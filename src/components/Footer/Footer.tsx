import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contato" className="py-12 px-4">
      <div className="glass max-w-6xl mx-auto p-8 md:p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Contato</h2>
          <div className="divider"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="emboss p-6 rounded-xl bg-white/5">
            <h3 className="text-xl font-bold text-white mb-8 raised px-4 py-2 rounded-lg bg-white/20 w-full">Dentistas.com.br</h3>
            <p className="text-white/80 pb-3">
              Aplicações e serviços para dentistas, professores e estudantes.
            </p>
            <p className="text-white/80">
              Inovando desde 1996, e lançado oficialmente no CIORJ 1997.
            </p>
          </div>

          <div className="emboss p-6 text-lg rounded-xl bg-white/5">

            <h3 className="text-xl font-bold text-white mb-8 raised px-4 py-2 rounded-lg bg-white/20 w-full">Contato</h3>

            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="mr-3 raised p-2 rounded-lg bg-white/10">Email</span>
                <a href="mailto:contato@dentistas.com.br" className="text-white/80 hover:text-white transition-colors">
                  contato@dentistas.com.br
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-3 raised p-2 rounded-lg bg-white/10">WhatApp </span>
                <a href="tel:+552124346931" className="text-white/80 hover:text-white transition-colors">
                  (21) 2434-6931
                </a>
              </li>
            </ul>

          </div>

          {/* <div className="emboss p-6 rounded-xl bg-white/5">
            <h3 className="text-xl font-bold text-white mb-4 raised px-4 py-2 rounded-lg bg-violet-600/50 w-full">Parceiros</h3>
            <ul className="space-y-2">
              {['FO-UFRJ', 'FO-UPE', 'FOR', 'FO-UFC', 'UFB'].map((partner, index) => (
                <li key={index} className="text-white/80 raised px-3 py-1 rounded-lg bg-white/10 mb-2 inline-block mr-2">
                  {partner}
                </li>
              ))}
            </ul>
          </div> */}

        </div>

        <div className="divider mt-10"></div>

        <div className="text-center text-white/60">
          <p className="emboss py-2 px-12 rounded-full bg-white/5 inline-block">
            &copy; 1997 - Dentistas.com.br
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
