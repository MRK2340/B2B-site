export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone: string): boolean =>
  phone.replace(/\D/g, '').length >= 7;

export const calculateTotal = (
  perUserRate: string,
  numOfficials: string,
  termStructure: string,
  pilotDiscount: string
): string => {
  const rate = parseFloat(perUserRate) || 0;
  const officials = parseInt(numOfficials) || 0;
  const months = termStructure === 'annual' ? 12 : 4;
  const discount = parseFloat(pilotDiscount) || 0;
  return (rate * officials * months * (1 - discount / 100)).toFixed(2);
};
