# Shipping backend

## Important

Make sure to have Docker installed.

If you cloned this repository first, you need to go to the frontend repository and follow the instructions in the README file. Following this order is very important.

## How to run

You can run the backend locally using the Fastity development server or orchestrating all the services. I recommend the orchestration.

### Orchestration

#### Environment configuration

Duplicate the `.env.example` file, rename it to `.env` and fill in the values using the values below (Just copy them):

```bash
# PostgreSQL
DB_HOST=shipping-db-prod
DB_USER=user
DB_PASSWORD=password
DB_NAME=shipping

# Redis
REDIS_HOST=shipping-redis-prod

# JWT
JWT_SECRET=6d568f7ddf09127623855f7c4458e632a24397041310993eb36767807b8c8e5d
JWT_EXPIRES_IN=1h
```

#### Orchestrate services

Run the following command to set up the services:

```bash
pnpm docker:prod
```

This will setup the frontend (Image created from frontend repository) and the backend services. You can check:

- Frontend at `http:127.0.0.1:8081`
- Backend at `http:127.0.0.1:8080`
- Endpoints docs at `http:127.0.0.1:8080/documentation`.

Run the following command to stop the services:

```bash
pnpm docker:prod:down
```

If you want, you can rebuild the services:

```bash
pnpm docker:prod:rebuild
```

This will build the backend and delete the associated volumes. The PostgreSQL and Redis will be cleaned.

### Run locally

#### Environment configuration

Duplicate the `.env.example` file, rename it to `.env.dev` and fill in the values using the values below (Just copy them):

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=shipping

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=6d568f7ddf09127623855f7c4458e632a24397041310993eb36767807b8c8e5d
JWT_EXPIRES_IN=1h
```

#### Orchestrate development services

Run the following command to set up the services:

```bash
pnpm docker:dev
```

This will setup the backend services.

Run the following command to stop the services:

```bash
pnpm docker:dev:down
```

If you want, you can rebuild the services:

```bash
pnpm docker:dev:rebuild
```

This will build the backend and delete the associated volumes. The PostgreSQL and Redis will be cleaned.

Finally run the following commands to run the backend locally:

```bash
pnpm install -- Ignore this if you already ran it
pnpm dev
```

You can check:

- Backend at `http:127.0.0.1:3000`
- Endpoints docs at `http:127.0.0.1:3000/documentation`.
