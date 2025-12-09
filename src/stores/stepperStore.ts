/**
 * Store de Zustand para el estado del stepper
 * Equivalente a: StepperStateService de Angular
 */

import { create } from 'zustand';
import type {
  StepConfig,
  StepState,
  ImpugnacionData
} from '../types/impugnacion.types';

interface StepperStore {
  // Estado
  currentStep: number;
  stepConfigs: StepConfig[];
  formData: ImpugnacionData;
  stepStates: StepState[];

  // Computed (derivados)
  totalSteps: () => number;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  isCompleted: () => boolean;
  progress: () => number;

  // Acciones
  setCurrentStep: (index: number) => void;
  nextStep: () => boolean;
  prevStep: () => boolean;
  addStep: (stepConfig: StepConfig, insertAtIndex?: number) => void;
  removeStep: (stepId: string) => void;
  updateStepConfig: (stepId: string, updates: Partial<StepConfig>) => void;
  setStepConfigs: (newConfigs: StepConfig[]) => void;
  updateStepData: (stepIndex: number, data: unknown, isValid?: boolean) => void;
  updateFormData: (partialData: Partial<ImpugnacionData>) => void;
  markStepAsValid: (stepIndex: number, isValid?: boolean) => void;
  markStepAsVisited: (stepIndex: number) => void;
  getStepState: (stepIndex: number) => StepState | undefined;
  getStepData: (stepIndex: number) => unknown;
  isStepValid: (stepIndex: number) => boolean;
  isStepVisited: (stepIndex: number) => boolean;
  goToStep: (stepIndex: number) => boolean;
  getMaxAccessibleStep: () => number;
  getStepConfigs: () => StepConfig[];
  getStepConfig: (stepIndex: number) => StepConfig | undefined;
  reset: () => void;
}

const initializeSteps = (configs: StepConfig[]): StepState[] => {
  return configs.map((config, index) => ({
    index,
    id: config.id,
    isValid: index === 0,
    isVisited: index === 0,
    isRequired: config.required,
    data: undefined,
    config
  }));
};

export const useStepperStore = create<StepperStore>((set, get) => ({
  // Estado inicial
  currentStep: 0,
  stepConfigs: [],
  formData: {},
  stepStates: [],

  // Computed values
  totalSteps: () => get().stepConfigs.length,

  isFirstStep: () => get().currentStep === 0,

  isLastStep: () => get().currentStep === get().totalSteps() - 1,

  canGoNext: () => {
    const { currentStep, stepStates } = get();
    const total = get().totalSteps();
    return currentStep < total - 1 && (stepStates[currentStep]?.isValid ?? false);
  },

  canGoPrev: () => get().currentStep > 0,

  isCompleted: () => get().stepStates.every((step) => step.isValid),

  progress: () => {
    const { stepStates } = get();
    const total = get().totalSteps();
    const validSteps = stepStates.filter((step) => step.isValid).length;
    return total > 0 ? Math.round((validSteps / total) * 100) : 0;
  },

  // Acciones
  setCurrentStep: (index: number) => {
    const total = get().totalSteps();
    if (index >= 0 && index < total) {
      set({ currentStep: index });
      get().markStepAsVisited(index);
    }
  },

  nextStep: () => {
    if (get().canGoNext()) {
      get().setCurrentStep(get().currentStep + 1);
      return true;
    }
    return false;
  },

  prevStep: () => {
    if (get().canGoPrev()) {
      get().setCurrentStep(get().currentStep - 1);
      return true;
    }
    return false;
  },

  addStep: (stepConfig: StepConfig, insertAtIndex?: number) => {
    const currentConfigs = [...get().stepConfigs];
    if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= currentConfigs.length) {
      currentConfigs.splice(insertAtIndex, 0, stepConfig);
    } else {
      currentConfigs.push(stepConfig);
    }
    set({ stepConfigs: currentConfigs });
    set({ stepStates: initializeSteps(currentConfigs) });
  },

  removeStep: (stepId: string) => {
    const currentConfigs = get().stepConfigs.filter((config) => config.id !== stepId);
    set({ stepConfigs: currentConfigs });
    set({ stepStates: initializeSteps(currentConfigs) });
  },

  updateStepConfig: (stepId: string, updates: Partial<StepConfig>) => {
    const currentConfigs = get().stepConfigs.map((config) =>
      config.id === stepId ? { ...config, ...updates } : config
    );
    set({ stepConfigs: currentConfigs });
    set({ stepStates: initializeSteps(currentConfigs) });
  },

  setStepConfigs: (newConfigs: StepConfig[]) => {
    set({
      stepConfigs: newConfigs,
      stepStates: initializeSteps(newConfigs)
    });
  },

  updateStepData: (stepIndex: number, data: unknown, isValid: boolean = true) => {
    const currentSteps = [...get().stepStates];
    if (currentSteps[stepIndex]) {
      currentSteps[stepIndex] = {
        ...currentSteps[stepIndex],
        data,
        isValid,
        isVisited: true
      };
      set({ stepStates: currentSteps });
    }

    // Actualizar formData
    const currentFormData = { ...get().formData };
    (currentFormData as Record<string, unknown>)[`step${stepIndex}`] = data;
    set({ formData: currentFormData });
  },

  updateFormData: (partialData: Partial<ImpugnacionData>) => {
    const currentData = { ...get().formData };
    set({ formData: { ...currentData, ...partialData } });
  },

  markStepAsValid: (stepIndex: number, isValid: boolean = true) => {
    const currentSteps = [...get().stepStates];
    if (currentSteps[stepIndex]) {
      currentSteps[stepIndex] = {
        ...currentSteps[stepIndex],
        isValid
      };
      set({ stepStates: currentSteps });
    }
  },

  markStepAsVisited: (stepIndex: number) => {
    const currentSteps = [...get().stepStates];
    if (currentSteps[stepIndex]) {
      currentSteps[stepIndex] = {
        ...currentSteps[stepIndex],
        isVisited: true
      };
      set({ stepStates: currentSteps });
    }
  },

  getStepState: (stepIndex: number) => get().stepStates[stepIndex],

  getStepData: (stepIndex: number) => get().stepStates[stepIndex]?.data,

  isStepValid: (stepIndex: number) => get().stepStates[stepIndex]?.isValid ?? false,

  isStepVisited: (stepIndex: number) => get().stepStates[stepIndex]?.isVisited ?? false,

  goToStep: (stepIndex: number) => {
    const { stepStates } = get();
    const targetStep = stepStates[stepIndex];
    if (targetStep && (targetStep.isVisited || stepIndex <= get().getMaxAccessibleStep())) {
      get().setCurrentStep(stepIndex);
      return true;
    }
    return false;
  },

  getMaxAccessibleStep: () => {
    const { stepStates } = get();
    const total = get().totalSteps();
    let maxStep = 0;
    for (let i = 0; i < stepStates.length; i++) {
      if (stepStates[i].isValid) {
        maxStep = i + 1;
      } else {
        break;
      }
    }
    return Math.min(maxStep, total - 1);
  },

  getStepConfigs: () => get().stepConfigs,

  getStepConfig: (stepIndex: number) => get().stepConfigs[stepIndex],

  reset: () => {
    const configs = get().stepConfigs;
    set({
      currentStep: 0,
      formData: {},
      stepStates: initializeSteps(configs)
    });
  }
}));
