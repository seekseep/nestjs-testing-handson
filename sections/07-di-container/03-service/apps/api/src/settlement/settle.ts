/** 清算の計算。DB も HTTP も使わない、ただの関数。 */

/** 立て替え 1 件のうち、計算に使うところ。 */
export type PaymentInput = {
  payerId: number;
  amount: number;
  participantIds: number[];
}

/** 一人の「払った額 − 負担する額」。プラスなら受け取り、マイナスなら払う。 */
export type Balance = {
  memberId: number;
  amount: number;
}

/** from の人が to の人に amount 円を払う。 */
export type Transfer = {
  from: number;
  to: number;
  amount: number;
}

/** amount 円を count 人で分ける。1 円単位で、余った 1 円は前の人から順に足す（合計は amount と同じ）。 */
export function split(amount: number, count: number): number[] {
  const base = Math.floor(amount / count);
  const rest = amount - base * count;
  return Array.from({ length: count }, (_, i) => (i < rest ? base + 1 : base));
}

/** 一人ずつの「払った額 − 負担する額」。ID の小さい順に並べる。 */
export function balances(payments: PaymentInput[]): Balance[] {
  const totals = new Map<number, number>();
  const add = (memberId: number, amount: number) =>
    totals.set(memberId, (totals.get(memberId) ?? 0) + amount);
  for (const payment of payments) {
    add(payment.payerId, payment.amount);
    const shares = split(payment.amount, payment.participantIds.length);
    payment.participantIds.forEach((memberId, i) => add(memberId, -shares[i]));
  }
  return [...totals]
    .map(([memberId, amount]) => ({ memberId, amount }))
    .sort((a, b) => a.memberId - b.memberId);
}

/**
 * 誰が誰にいくら払うか。いちばん多く払う人から、いちばん多く受け取る人へ払うことをくり返す。
 * 払う回数は、多くても「人数 − 1」回になる。
 */
export function settle(balances: Balance[]): Transfer[] {
  const payers = balances
    .filter((b) => b.amount < 0)
    .map((b) => ({ memberId: b.memberId, amount: -b.amount }));
  const receivers = balances
    .filter((b) => b.amount > 0)
    .map((b) => ({ ...b }));
  const transfers: Transfer[] = [];
  while (payers.length > 0 && receivers.length > 0) {
    payers.sort((a, b) => b.amount - a.amount);
    receivers.sort((a, b) => b.amount - a.amount);
    const payer = payers[0];
    const receiver = receivers[0];
    const amount = Math.min(payer.amount, receiver.amount);
    transfers.push({ from: payer.memberId, to: receiver.memberId, amount });
    payer.amount -= amount;
    receiver.amount -= amount;
    if (payer.amount === 0) payers.shift();
    if (receiver.amount === 0) receivers.shift();
  }
  return transfers;
}
