# Privlend

This project introduces a decentralized, privacy-preserving loan verification system that enables borrowers to prove their creditworthiness without revealing sensitive financial data. Borrower uploads financial data, sent directly to the TEE for secure processing. The TEE processes them, generates a credit score, and a ZKP ensures trustless verification. Lenders can confidently issue loans without ever seeing private borrower data. This approach enhances privacy, expands financial access, and creates a more inclusive DeFi lending ecosystem. 🚀

- [imbjdd/privlend-front](https://github.com/imbjdd/privlend-front) - Monorepo (Primary)
- [junaama/trifecta-sc](https://github.com/junaama/trifecta-sc) - Contracts (Make primary)
- [imbjdd/proxy-llm](https://github.com/imbjdd/proxy-llm) - Backend (Make primary)
- [imbjdd/privlend-zkfront](https://github.com/imbjdd/privlend-zkfront) - Frontend (Make primary)
- [imbjdd/privlend-llm](https://github.com/imbjdd/privlend-llm) - Backend (Make primary)

NETX.js app

## Project Overview

This application allows users to:
1. Upload PDF documents containing financial information
2. Extract text from these documents
3. Generate a credit score based on the extracted information using an AI model

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_OLLAMA_API_URL=http://your-ollama-server:5000/api/generate
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4765F058857Ea8471caC22FAaaBF2C6c1342417b
```

For the demo, we've deployed it on Arbitrum!

This environment variable points to the Ollama API server that processes the text and generates the credit score.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
