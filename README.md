# PelletiQ MVP

MVP visual para controle de parâmetros do peletizado.

A aplicação lê um arquivo `.xlsx` no navegador e compara somente os parâmetros definidos abaixo. Não há inferência, previsão, score oculto, IA ou correlação automática.

## Regras técnicas cadastradas

| Parâmetro | Regra |
|---|---|
| Temperatura da matriz | 55°C a 65°C |
| Temperatura do resfriador | abaixo de 35°C |
| Dureza | 3.5kgF a 4kgF |
| Comprimento | menor que 7 |
| Diâmetro | menor que 4 |

## Estrutura esperada do XLSX

A primeira aba da planilha deve conter, preferencialmente, estas colunas:

- DATA
- HORA
- PRODUTO
- OP
- UMIDADE DO COMPOSTO%
- UMIDADE DA MASSA%
- UMIDADE DO PELLET%
- TEMPERATURA MATRIZ C°
- TEMPERATURA RESFRIADOR C°
- DENSIDADE
- DUREZA kgf
- COMPRIMENTO < 7
- DIÂMETRO < 4

A aplicação usa os horários que existem na planilha. Não cria horários de aferição.

## Rodar localmente

```bash
npm install
npm run dev
```

Depois acesse:

```bash
http://localhost:3000
```

## Build local

```bash
npm run build
npm run start
```

## Subir no GitHub

```bash
git init
git add .
git commit -m "feat: MVP controle parametros peletizado"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/pelletiq-mvp.git
git push -u origin main
```

## Deploy na Vercel

1. Crie um repositório no GitHub.
2. Suba este projeto.
3. Acesse a Vercel.
4. Clique em **Add New Project**.
5. Selecione o repositório.
6. Framework detectado: **Next.js**.
7. Clique em **Deploy**.

Não precisa configurar variável de ambiente para este MVP.

## Próximos passos recomendados

- Salvar histórico em Supabase.
- Criar cadastro editável de regras.
- Adicionar filtros por produto, OP e data.
- Criar exportação dos desvios.


## Correção de build Vercel

Este pacote usa Next.js 14.2.35 e importa `xlsx` dinamicamente no navegador para evitar problemas de build/bundle na Vercel.

