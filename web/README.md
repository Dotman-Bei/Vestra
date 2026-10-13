# Vestra web app

Next.js 16 app for Vestra. See the [project README](../README.md) for architecture, setup and deployment, and [docs/FRONTEND.md](../docs/FRONTEND.md) for the design spec.

```bash
npm install
npm run dev        # demo mode with labeled example data, http://localhost:3000
npm run abi        # regenerate lib/chain/abi.ts after changing the contract (run forge build first)
```

Every environment variable is listed with notes in [.env.example](.env.example).
