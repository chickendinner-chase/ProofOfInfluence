import {
  ImmortalityFlowStep,
  ImmortalityFlowContext,
  IMMORTALITY_FLOW_DEFINITION,
  ImmortalityFlowState
} from '@shared/immortality-flow';

export function handleImmortalityEvent(
  currentState: ImmortalityFlowState,
  event: Partial<ImmortalityFlowContext>
): ImmortalityFlowState {
  const nextContext = { ...currentState.context, ...event };
  const transitions = IMMORTALITY_FLOW_DEFINITION[currentState.currentStep];
  
  let nextStep = currentState.currentStep;

  for (const transition of transitions) {
    if (!transition.condition || transition.condition(nextContext)) {
      nextStep = transition.target;
      break;
    }
  }

  if (nextStep !== currentState.currentStep) {
      return {
          currentStep: nextStep,
          context: nextContext,
          history: [...currentState.history, currentState.currentStep]
      };
  }

  return {
      ...currentState,
      context: nextContext
  };
}

export function mapStepToReplyKey(step: ImmortalityFlowStep): string {
    switch (step) {
        case ImmortalityFlowStep.ENTRY:
            return 'immortality.flow.entry';
        case ImmortalityFlowStep.CONNECT_ACCOUNT:
            return 'immortality.flow.connect_account';
        case ImmortalityFlowStep.TRAINING_INIT:
            return 'immortality.flow.training_init';
        case ImmortalityFlowStep.TRAINING_QUESTIONS:
            return 'immortality.flow.training_questions';
        case ImmortalityFlowStep.MINT_BADGE:
            return 'immortality.flow.mint_badge';
        case ImmortalityFlowStep.RWA_UNLOCK:
            return 'immortality.flow.rwa_unlock';
        case ImmortalityFlowStep.COMPLETED:
            return 'immortality.flow.completed';
        default:
            return 'immortality.flow.default';
    }
}
