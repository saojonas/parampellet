'use client';

import { useMemo, useState } from 'react';
import { parseXlsxFile } from '@/lib/xlsxParser';
import {
  formatValue,
  parameterIsOk,
  PARAMETER_RULES,
  SAMPLE_READINGS,
  type ParameterKey,
  type Reading,
} from '@/lib/rules';

export default function PelletIQDashboard() {
  const [readings, setReadings] = useState<Reading[]>(SAMPLE_READINGS);
  const [fileName, setFileName] = useState('Base demonstrativa carregada');
  const [error, setError] = useState('');

  const latestReading = readings.at(-1) ?? null;

  const evaluatedRules = useMemo(() => {
    return PARAMETER_RULES.map((rule) => {
      const value = latestReading ? latestReading[rule.key] : null;
      const ok = rule.validate(value);
      return {
        ...rule,
        value,
        ok,
        note: ok ? 'Dentro da regra definida' : 'Fora da regra definida',
      };
    });
  }, [latestReading]);

  const criticalCount = evaluatedRules.filter((item) => !item.ok).length;
  const okCount = evaluatedRules.filter((item) => item.ok).length;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError('');

    if (!file) return;

    try {
      const parsed = await parseXlsxFile(file);
      if (!parsed.length) {
        setError('Nenhuma leitura válida foi encontrada na planilha.');
        return;
      }

      setReadings(parsed);
      setFileName(file.name);
    } catch (err) {
      setError('Falha ao ler o arquivo XLSX. Confira se a primeira aba contém a tabela esperada.');
      console.error(err);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1220] text-white p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-cyan-300 text-xs font-bold uppercase tracking-[0.24em]">PelletiQ MVP</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
              Controle de Parâmetros — Peletizado
            </h1>
            <p className="text-slate-400 mt-2 max-w-3xl">
              Leitura visual baseada exclusivamente nas regras cadastradas. O restante é apenas visualização da tabela.
            </p>
          </div>

          <label className="cursor-pointer bg-cyan-500 hover:bg-cyan-400 transition px-4 py-3 rounded-xl text-sm font-bold text-slate-950 text-center">
            Carregar XLSX
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
          </label>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Arquivo em uso</p>
            <p className="font-semibold">{fileName}</p>
          </div>
          {latestReading && (
            <div className="text-sm text-slate-300 md:text-right">
              <p>Última leitura: <strong>{latestReading.hora || '-'}</strong></p>
              <p>Produto: <strong>{latestReading.produto || '-'}</strong></p>
            </div>
          )}
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/60 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Parâmetros avaliados" value="5" subtitle="Matriz, resfriador, dureza, comprimento e diâmetro" />
          <Card title="Dentro da regra" value={String(okCount)} subtitle="Conformes na última leitura" />
          <Card title="Pontos de atenção" value={String(criticalCount)} subtitle="Fora dos limites definidos" highlight={criticalCount > 0} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {evaluatedRules.map((item) => (
            <div
              key={item.key}
              className={`rounded-3xl border p-5 ${
                item.ok ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/60'
              }`}
            >
              <p className="text-slate-300 text-sm">{item.label}</p>
              <div className="mt-4 flex items-end gap-1">
                <h2 className="text-4xl font-black">{formatValue(item.value)}</h2>
                <span className="text-slate-400 mb-1">{item.unit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-4">Regra: {item.ruleText}</p>
              <p className={`text-sm font-semibold mt-3 ${item.ok ? 'text-emerald-300' : 'text-red-300'}`}>
                {item.note}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Leituras para visualização</h2>
              <p className="text-slate-400 text-sm mt-1">
                Sem horários inventados. A tabela usa apenas as leituras existentes no XLSX.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm border-separate border-spacing-y-2">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Hora</th>
                    <th className="text-left p-3">Produto</th>
                    <th className="text-left p-3">Matriz</th>
                    <th className="text-left p-3">Resfriador</th>
                    <th className="text-left p-3">Dureza</th>
                    <th className="text-left p-3">Comprimento</th>
                    <th className="text-left p-3">Diâmetro</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((row, index) => (
                    <tr key={`${row.hora}-${index}`} className="bg-slate-800/60">
                      <td className="p-3 rounded-l-2xl text-slate-300">{row.data || '-'}</td>
                      <td className="p-3 font-semibold">{row.hora || '-'}</td>
                      <td className="p-3 text-slate-300">{row.produto || '-'}</td>
                      <RuleCell ok={parameterIsOk('matriz', row.matriz)} value={`${formatValue(row.matriz)}°C`} />
                      <RuleCell ok={parameterIsOk('resfriador', row.resfriador)} value={`${formatValue(row.resfriador)}°C`} />
                      <RuleCell ok={parameterIsOk('dureza', row.dureza)} value={`${formatValue(row.dureza)}kgF`} />
                      <RuleCell ok={parameterIsOk('comprimento', row.comprimento)} value={formatValue(row.comprimento)} />
                      <RuleCell ok={parameterIsOk('diametro', row.diametro)} value={formatValue(row.diametro)} rounded />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold">Pontos de Atenção</h2>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              Gerados somente por violação das regras cadastradas na última leitura.
            </p>

            <div className="space-y-4">
              {evaluatedRules
                .filter((item) => !item.ok)
                .map((item) => (
                  <div key={item.key} className="border border-red-500/60 bg-red-500/10 rounded-2xl p-4">
                    <h3 className="font-bold text-red-300">{item.label}</h3>
                    <p className="text-sm text-slate-300 mt-2">
                      Valor atual: {formatValue(item.value)}{item.unit}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Regra definida: {item.ruleText}</p>
                  </div>
                ))}

              {criticalCount === 0 && (
                <div className="border border-emerald-500/50 bg-emerald-500/10 rounded-2xl p-4">
                  <h3 className="font-bold text-emerald-300">Sem desvios</h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Todos os parâmetros estão dentro das regras cadastradas.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value, subtitle, highlight = false }: { title: string; value: string; subtitle: string; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 ${highlight ? 'bg-red-500/10 border-red-500/60' : 'bg-slate-900 border-slate-800'}`}>
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-4xl font-black mt-3">{value}</h2>
      <p className="text-sm text-slate-500 mt-3">{subtitle}</p>
    </div>
  );
}

function RuleCell({ ok, value, rounded = false }: { ok: boolean; value: string; rounded?: boolean }) {
  return (
    <td className={`p-3 ${rounded ? 'rounded-r-2xl' : ''}`}>
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${ok ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/40'}`}>
        {value}
      </span>
    </td>
  );
}
