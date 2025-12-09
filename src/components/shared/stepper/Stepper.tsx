/**
 * Componente Stepper - Wizard de pasos
 * Equivalente a: stepper.component.ts de Angular
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStepperStore } from '../../../stores/stepperStore';
import './Stepper.scss';

interface StepperProps {
  onStepClick?: (index: number) => void;
  showProgress?: boolean;
  showTitle?: boolean;
}

const Stepper = ({ onStepClick, showProgress = false, showTitle = true }: StepperProps) => {
  const {
    currentStep,
    stepConfigs,
    goToStep
  } = useStepperStore();

  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stepperRef = useRef<HTMLDivElement>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const [titleExpanded, setTitleExpanded] = useState(true);

  // Calcular posiciones del rail de progreso
  const calculateProgressWidth = useCallback(() => {
    if (currentStep === 0 || dotsRef.current.length === 0) {
      setProgressWidth(0);
      return;
    }

    const firstDot = dotsRef.current[0];
    const currentDot = dotsRef.current[currentStep];

    if (firstDot && currentDot) {
      const firstRect = firstDot.getBoundingClientRect();
      const currentRect = currentDot.getBoundingClientRect();
      const firstCenter = firstRect.left + firstRect.width / 2;
      const currentCenter = currentRect.left + currentRect.width / 2;
      const distance = currentCenter - firstCenter + 16; // Ajuste fino
      setProgressWidth(Math.max(0, distance));
    }
  }, [currentStep]);

  // Calcular posiciones cuando cambia el paso o se redimensiona
  useEffect(() => {
    calculateProgressWidth();

    const handleResize = () => {
      setTimeout(calculateProgressWidth, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, stepConfigs, calculateProgressWidth]);

  // Auto-colapso del título en mobile después de 3 segundos
  useEffect(() => {
    setTitleExpanded(true);
    const timeout = setTimeout(() => {
      if (window.innerWidth < 768) {
        setTitleExpanded(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [currentStep]);

  const handleStepClick = (index: number) => {
    if (goToStep(index)) {
      onStepClick?.(index);
    }
  };

  const isDone = (index: number) => index < currentStep;
  const isCurrent = (index: number) => index === currentStep;
  const isDisabled = (index: number) => index > currentStep;

  const getStepClass = (index: number) => {
    if (isDone(index)) return 'step step--done';
    if (isCurrent(index)) return 'step step--current';
    if (isDisabled(index)) return 'step step--disabled';
    return 'step';
  };

  // Calcular qué grupo de pasos mostrar en mobile (0-2 o 3-5)
  const mobileStepGroup = Math.floor(currentStep / 3);

  // Obtener el paso actual
  const currentStepConfig = stepConfigs[currentStep];

  return (
    <>
      {/* Stepper horizontal */}
      <div className="stepper-wrapper" role="navigation" aria-label="Navegación de pasos del formulario">
        <div
          ref={stepperRef}
          className="stepper position-relative"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={stepConfigs.length}
          aria-valuenow={currentStep + 1}
          data-step-group={mobileStepGroup}
        >
          {/* Línea base y progreso */}
          <div className="rail"></div>
          <div
            className="rail rail--progress"
            style={{ width: `${progressWidth}px` }}
          ></div>

          {/* Pasos */}
          <ul className="steps" data-step-group={mobileStepGroup}>
            {stepConfigs.map((config, index) => (
              <li
                key={config.id}
                className={getStepClass(index)}
                aria-current={isCurrent(index) ? 'step' : undefined}
              >
                {/* Punto del stepper */}
                <div
                  ref={(el) => { dotsRef.current[index] = el; }}
                  className="dot"
                  onClick={() => !isDisabled(index) && handleStepClick(index)}
                  role="button"
                  tabIndex={isDisabled(index) ? -1 : 0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled(index)) {
                      e.preventDefault();
                      handleStepClick(index);
                    }
                  }}
                >
                  <span className="inner"></span>
                  <svg
                    className="check"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </div>

                <div className="space-my-0300"></div>
                <div className="caption">{config.label}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Título del paso actual */}
      {showTitle && currentStepConfig && (
        <div className="stepper-title-container position-relative mt-3">
          <div className={`step-title-box bg-secundario text-white p-3 rounded-3 ${!titleExpanded ? 'collapsed' : ''}`}>
            <div className="d-flex align-items-center justify-content-center">
              <h6 className="step-title mb-0 text-white fw-bold">
                {currentStepConfig.description || 'Sin título'}
              </h6>
            </div>
          </div>
        </div>
      )}

      {/* Barra de progreso (opcional) */}
      {showProgress && (
        <div className="stepper-progress-bar mt-3">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / stepConfigs.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {Math.round(((currentStep + 1) / stepConfigs.length) * 100)}% completado
          </span>
        </div>
      )}
    </>
  );
};

export default Stepper;
