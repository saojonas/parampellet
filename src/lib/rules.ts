export type ParameterKey = 'matriz' | 'resfriador' | 'dureza' | 'comprimento' | 'diametro';

export type Reading = {
  data?: string;
  hora: string;
  produto?: string;
  op?: string;
  umidadeComposto?: number | null;
  umidadeMassa?: number | null;
  umidadePellet?: number | null;
  matriz: number | null;
  resfriador: number | null;
  densidade?: number | null;
  dureza: number | null;
  comprimento: number | null;
  diametro: number | null;
};

export type Rule = {
  key: ParameterKey;
  label: string;
  unit: string;
  ruleText: string;
  validate: (value: number | null) => boolean;
};

export const PARAMETER_RULES: Rule[] = [
  {
    key: 'matriz',
    label: 'Temperatura da matriz',
    unit: '°C',
    ruleText: '55°C a 65°C',
    validate: (value) => value !== null && value >= 55 && value <= 65,
  },
  {
    key: 'resfriador',
    label: 'Temperatura do resfriador',
    unit: '°C',
    ruleText: '< 35°C',
    validate: (value) => value !== null && value < 35,
  },
  {
    key: 'dureza',
    label: 'Dureza',
    unit: 'kgF',
    ruleText: '3.5kgF a 4kgF',
    validate: (value) => value !== null && value >= 3.5 && value <= 4,
  },
  {
    key: 'comprimento',
    label: 'Comprimento',
    unit: 'mm',
    ruleText: '< 7',
    validate: (value) => value !== null && value < 7,
  },
  {
    key: 'diametro',
    label: 'Diâmetro',
    unit: 'mm',
    ruleText: '< 4',
    validate: (value) => value !== null && value < 4,
  },
];

export const SAMPLE_READINGS: Reading[] = [
  {
    data: '07/05/2026',
    hora: '07:12',
    produto: 'COMPOSTO ORGÂNICO',
    op: '',
    umidadeComposto: 22,
    umidadeMassa: 22,
    umidadePellet: 18.31,
    matriz: 57,
    resfriador: 35,
    densidade: 23,
    dureza: 4.04,
    comprimento: 8.45,
    diametro: 4.45,
  },
  {
    data: '07/05/2026',
    hora: '09:00',
    produto: 'COMPOSTO ORGÂNICO',
    op: '',
    umidadeComposto: 23.16,
    umidadeMassa: 23.16,
    umidadePellet: 18.15,
    matriz: 58,
    resfriador: 33,
    densidade: 25,
    dureza: 4.09,
    comprimento: 9,
    diametro: 4.25,
  },
];

export function parameterIsOk(key: ParameterKey, value: number | null): boolean {
  const rule = PARAMETER_RULES.find((item) => item.key === key);
  return rule ? rule.validate(value) : true;
}

export function formatValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return String(value).replace('.', ',');
}
