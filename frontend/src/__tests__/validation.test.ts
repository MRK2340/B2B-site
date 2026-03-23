import { validateEmail, validatePhone, calculateTotal } from '../utils/validation';

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('admin@i-whistle.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepts valid phone numbers', () => {
    expect(validatePhone('555-123-4567')).toBe(true);
    expect(validatePhone('(555) 123-4567')).toBe(true);
    expect(validatePhone('5551234')).toBe(true);
  });

  it('rejects phone numbers that are too short', () => {
    expect(validatePhone('12345')).toBe(false);
    expect(validatePhone('')).toBe(false);
    expect(validatePhone('abc')).toBe(false);
  });
});

describe('calculateTotal', () => {
  it('calculates annual total correctly', () => {
    // $8/user * 25 users * 12 months = $2400
    expect(calculateTotal('8', '25', 'annual', '0')).toBe('2400.00');
  });

  it('calculates seasonal total correctly', () => {
    // $8/user * 25 users * 4 months = $800
    expect(calculateTotal('8', '25', 'seasonal', '0')).toBe('800.00');
  });

  it('applies pilot discount correctly', () => {
    // $2400 * (1 - 0.15) = $2040
    expect(calculateTotal('8', '25', 'annual', '15')).toBe('2040.00');
  });

  it('handles empty/zero values gracefully', () => {
    expect(calculateTotal('', '', 'annual', '')).toBe('0.00');
    expect(calculateTotal('0', '25', 'annual', '0')).toBe('0.00');
  });

  it('handles 100% discount', () => {
    expect(calculateTotal('8', '25', 'annual', '100')).toBe('0.00');
  });
});
