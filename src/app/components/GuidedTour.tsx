import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// Interface para definir cada passo do tour
interface TourStep {
  targetId: string; // O ID HTML do elemento a ser destacado (ex: 'btn-save')
  title: string;
  content: string;
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void; // Callback para quando o tour terminar
  active?: boolean; // Controla se o tour está rodando
}

export function GuidedTour({ steps, onComplete, active = false }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});
  const spotlightRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  // Função Sênior: Calcula a posição exata do elemento e ajusta o spotlight e a flag
  const updatePosition = useCallback(() => {
    if (!active || !currentStep) return;

    const targetElement = document.getElementById(currentStep.targetId);
    if (!targetElement) {
      console.warn(`GuidedTour: Elemento com ID '${currentStep.targetId}' não encontrado.`);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = 8; // Espaço extra ao redor do elemento destacado

    // 1. Posiciona o Spotlight (o "furo")
    setSpotlightStyle({
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
    });

    // 2. Posiciona a Flag (Tooltip) em relação ao spotlight
    // Vamos colocar sempre ABAIXO do elemento por padrão para simplificar,
    // mas uma lógica sênior real calcularia se há espaço acima/lados.
    setTooltipStyle({
      top: `${rect.bottom + padding + 16}px`, // 16px de respiro
      left: `${rect.left + rect.width / 2}px`, // Centralizado horizontalmente
    });
  }, [active, currentStep]);

  // Efeito para atualizar a posição quando o passo muda ou a janela é redimensionada
  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition); // Importante para scroll

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  // Navegação
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tour finalizado
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!active || !currentStep) return null;

  return (
    // O Overlay escuro e embaçado (z-index altíssimo)
    <div className="fixed inset-0 z-[9998] overflow-hidden backdrop-blur-[2px]">
      
      {/* O SPOTLIGHT: O "furo" mágico */}
      {/* A MÁGICA SENIOR:
        - shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] -> Cria uma sombra preta de 9999px de raio!
        - Isso preenche a tela inteira com preto, exceto a área da div.
        - O pointer-events-none garante que o usuário ainda possa clicar no elemento destacado.
      */}
      <div
        ref={spotlightRef}
        style={spotlightStyle}
        className="absolute z-[9998] rounded-md shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] transition-all duration-300 ease-in-out pointer-events-none"
      />

      {/* A FLAG (Tooltip) */}
      <div
        style={tooltipStyle}
        className="absolute z-[9999] w-72 -translate-x-1/2 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 transition-all duration-300 ease-in-out"
      >
        <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">
          {currentStep.title}
        </h3>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
          {currentStep.content}
        </p>
        
        <div className="mt-6 flex justify-between items-center gap-2">
          {currentStepIndex > 0 ? (
            <button 
              onClick={handlePrev}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Voltar
            </button>
          ) : (
            <div /> // Espaçador para alinhar o botão "Próximo" à direita
          )}
          
          <button
            onClick={handleNext}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors active:scale-95"
          >
            {currentStepIndex === steps.length - 1 ? "Finalizar Tour" : "Entendi, Próximo"}
          </button>
        </div>

        {/* Setinha customizada (apontando para cima) */}
        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white border-l border-t border-slate-200" />
      </div>
    </div>
  );
}