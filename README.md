This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Running with Docker

`docker-compose.yml` builds the app via a multi-stage `Dockerfile` (using `next.config.ts`'s
`output: "standalone"`) into a slim runtime image. It defines its own network, named
`profile-ncc` (not the compose-default `<project>_default`), so other compose stacks on the same
host can join it explicitly if needed.

```bash
docker compose up -d --build
```

The app is reachable at `http://localhost:3000`. No `.env` file is required — this project has no
server-side environment variables.

## CI/CD (self-hosted runner)

`.github/workflows/deploy.yml` runs `docker compose up -d --build` on every push to `dev`, via a
GitHub Actions **self-hosted runner** — a runner process registered to this repo that runs on the
deploy server itself and polls GitHub for jobs (outbound connection only), so no public IP or
inbound SSH is needed on the server. See `ncclaboratory18/pc-ncc`'s
`docs/github-actions-self-hosted-runner.md` for the full setup walkthrough (registering the
runner, running it as a systemd service, common pitfalls) — the same pattern applies here.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
