/**
 * Immortality Chat Action execution functions
 */

export interface ActionResponse {
  success: boolean;
  message: string;
  txHash?: string;
}

/**
 * Check if user is authenticated before making API calls
 * This is a client-side check - backend will also enforce authentication
 */
function checkAuth(): { authenticated: boolean; error?: string } {
  // This is a basic check - the actual auth state should be checked in the component
  // This function is mainly for documentation and potential future use
  return { authenticated: true };
}

/**
 * Execute activate-agent action
 */
export async function executeActivateAgent(): Promise<ActionResponse> {
  try {
    const response = await fetch("/api/immortality/activate-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: "请先使用钱包登录后再执行此操作",
        };
      }
      const error = await response.json().catch(() => ({ message: "Network error" }));
      return {
        success: false,
        message: error.message || "激活代理失败",
      };
    }

    const data = await response.json();
    return {
      success: data.status === "success",
      message: data.message || "激活代理成功",
      txHash: data.txHash,
    };
  } catch (error: any) {
    console.error("[ImmortalityActions] Error executing activate-agent:", error);
    throw new Error(error.message || "网络错误，请稍后重试");
  }
}

/**
 * Execute upload-memory action
 */
export async function executeUploadMemory(data: {
  text: string;
  emotion?: string;
}): Promise<ActionResponse> {
  try {
    const response = await fetch("/api/immortality/upload-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        text: data.text,
        emotion: data.emotion,
      }),
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: "请先使用钱包登录后再执行此操作",
        };
      }
      const error = await response.json().catch(() => ({ message: "Network error" }));
      return {
        success: false,
        message: error.message || "上传记忆失败",
      };
    }

    const result = await response.json();
    return {
      success: result.status === "success",
      message: result.message || "上传记忆成功",
      txHash: result.txHash,
    };
  } catch (error: any) {
    console.error("[ImmortalityActions] Error executing upload-memory:", error);
    throw new Error(error.message || "网络错误，请稍后重试");
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
      credentials: "include",
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: "请先使用钱包登录后再执行此操作",
        };
      }
      const error = await response.json().catch(() => ({ message: "Network error" }));
      return {
        success: false,
        message: error.message || "铸造徽章失败",
      };
    }

    const data = await response.json();
    return {
      success: data.status === "success",
      message: data.message || "铸造徽章成功",
      txHash: data.txHash,
    };
  } catch (error: any) {
    console.error("[ImmortalityActions] Error executing mint-badge:", error);
    throw new Error(error.message || "网络错误，请稍后重试");
  }
}
