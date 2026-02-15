# 🎙️ Rádio Vida - A Voz da Esperança

Este é um aplicativo moderno para estações de rádio, desenvolvido com **Next.js 15**, **Firebase** e **ShadCN UI**. O projeto foi concebido para oferecer uma experiência de streaming fluida, personalização em tempo real via painel administrativo e suporte completo a PWA (aplicativo instalável).

## ✨ Funcionalidades Principais

- **📻 Streaming em Tempo Real**: Player customizado com suporte a metadados (Tocando Agora), controle de volume e sincronização de estado.
- **🛠️ Painel Administrativo Robusto**:
  - Gestão de identidade (nome, slogan, logo/ícones).
  - Controle de **Modo de Manutenção**.
  - **Barra de Avisos Agendável**: Exiba comunicados com ícones, links e data de expiração automática.
  - **Grade de Programação**: Gerencie os horários e apresentadores em tempo real.
  - **Customização Visual**: Altere imagens do Hero, seção Sobre e cores do rodapé sem tocar no código.
- **📱 PWA (Progressive Web App)**: Instalável em Android e iOS, funcionando como um aplicativo nativo com ícone na tela inicial.
- **🌗 Temas Inteligentes**: Suporte a temas Claro, Escuro e Automático (baseado no sistema).
- **🚀 Performance & SEO**: Otimizado com Next.js App Router, fontes do Google e meta tags essenciais.

## 🚀 Tecnologias Utilizadas

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Autenticação**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/) (com persistência local)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: Tailwind Animate & Framer Motion (via ShadCN)

## 📦 Como Instalar

1. **Clonar o projeto**:
   ```bash
   git clone [url-do-repositorio]
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente**:
   Crie um arquivo `.env.local` na raiz e adicione suas chaves do Firebase (veja `src/firebase/config.ts` para referência).

4. **Rodar em desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🔐 Painel Administrativo

O acesso ao painel é restrito a usuários autenticados via Firebase Auth.
- **URL**: `/admin`
- **Login**: `/admin/login`

**Nota**: As regras de segurança do Firestore garantem que apenas administradores possam modificar as configurações globais e a grade de programação.

## 📱 Suporte PWA

Para instalar a rádio como um aplicativo:
- **No Android**: Abra o site no Chrome e clique em "Instalar Aplicativo".
- **No iOS (iPhone)**: Abra o site no Safari, clique no ícone de compartilhar e selecione "Adicionar à Tela de Início".

## 📄 Licença

Este projeto foi desenvolvido como um protótipo de alta fidelidade para estações de rádio. Sinta-se à vontade para expandir e personalizar.

---
*Transmitindo Esperança 24h.*