const ETH_DECIMALS = 18;
const ETH_SCALE = 10n ** BigInt(ETH_DECIMALS);

export function ethToWei(value: string): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) {
    throw new Error(`Valor ETH inválido: ${value}`);
  }

  const [whole, fraction = ""] = value.split(".");

  return BigInt(whole) * ETH_SCALE + BigInt(fraction.padEnd(ETH_DECIMALS, "0"));
}

export function weiToEth(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;

  const whole = absolute / ETH_SCALE;
  const fraction = (absolute % ETH_SCALE)
    .toString()
    .padStart(ETH_DECIMALS, "0")
    .replace(/0+$/, "");

  const formatted = fraction ? `${whole}.${fraction}` : whole.toString();

  return negative ? `-${formatted}` : formatted;
}

export function multiplyEth(price: string, quantity: number): string {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new Error("Quantidade inválida.");
  }

  return weiToEth(ethToWei(price) * BigInt(quantity));
}

export function sumEth(values: string[]): string {
  return weiToEth(values.reduce((total, value) => total + ethToWei(value), 0n));
}
