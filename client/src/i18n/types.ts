export interface Messages {
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    confirm: string;
    connectWallet: string;
    disconnect: string;
    copy: string;
    copied: string;
    welcome: string;
    login: string;
    logout: string;
    profile: string;
    dashboard: string;
    settings: string;
    send: string;
    placeholder: {
      dash: string;
    };
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta_start: string;
      cta_whitepaper: string;
    };
    highlights: {
      immortality: string;
      tge: string;
      tge_desc: string;
    };
    why: {
      title: string;
      desc: string;
      card1_title: string;
      card1_desc: string;
      card2_title: string;
      card2_desc: string;
      card3_title: string;
      card3_desc: string;
    };
    rwa: {
      title: string;
      subtitle: string;
      card1_name: string;
      card1_roi: string;
      card2_name: string;
      card2_roi: string;
      card3_name: string;
      card3_roi: string;
    };
    how: {
      title: string;
      step1_title: string;
      step1_desc: string;
      step2_title: string;
      step2_desc: string;
      step3_title: string;
      step3_desc: string;
    };
    roadmap: {
      title: string;
      phase1: string;
      phase2: string;
      phase3: string;
      phase4: string;
    };
  };
  immortality: {
    title: string;
    subtitle: string;
    chat_placeholder: string;
    connect_wallet_prompt: string;
    badge_mint_prompt: string;
    credits: string;
    flow: {
      entry: string;
      connect_account: string;
      training_init: string;
      training_questions: string;
      mint_badge: string;
      rwa_unlock: string;
      completed: string;
      default: string;
    };
  };
  chat: {
    rwaTicker: {
      title: string;
      empty: string;
    };
  };
  rwa: {
    market: {
      title: string;
      subtitle: string;
      loading: string;
      empty: string;
    };
    type: {
      license: string;
      patent: string;
      land: string;
    };
    item: {
      field: {
        type: string;
        status: string;
        chain: string;
        minAllocation: string;
        expectedYield: string;
      };
      status: {
        preparing: string;
        open: string;
        closed: string;
      };
    };
  };
}
