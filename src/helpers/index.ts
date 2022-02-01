// subtract (spend) points: Return changes in balances
export const getBalanceDifferences = (
  payerBalanceChanges: { [key: string]: number },
  payerBalances: { [key: string]: number }
) => {
  let arr = [];
  for (const [payer, points] of Object.entries(payerBalances)) {
    if (payerBalanceChanges[payer] === points) {
      delete payerBalanceChanges[payer];
    } else {
      arr.push({ payer: payer, points: points - payerBalanceChanges[payer] });
      payerBalanceChanges[payer] = points - payerBalanceChanges[payer];
    }
  }

  return arr;
};
