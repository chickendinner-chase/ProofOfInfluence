/**
 * Immortality Chat Action Handlers
 * Functions to execute actions triggered from chat messages
 */

export interface ActionResponse {
  success: boolean;
  txHash?: string;
  message: string;
}

/**
 * Execute activate-agent action
 */
export async function executeActivateAgent(): Promise<ActionResponse> {
  try {
    const response = await fetch("/api/immortality/activate-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "激活代理失败");
    }

    const data = await response.json();
    
    if (data.status === "error") {
      throw new Error(data.message || "激活代理失败");
    }

    return {
      success: true,
      txHash: data.txHash,
      message: data.message || "代理激活成功",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "激活代理失败",
    };
  }
}

/**
 * Execute upload-memory action
 */
export async function executeUploadMemory(memoryData: {
  text: string;
  emotion?: string;
}): Promise<ActionResponse> {
  try {
    const response = await fetch("/api/immortality/upload-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memoryData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "上传记忆失败");
    }

    const data = await response.json();
    
    if (data.status === "error") {
      throw new Error(data.message || "上传记忆失败");
    }

    return {
      success: true,
      txHash: data.txHash,
      message: data.message || "记忆上传成功",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "上传记忆失败",
    };
  }
}

/**
 * Execute mint-badge action
 */
export async function executeMintBadge(): Promise<ActionResponse> {
  try {
    const response = await fetch("/api/immortality/mint-badge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "铸造徽章失败");
    }

    const data = await response.json();
    
    if (data.status === "error") {
      throw new Error(data.message || "铸造徽章失败");
    }

    return {
      success: true,
      txHash: data.txHash,
      message: data.message || "徽章铸造成功",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "铸造徽章失败",
    };
  }
}
