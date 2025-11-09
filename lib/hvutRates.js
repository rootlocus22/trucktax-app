export const hvutRates = [
  {
    minWeight: 55000,
    maxWeight: 75000,
    baseTax: 100,
    perThousandOver: 22,
    description: "55,000 to 75,000 lbs",
  },
  {
    minWeight: 75001,
    maxWeight: 80000,
    flatTax: 550,
    description: "75,001 pounds or more",
  },
];

export const hvutMonths = [
  { label: "July", calendarMonth: 7, calendarYear: 2025 },
  { label: "August", calendarMonth: 8, calendarYear: 2025 },
  { label: "September", calendarMonth: 9, calendarYear: 2025 },
  { label: "October", calendarMonth: 10, calendarYear: 2025 },
  { label: "November", calendarMonth: 11, calendarYear: 2025 },
  { label: "December", calendarMonth: 12, calendarYear: 2025 },
  { label: "January", calendarMonth: 1, calendarYear: 2026 },
  { label: "February", calendarMonth: 2, calendarYear: 2026 },
  { label: "March", calendarMonth: 3, calendarYear: 2026 },
  { label: "April", calendarMonth: 4, calendarYear: 2026 },
  { label: "May", calendarMonth: 5, calendarYear: 2026 },
  { label: "June", calendarMonth: 6, calendarYear: 2026 },
];

export function getHvutAnnualTax(weight) {
  if (!weight || weight < 55000) {
    return 0;
  }

  if (weight >= 75001) {
    return 550;
  }

  const thousandOver = Math.ceil((weight - 55000) / 1000);
  const additionalTax = thousandOver * 22;
  return 100 + additionalTax;
}

export function getHvutProratedTax(weight, firstUseMonth) {
  const annualTax = getHvutAnnualTax(weight);
  if (!annualTax || !firstUseMonth) {
    return 0;
  }

  const monthIndex = hvutMonths.findIndex(
    (month) => month.label.toLowerCase() === firstUseMonth.toLowerCase(),
  );

  if (monthIndex === -1) {
    return annualTax;
  }

  const monthsInUse = 12 - monthIndex;
  return Math.ceil((annualTax / 12) * monthsInUse);
}

export function getHvutDueDate(firstUseMonth) {
  if (!firstUseMonth) {
    return null;
  }

  const monthInfo = hvutMonths.find(
    (month) => month.label.toLowerCase() === firstUseMonth.toLowerCase(),
  );

  if (!monthInfo) {
    return null;
  }

  const firstUseDate = new Date(
    monthInfo.calendarYear,
    monthInfo.calendarMonth - 1,
    1,
  );
  const dueDate = new Date(firstUseDate);
  dueDate.setMonth(dueDate.getMonth() + 2);
  dueDate.setDate(0);

  return dueDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
