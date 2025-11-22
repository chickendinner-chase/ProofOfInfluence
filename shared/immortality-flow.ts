export enum ImmortalityFlowStep {
  ENTRY = 'ENTRY',
  CONNECT_ACCOUNT = 'CONNECT_ACCOUNT',
  TRAINING_INIT = 'TRAINING_INIT',
  TRAINING_QUESTIONS = 'TRAINING_QUESTIONS',
  MINT_BADGE = 'MINT_BADGE',
  RWA_UNLOCK = 'RWA_UNLOCK',
  COMPLETED = 'COMPLETED'
}

export interface ImmortalityFlowContext {
  userId?: string;
  walletConnected: boolean;
  socialConnected: boolean;
  badgeMinted: boolean;
  questionsAnswered: number;
  rwaItemId?: string; // Selected RWA item ID
}

export interface ImmortalityFlowState {
  currentStep: ImmortalityFlowStep;
  context: ImmortalityFlowContext;
  history: string[]; // IDs of past steps
}

export interface FlowTransition {
  target: ImmortalityFlowStep;
  condition?: (context: ImmortalityFlowContext) => boolean;
}

export const IMMORTALITY_FLOW_DEFINITION: Record<ImmortalityFlowStep, FlowTransition[]> = {
  [ImmortalityFlowStep.ENTRY]: [
    { target: ImmortalityFlowStep.CONNECT_ACCOUNT, condition: (ctx) => !ctx.walletConnected }
  ],
  [ImmortalityFlowStep.CONNECT_ACCOUNT]: [
    { target: ImmortalityFlowStep.TRAINING_INIT, condition: (ctx) => ctx.walletConnected }
  ],
  [ImmortalityFlowStep.TRAINING_INIT]: [
    { target: ImmortalityFlowStep.TRAINING_QUESTIONS }
  ],
  [ImmortalityFlowStep.TRAINING_QUESTIONS]: [
    { target: ImmortalityFlowStep.MINT_BADGE, condition: (ctx) => ctx.questionsAnswered >= 3 }
  ],
  [ImmortalityFlowStep.MINT_BADGE]: [
    { target: ImmortalityFlowStep.RWA_UNLOCK, condition: (ctx) => ctx.badgeMinted }
  ],
  [ImmortalityFlowStep.RWA_UNLOCK]: [
    { target: ImmortalityFlowStep.COMPLETED }
  ],
  [ImmortalityFlowStep.COMPLETED]: []
};
