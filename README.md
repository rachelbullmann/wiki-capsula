# Radar do Dragão — Capsule Corp. (Wiki Cápsula)

Sistema de Mapeamento, Grafo de Conceitos e Anotações em Markdown.
Acessivel em: https://rachelbullmann.github.io/wiki-capsula/
---

## O que é o Radar do Dragão?

Ja se sentiu perdido tentando encontra as esferas, digo, as suas anotações?
Eu tive esse problema e resolvi criar de forma online algo que eu pudesse consultar da forma como eu me entendo. Assim surgiu a wiki Radar do Dragão. Ja tem algumas notas ali, mas ela salva no localstorage do seu navegador, voce pode apagar e começar suas anotaçoes do seu jeito. 
Código aberto, pode copiar e remodelar, me marca pra eu ver o que você fez de novo. 

## Como publicar este projeto no GitHub Pages

Este ambiente já foi pré-configurado com as melhores práticas para publicação no **GitHub Pages** (com suporte a base relativa, script de build estático e suporte a GitHub Actions).

Você pode publicar o seu aplicativo no GitHub Pages usando **qualquer um dos dois métodos abaixo**:

---

### Método 1: Implantação Automática com GitHub Actions (Recomendado)

1. **Baixe ou faça Export para o GitHub**:
   - Baixe os arquivos do projeto (ZIP ou faça o push direto para o seu repositório no GitHub).
2. **Envie os arquivos para o repositório no GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Radar do Dragão"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. **Ative o GitHub Actions no GitHub**:
   - Acesse o repositório no GitHub.
   - Vá em **Settings** > **Pages**.
   - Em **Build and deployment** > **Source**, altere para **GitHub Actions**.
4. **Pronto!** O GitHub Actions irá rodar o workflow `.github/workflows/deploy.yml` automaticamente e disponibilizar o link do seu site.

---

### Método 2: Implantação Manual via Terminal (`gh-pages`)

1. No terminal da sua máquina, certifique-se de estar na pasta do projeto.
2. Execute o comando:
   ```bash
   npm run deploy
   ```
3. O script irá compilar o projeto para a pasta `dist/` e publicar na branch `gh-pages`.
4. No GitHub, vá em **Settings** > **Pages** e confirme se o repositório está servindo a partir da branch `gh-pages`.

---

## Comandos Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento local.
- `npm run build:pages`: Compila os arquivos estáticos para a pasta `dist/` (utilizado pelo GitHub Pages).
- `npm run deploy`: Compila e envia o build estático para o branch `gh-pages`.
- `npm run build`: Compila a versão completa (cliente + servidor backend Node.js se necessário).

---

## 📄 Licença
This repository is open-source and distributed under the MIT License.
