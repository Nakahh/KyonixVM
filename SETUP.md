# OCI Auto Provisioner - Setup & Deployment Guide

A production-ready platform for automated VM provisioning on Oracle Cloud Infrastructure with real-time monitoring, retry logic, and comprehensive logging.

## Prerequisites

- **Node.js**: 20.x or higher
- **pnpm**: 10.14.0 or higher
- **Docker & Docker Compose**: Latest versions (for containerized deployment)
- **PostgreSQL**: 16+ (if not using Docker)
- **Redis**: 7+ (if not using Docker)

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

Create a PostgreSQL database:

```bash
createdb oci_auto_provisioner
```

Or use Docker:

```bash
docker-compose up postgres
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your OCI credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/oci_auto_provisioner
REDIS_HOST=localhost
REDIS_PORT=6379

OCI_TENANCY_OCID=ocid1.tenancy.oc1...
OCI_USER_OCID=ocid1.user.oc1...
OCI_FINGERPRINT=your:fingerprint
OCI_PRIVATE_KEY_PATH=/path/to/private/key
OCI_REGION=sa-saopaulo-1
```

### 4. Initialize Database

```bash
pnpm run db:push
```

### 5. Start Development Server

```bash
pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- WebSocket: ws://localhost:3000

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Copy environment template
cp .env.example .env

# Build and start all services
docker-compose up -d

# Apply database migrations
docker-compose exec app pnpm run db:push

# Check logs
docker-compose logs -f app
```

### Services

- **app**: Main application (port 3000)
- **postgres**: Database (port 5432)
- **redis**: Cache/Queue (port 6379)
- **adminer**: Database UI (port 8080) - optional

### Stopping Services

```bash
docker-compose down

# Remove all data
docker-compose down -v
```

## Architecture

### Components

1. **Frontend** (React + Vite)
   - Real-time dashboard
   - Strategy management
   - Live execution monitoring
   - Responsive design

2. **Backend** (Express + Node.js)
   - RESTful API
   - WebSocket for real-time updates
   - Request validation with Zod

3. **Database** (PostgreSQL)
   - Strategy definitions
   - Instance tracking
   - Attempt history
   - Audit logs

4. **Cache/Queue** (Redis + BullMQ)
   - Job queue management
   - Session caching
   - Real-time pub/sub

5. **Scheduler** (20-second cycles)
   - Monitors active strategies
   - Creates provisioning jobs
   - Respects concurrency limits

6. **Worker**
   - Processes pending jobs
   - Calls OCI API
   - Handles retries
   - Updates instance status

### 20-Second Cycle

```
┌─────────────────────────────────────┐
│   Scheduler Cycle (Every 20s)       │
├─────────────────────────────────────┤
│ 1. Get active strategies            │
│ 2. Check current instance count     │
│ 3. Calculate remaining instances    │
│ 4. Create jobs (up to concurrency)  │
│ 5. Broadcast cycle event            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Worker Processing (Continuous)    │
├─────────────────────────────────────┤
│ 1. Get pending attempts             │
│ 2. Call OCI API                     │
│ 3. Handle success/failure           │
│ 4. Manage retries (up to 3x)        │
│ 5. Update instance status           │
│ 6. Broadcast events                 │
└─────────────────────────────────────┘
```

## API Endpoints

### Strategies

- `GET /api/strategies` - List all strategies
- `GET /api/strategies/:id` - Get strategy details
- `POST /api/strategies` - Create new strategy
- `PATCH /api/strategies/:id` - Update strategy
- `PATCH /api/strategies/:id/start` - Activate strategy
- `PATCH /api/strategies/:id/stop` - Pause strategy
- `DELETE /api/strategies/:id` - Delete strategy

### Instances

- `GET /api/instances` - List instances
- `GET /api/instances/:id` - Get instance details
- `GET /api/instances-stats` - Get statistics
- `POST /api/instances` - Create instance
- `PATCH /api/instances/:id` - Update instance
- `DELETE /api/instances/:id` - Terminate instance

### Monitoring

- `GET /api/metrics` - Get system metrics
- `GET /api/logs` - Get audit logs
- `GET /api/attempts-stats` - Get retry statistics
- `GET /api/health` - Health check

## WebSocket Events

Real-time events are broadcast to connected clients:

### Scheduler Events

- `cycle:started` - New cycle begins
- `cycle:completed` - Cycle finished
- `cycle:error` - Cycle failed

### Job Events

