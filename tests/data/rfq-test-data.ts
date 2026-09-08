import { RfqFormData } from '../pages/RfqPage';

export const baseValidData: RfqFormData = {
  firstName: 'Ana',
  lastName: 'Gomez',
  email: 'ana.gomez@example.com',
  phone: '50588887777',
  company: 'Acme Logistics',
  industry: 'ecommerce',
  services: ['warehousing', 'transportation'],
  timeline: '1-3-months',
  volume: '10,000 units',
  details: 'We need support with warehousing and distribution of electronic products.',
};

export const validCombinations: RfqFormData[] = [
  { ...baseValidData },
  {
    ...baseValidData,
    industry: 'healthcare',
    services: ['manufacturing', 'supply-chain', 'technology'],
    timeline: 'immediate',
    volume: undefined,
  },
  {
    ...baseValidData,
    industry: 'other',
    services: ['value-added'],
    timeline: 'flexible',
  },
];

function withoutField<K extends keyof RfqFormData>(field: K): Partial<RfqFormData> {
  const { [field]: _omitted, ...rest } = baseValidData;
  return rest;
}

export interface InvalidCase {
  field: string;
  data: Partial<RfqFormData>;
}

// Validation messages are native to the browser (validationMessage) and vary
// across engines/locales, so these cases are verified with isFieldInvalid(field)
// instead of comparing exact text.
export const invalidCases: InvalidCase[] = [
  { field: 'firstName', data: { ...baseValidData, firstName: '' } },
  { field: 'lastName', data: { ...baseValidData, lastName: '' } },
  { field: 'email', data: { ...baseValidData, email: '' } },
  { field: 'email', data: { ...baseValidData, email: 'invalid-email' } },
  { field: 'phone', data: { ...baseValidData, phone: '' } },
  { field: 'company', data: { ...baseValidData, company: '' } },
  { field: 'details', data: { ...baseValidData, details: '' } },
  { field: 'industry', data: withoutField('industry') },
  { field: 'timeline', data: withoutField('timeline') },
];
