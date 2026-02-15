# For Development

### To start the project

> .env

```
DATABASE_URL="draw-app from neondb --- or --- docker local database"
```

> package manager is `pnpm`

```sh
pnpm install # at root folder
cd .\packages\db 
pnpm dlx prisma migrate dev
pnpm dlx prisma generate # to generate the prismaClient.

pnpm dev
```