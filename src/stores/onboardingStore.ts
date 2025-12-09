/**
 * Store de Zustand para onboarding/tours
 * Equivalente a: OnboardingService de Angular
 */

import { create } from 'zustand';
import type { OnboardingStep, OnboardingTour } from '../types/impugnacion.types';

interface OnboardingStore {
  // Estado
  isActive: boolean;
  currentTour: OnboardingTour | null;
  currentStepIndex: number;
  completedTours: Set<string>;
  tours: Map<string, OnboardingTour>;

  // Computed
  currentStep: () => OnboardingStep | null;
  totalSteps: () => number;
  hasNextStep: () => boolean;
  hasPrevStep: () => boolean;

  // Acciones
  registerTour: (tour: OnboardingTour) => void;
  startTour: (tourId: string) => boolean;
  nextStep: () => boolean;
  prevStep: () => boolean;
  skipTour: () => void;
  completeTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  resetTourProgress: (tourId: string) => void;
  resetAllTours: () => void;
}

const COMPLETED_TOURS_KEY = 'completed-onboarding-tours';

const loadCompletedTours = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = localStorage.getItem(COMPLETED_TOURS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

const saveCompletedTours = (tours: Set<string>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify([...tours]));
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  // Estado inicial
  isActive: false,
  currentTour: null,
  currentStepIndex: 0,
  completedTours: loadCompletedTours(),
  tours: new Map(),

  // Computed
  currentStep: () => {
    const { currentTour, currentStepIndex } = get();
    return currentTour?.steps[currentStepIndex] ?? null;
  },

  totalSteps: () => {
    const { currentTour } = get();
    return currentTour?.steps.length ?? 0;
  },

  hasNextStep: () => {
    const { currentStepIndex } = get();
    return currentStepIndex < get().totalSteps() - 1;
  },

  hasPrevStep: () => {
    const { currentStepIndex } = get();
    return currentStepIndex > 0;
  },

  // Acciones
  registerTour: (tour: OnboardingTour) => {
    const { tours } = get();
    const newTours = new Map(tours);
    newTours.set(tour.id, tour);
    set({ tours: newTours });
  },

  startTour: (tourId: string) => {
    const { tours, completedTours } = get();
    const tour = tours.get(tourId);

    if (!tour || completedTours.has(tourId)) {
      return false;
    }

    set({
      isActive: true,
      currentTour: tour,
      currentStepIndex: 0
    });
    return true;
  },

  nextStep: () => {
    if (!get().hasNextStep()) {
      get().completeTour();
      return false;
    }

    set((state) => ({
      currentStepIndex: state.currentStepIndex + 1
    }));
    return true;
  },

  prevStep: () => {
    if (!get().hasPrevStep()) {
      return false;
    }

    set((state) => ({
      currentStepIndex: state.currentStepIndex - 1
    }));
    return true;
  },

  skipTour: () => {
    const { currentTour, completedTours } = get();
    if (currentTour) {
      const newCompleted = new Set(completedTours);
      newCompleted.add(currentTour.id);
      saveCompletedTours(newCompleted);
      set({
        isActive: false,
        currentTour: null,
        currentStepIndex: 0,
        completedTours: newCompleted
      });
    }
  },

  completeTour: () => {
    const { currentTour, completedTours } = get();
    if (currentTour) {
      const newCompleted = new Set(completedTours);
      newCompleted.add(currentTour.id);
      saveCompletedTours(newCompleted);
      set({
        isActive: false,
        currentTour: null,
        currentStepIndex: 0,
        completedTours: newCompleted
      });
    }
  },

  isTourCompleted: (tourId: string) => {
    return get().completedTours.has(tourId);
  },

  resetTourProgress: (tourId: string) => {
    const { completedTours } = get();
    const newCompleted = new Set(completedTours);
    newCompleted.delete(tourId);
    saveCompletedTours(newCompleted);
    set({ completedTours: newCompleted });
  },

  resetAllTours: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COMPLETED_TOURS_KEY);
    }
    set({ completedTours: new Set() });
  }
}));
