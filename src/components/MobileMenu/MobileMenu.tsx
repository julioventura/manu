import React, { useState, useEffect, useRef } from 'react';
import { Palette, ChevronDown, Check } from 'lucide-react';
import './MobileMenu.css';

type Theme = 'blue' | 'green' | 'red' | 'dark' | 'purple' | 'teal' | 'orange' | 'pink' | 'indigo' | 'brown';

interface ThemeOption {
  id: Theme;
  name: string;
  gradient: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [animationClass, setAnimationClass] = useState('');
  const [currentTheme, setCurrentTheme] = useState<Theme>('blue');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const themes: ThemeOption[] = [
    { id: 'blue', name: 'Azul Oceano', gradient: 'linear-gradient(135deg, hsl(270, 100%, 25%), hsl(220, 100%, 35%))' },
    { id: 'green', name: 'Verde Floresta', gradient: 'linear-gradient(135deg, hsl(160, 100%, 25%), hsl(140, 100%, 35%))' },
    { id: 'red', name: 'Vermelho Rubi', gradient: 'linear-gradient(135deg, hsl(340, 100%, 25%), hsl(0, 100%, 35%))' },
    { id: 'purple', name: 'Roxo Ametista', gradient: 'linear-gradient(135deg, hsl(280, 100%, 25%), hsl(260, 100%, 35%))' },
    { id: 'teal', name: 'Turquesa', gradient: 'linear-gradient(135deg, hsl(190, 100%, 25%), hsl(180, 100%, 35%))' },
    { id: 'orange', name: 'Laranja Sunset', gradient: 'linear-gradient(135deg, hsl(20, 100%, 25%), hsl(30, 100%, 35%))' },
    { id: 'pink', name: 'Rosa Sakura', gradient: 'linear-gradient(135deg, hsl(350, 100%, 25%), hsl(330, 100%, 35%))' },
    { id: 'indigo', name: 'Índigo Noite', gradient: 'linear-gradient(135deg, hsl(230, 100%, 25%), hsl(240, 100%, 35%))' },
    { id: 'brown', name: 'Marrom Terra', gradient: 'linear-gradient(135deg, hsl(20, 50%, 25%), hsl(30, 50%, 35%))' },
    { id: 'dark', name: 'Escuro Elegante', gradient: 'linear-gradient(135deg, hsl(0, 0%, 15%), hsl(0, 0%, 25%))' }
  ];

  useEffect(() => {
    if (isOpen) {
      setAnimationClass('menu-slide-in');
      // Prevenir rolagem do body quando o menu está aberto
      document.body.style.overflow = 'hidden';
    } else {
      setAnimationClass('menu-slide-out');
      // Restaurar rolagem do body quando o menu está fechado
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Gerenciar tema
  useEffect(() => {
    // Verificar se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem('dentistas-theme') as Theme | null;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Fechar dropdown de tema ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevenir scroll da página quando dropdown está aberto
  useEffect(() => {
    if (isThemeDropdownOpen) {
      // Desabilitar scroll da página
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        // Restaurar scroll da página ao fechar
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isThemeDropdownOpen]);

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dentistas-theme', theme);
    setIsThemeDropdownOpen(false);
  };

  const getCurrentThemeName = () => {
    return themes.find(theme => theme.id === currentTheme)?.name ?? 'Tema';
  };

  if (!isOpen && animationClass !== 'menu-slide-in') return null;

  const menuItems = [
    { name: 'Início', href: '#inicio' },
    { name: 'Clínica', href: '#clinica' },
    { name: 'Aplicativos', href: '#aplicativos' },
    { name: 'Chatbots', href: '#chatbots' },
    { name: 'Contato', href: '#contato' },
  ];

  const handleLinkClick = () => {
    // Fecha o menu ao clicar em um link
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay escuro para fechar o menu ao clicar fora */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu lateral */}
      <div className={`fixed top-0 right-0 h-full w-64 glass-dark ${animationClass}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-full"
              aria-label="Fechar menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="divider"></div>

          <nav className="flex-1">
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-white hover:text-blue-100 transition-colors block py-2 px-4 rounded-lg hover:bg-white/10"
                    onClick={handleLinkClick}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Divider antes do Theme Switcher */}
            <div className="divider my-6"></div>

            {/* Dropdown de Temas */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="text-white hover:text-blue-100 transition-colors relative group flex items-center gap-1 w-full py-2 px-4 rounded-lg hover:bg-white/10"
              >
                <Palette size={16} />
                <span className="text-sm">{getCurrentThemeName()}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ml-auto ${isThemeDropdownOpen ? 'rotate-180' : ''}`}
                />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-white transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Menu Dropdown de Temas */}
              {isThemeDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl p-2 shadow-2xl backdrop-blur-lg border border-white/40 z-50 bg-black/40"
                  onWheel={(e) => {
                    // Sempre impede a propagação do scroll para a página
                    e.stopPropagation();
                  }}
                >
                  <div
                    className="max-h-64 overflow-y-auto scrollbar-hide"
                    onWheel={(e) => {
                      // Impede propagação e comportamento padrão
                      e.stopPropagation();
                      e.preventDefault();

                      const element = e.currentTarget;
                      const { scrollTop, scrollHeight, clientHeight } = element;
                      const scrollAmount = e.deltaY;

                      // Calcular nova posição de scroll
                      const newScrollTop = scrollTop + scrollAmount;

                      // Aplicar scroll manual com limites
                      if (newScrollTop >= 0 && newScrollTop <= scrollHeight - clientHeight) {
                        element.scrollTop = newScrollTop;
                      } else if (newScrollTop < 0) {
                        element.scrollTop = 0;
                      } else {
                        element.scrollTop = scrollHeight - clientHeight;
                      }
                    }}
                  >
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => changeTheme(theme.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition-all duration-200 group"
                      >
                        {/* Preview do Tema */}
                        <div
                          className="w-6 h-6 rounded-full shadow-md ring-1 ring-white/20 flex-shrink-0"
                          style={{ background: theme.gradient }}
                        />

                        {/* Nome do Tema */}
                        <span className="text-white/90 text-sm font-medium flex-1 text-left group-hover:text-white transition-colors">
                          {theme.name}
                        </span>

                        {/* Indicador de Seleção */}
                        {currentTheme === theme.id && (
                          <Check size={14} className="text-green-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