- `job:created` - New job created
- `attempt:started` - Attempt begins
- `attempt:success` - Attempt succeeded
- `attempt:retry_scheduled` - Retry queued
- `attempt:failed` - Attempt failed

## Database Schema

### Tables

1. **strategies** - Provisioning strategies with configuration
2. **targets** - Regional targets (region, AD, subnet)
3. **instances** - Created VM instances
4. **attempts** - Individual provisioning attempts
5. **logs** - Audit and error logs
6. **scheduler_state** - Scheduler execution state

## OCI Integration

### Authentication

The application uses OCI SDK with API key authentication. Configure these environment variables:

```env
OCI_TENANCY_OCID=ocid1.tenancy.oc1...
OCI_USER_OCID=ocid1.user.oc1...
OCI_FINGERPRINT=xx:xx:xx...
OCI_PRIVATE_KEY_PATH=/path/to/private_key.pem
OCI_REGION=sa-saopaulo-1
```

### Idempotency

- Uses `opc-request-id` for tracking
- Uses `opc-retry-token` for idempotent retries
- Prevents duplicate instance creation

### Error Handling

- Capacity errors trigger automatic retry
- Configurable retry limit (default: 3 attempts)
- Exponential backoff between retries
- Detailed error logging

## Development

### Available Commands

```bash
# Development
pnpm run dev           # Start dev server (Vite)
pnpm run dev:api       # Start API server only

# Build
pnpm run build         # Build for production
pnpm run build:client  # Build frontend only
pnpm run build:server  # Build backend only

# Database
pnpm run db:push       # Apply schema changes
pnpm run db:migrate    # Create migration
pnpm run db:studio     # Open Prisma Studio

# Testing
pnpm run test          # Run tests
pnpm run typecheck     # TypeScript validation

# Code Quality
pnpm run format.fix    # Format with Prettier
```

### Project Structure

```
├── client/                 # React frontend
│   ├── pages/             # Route components
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities
│   └── global.css         # Tailwind styles
├── server/                # Express backend
│   ├── routes/            # API handlers
│   ├── scheduler.ts       # 20s cycle scheduler
│   └── worker.ts          # Job processor
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma models
├── public/                # Static assets
└── docker-compose.yml     # Docker configuration
```

## Monitoring & Logging

### Dashboard

Access the real-time dashboard at `http://localhost:3000`:

- **Dashboard**: Overview with key metrics
- **Criar Estratégia**: Create new strategies
- **Execução em Tempo Real**: Live execution monitoring
- **Instâncias**: Manage created instances
- **Logs**: Audit trail and events
- **Monitoramento**: System metrics

### Logs

View logs via API:

```bash
curl http://localhost:3000/api/logs?level=error&limit=50
```

Or use Prisma Studio:

```bash
pnpm run db:studio
```

## Performance

- **Throughput**: 5-10 instances per 20-second cycle (configurable)
- **Concurrency**: Up to 20 simultaneous creations (configurable)
- **Scalability**: Horizontal via Redis + Load Balancer
- **Database**: Indexed queries for fast lookups

## Troubleshooting

### Application won't start

```bash
# Check database connection
pnpm run db:push

# Check Redis connection
redis-cli ping

# View logs
docker-compose logs app
```

### High failure rate

1. Check OCI credentials in `.env`
2. Verify quota and capacity in OCI tenancy
3. Check network connectivity to OCI
4. Review logs for specific errors

### Database issues

```bash
# Reset database (warning: destructive)
pnpm run db:push -- --force-reset

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

## Production Deployment

### Using Netlify/Vercel

Connect via MCP (Model Context Protocol) integrations in the Builder.io UI.

### Using Docker

```bash
# Build image
docker build -t oci-provisioner .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e OCI_TENANCY_OCID=... \
  oci-provisioner
```

### Using Kubernetes

Create helm values file and deploy:

```bash
helm install oci-provisioner ./helm -f values.yaml
```

## Security

- Credentials stored in environment variables only
- API key validation for OCI
- HTTPS recommended for production
- WebSocket connections validated
- Database credentials not exposed in logs
- Request validation with Zod

## Support & Documentation

- API Docs: http://localhost:3000/api
- Database Docs: Use `pnpm run db:studio`
- OCI SDK: https://docs.oracle.com/en-us/iaas/developer-tools/overview/index.html
- Builder.io Docs: https://www.builder.io/c/docs

## License

Proprietary - OCI Auto Provisioner
