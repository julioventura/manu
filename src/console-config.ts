// Configurações de console para reduzir logs verbosos em desenvolvimento
// Este arquivo deve ser carregado antes do main.ts

(function() {
  'use strict';
  
  // Configurações para reduzir logs do Zone.js
  if (!(window as unknown as { [key: string]: boolean })['__Zone_disable_requestAnimationFrame']) {
    (window as unknown as { [key: string]: boolean })['__Zone_disable_requestAnimationFrame'] = true;
  }
  
  // Filtrar logs específicos do Firebase/Firestore
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  console.log = function(...args) {
    const message = args.join(' ');
    // Filtrar logs específicos que não são úteis em desenvolvimento
    if (
      message.includes('Fetch finished loading:') ||
      message.includes('zone.js:') ||
      message.includes('setInterval') ||
      message.includes('[Violation]')
    ) {
      return; // Não mostrar estes logs
    }
    originalLog.apply(console, args);
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    // Filtrar warnings específicos
    if (
      message.includes('zone.js:') ||
      message.includes('Firestore') && message.includes('Listen')
    ) {
      return; // Não mostrar estes warnings
    }
    originalWarn.apply(console, args);
  };
  
})();
