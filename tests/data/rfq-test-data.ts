import { RfqFormData } from '../pages/RfqPage';

export const datosBaseValidos: RfqFormData = {
  firstName: 'Ana',
  lastName: 'Gómez',
  email: 'ana.gomez@example.com',
  phone: '50588887777',
  company: 'Acme Logistics',
  industry: 'ecommerce',
  services: ['warehousing', 'transportation'],
  timeline: '1-3-months',
  volume: '10,000 units',
  details: 'Necesitamos soporte para almacenamiento y distribución de productos electrónicos.',
};

export const combinacionesValidas: RfqFormData[] = [
  { ...datosBaseValidos },
  {
    ...datosBaseValidos,
    industry: 'healthcare',
    services: ['manufacturing', 'supply-chain', 'technology'],
    timeline: 'immediate',
    volume: undefined,
  },
  {
    ...datosBaseValidos,
    industry: 'other',
    services: ['value-added'],
    timeline: 'flexible',
  },
];

function sinCampo<K extends keyof RfqFormData>(campo: K): Partial<RfqFormData> {
  const { [campo]: _omitido, ...resto } = datosBaseValidos;
  return resto;
}

export interface CasoInvalido {
  campo: string;
  data: Partial<RfqFormData>;
}

// Los mensajes de validación son nativos del navegador (validationMessage) y varían
// entre motores/idiomas, por eso estos casos se verifican con isFieldInvalid(campo),
// no comparando texto exacto.
export const casosInvalidos: CasoInvalido[] = [
  { campo: 'firstName', data: { ...datosBaseValidos, firstName: '' } },
  { campo: 'lastName', data: { ...datosBaseValidos, lastName: '' } },
  { campo: 'email', data: { ...datosBaseValidos, email: '' } },
  { campo: 'email', data: { ...datosBaseValidos, email: 'correo-invalido' } },
  { campo: 'phone', data: { ...datosBaseValidos, phone: '' } },
  { campo: 'company', data: { ...datosBaseValidos, company: '' } },
  { campo: 'details', data: { ...datosBaseValidos, details: '' } },
  { campo: 'industry', data: sinCampo('industry') },
  { campo: 'timeline', data: sinCampo('timeline') },
];
