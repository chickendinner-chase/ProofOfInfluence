const WETH_MAINNET = "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2";
const USDC_MAINNET = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

export const UNISWAP_V3_WETH_USDC_POOL = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8";

export interface UniswapQuoteResponse {
  quoteId: string;
  quote: string;
  guaranteedQuote?: string;
  route?: unknown;
  gasUseEstimateUSD?: string;
  gasUseEstimateQuote?: string;
  gasPriceWei?: string;
  gasUseEstimate?: string;
  methodParameters?: {
    calldata: string;
    value: string;
    to?: string;
  };
  calldata?: string;
  value?: string;
  to?: string;
  simulationStatus?: string;
  blockNumber?: string;
  amount?: string;
  quoteDecimals?: string;
  tokenIn?: string;
  tokenOut?: string;
  portionAmount?: string;
  portionBips?: string;
}

export interface QuoteSummary {
  quote: UniswapQuoteResponse;
  amountInWei: string;
  amountOutDecimals: number;
  amountOut: string;
}

export function formatUnits(value: string, decimals: number): string {
  const negative = value.startsWith("-");
  const raw = negative ? value.slice(1) : value;
  const padded = raw.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  let fraction = padded.slice(-decimals);
  fraction = fraction.replace(/0+$/, "");
  const formatted = fraction ? `${whole}.${fraction}` : whole;
  return negative ? `-${formatted}` : formatted;
}

export function parseUnits(value: string, decimals: number): string {
  const normalizedValue = value.trim();
  if (!/^\d*(\.\d*)?$/.test(normalizedValue)) {
    throw new Error("Invalid number format");
  }
  const [wholePartRaw, fractionPartRaw = ""] = normalizedValue.split(".");
  const wholePart = wholePartRaw === "" ? "0" : wholePartRaw;
  const fractionPart = fractionPartRaw;
  const normalizedFraction = (fractionPart + "0".repeat(decimals)).slice(0, decimals);
  const base = tenPow(decimals);
  const combined = BigInt(wholePart) * base + BigInt(normalizedFraction || "0");
  return combined.toString();
}

function tenPow(exponent: number): bigint {
  let result = BigInt(1);
  const ten = BigInt(10);
  for (let i = 0; i < exponent; i += 1) {
    result *= ten;
  }
  return result;
}

export async function fetchEthUsdcQuote(amountInEth: string, signal?: AbortSignal): Promise<QuoteSummary> {
  const amountWei = parseUnits(amountInEth, 18);
  const url = new URL("https://api.uniswap.org/v1/quote");
  url.searchParams.set("protocols", "v3");
  url.searchParams.set("tokenIn", WETH_MAINNET);
  url.searchParams.set("tokenOut", USDC_MAINNET);
  url.searchParams.set("amount", amountWei);
  url.searchParams.set("type", "exactInput");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quote from Uniswap");
  }

  const data = (await response.json()) as UniswapQuoteResponse;
  const amountOut = data.quote || "0";
  return {
    quote: data,
    amountInWei: amountWei,
    amountOut,
    amountOutDecimals: 6,
  };
}

export function extractTransactionParams(quote: UniswapQuoteResponse): {
  to: string;
  value: string;
  data: string;
} {
  if (quote.methodParameters) {
    const toAddress = quote.methodParameters.to || quote.to;
    if (!toAddress) {
      throw new Error("Missing recipient for Uniswap transaction");
    }
    return {
      to: toAddress,
      value: quote.methodParameters.value,
      data: quote.methodParameters.calldata,
    };
  }

  if (!quote.to || !quote.calldata || quote.value === undefined) {
    throw new Error("Incomplete Uniswap quote response");
  }

  return {
    to: quote.to,
    value: quote.value,
    data: quote.calldata,
  };
}

export const WETH_ADDRESS = WETH_MAINNET;
export const USDC_ADDRESS = USDC_MAINNET;
