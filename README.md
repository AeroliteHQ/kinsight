# KInsight - Modern Kafka UI

KInsight is a comprehensive, modern web-based UI for managing and monitoring Apache Kafka clusters, inspired by Redpanda Console. It provides full-featured Kafka management with support for Schema Registry, Kafka Connect, and message browsing.

## Features

### Core Kafka Management
- 📊 **Overview Dashboard** - Real-time cluster statistics and health monitoring
- 🖥️ **Broker Management** - View broker information, configurations, and health status
- 📝 **Topics Management** - Create, view, configure, and delete Kafka topics
- � **Message Browser** - Browse and inspect messages from any topic/partition
- �👥 **Consumer Groups** - Monitor consumer groups, lag, and member assignments

### Advanced Features
- 📋 **Schema Registry** - Manage Avro, JSON, and Protobuf schemas
- 🔌 **Kafka Connect** - Create and manage source/sink connectors
- ⚡ **Real-time Updates** - Live data from your Kafka cluster
- 🎨 **Modern UI** - Clean, responsive React-based interface with mobile support

## Architecture

- **Backend**: Go + Fiber + IBM Sarama (Kafka client)
- **Frontend**: React + TypeScript + Vite
- **API**: RESTful API with Swagger documentation
- **Integrations**: Schema Registry, Kafka Connect REST Proxy

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- Apache Kafka cluster (or local instance)

### 1. Configure Environment Variables

#### Basic Kafka Connection
```bash
export KAFKA_BROKERS=localhost:9092
export KAFKA_CLIENT_ID=kinsight
export API_PORT=8080
export CORS_ORIGINS=*
```

#### Optional: SASL Authentication
```bash
export KAFKA_SASL_ENABLED=true
export KAFKA_SASL_MECHANISM=SCRAM-SHA-256
export KAFKA_SASL_USERNAME=your-username
export KAFKA_SASL_PASSWORD=your-password
```

#### Optional: TLS/SSL
```bash
export KAFKA_TLS_ENABLED=true
```

#### Optional: Schema Registry
```bash
export SCHEMA_REGISTRY_ENABLED=true
export SCHEMA_REGISTRY_URL=http://localhost:8081
export SCHEMA_REGISTRY_USERNAME=sr-user
export SCHEMA_REGISTRY_PASSWORD=sr-password
```

#### Optional: Kafka Connect
```bash
export KAFKA_CONNECT_ENABLED=true
export KAFKA_CONNECT_URL=http://localhost:8083
export KAFKA_CONNECT_USERNAME=connect-user
export KAFKA_CONNECT_PASSWORD=connect-password
```

### 2. Start the Backend

```bash
cd server
go run main.go
```

The API will be available at `http://localhost:8080`

API Documentation (Swagger): `http://localhost:8080/swagger/`

### 3. Start the Frontend

```bash
cd ui
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`

## UI Features

### 📊 Overview Dashboard
- Cluster-wide statistics
- Broker count and status
- Topic and consumer group summaries
- Real-time health monitoring

### 🖥️ Broker Management
- View all brokers in the cluster
- Inspect broker configurations
- Monitor broker health and status
- View rack assignments

### 📝 Topics
- List all topics with metadata
- Create new topics with custom configurations
- Configure partitions, replication factor, and retention policies
- Delete topics (with confirmation)
- View topic configurations

### 💬 Message Browser
- Browse messages from any topic
- Select partition and offset (latest, earliest, or custom)
- View message key, value, headers, and timestamp
- JSON formatting for message payloads
- Configurable message limit

### 👥 Consumer Groups
- List all consumer groups
- View group state and protocol information
- Monitor member assignments
- Track coordinator information

### 📋 Schema Registry (Optional)
- List all schema subjects
- View schema versions
- Register new Avro, JSON, or Protobuf schemas
- Inspect schema definitions with JSON formatting

### 🔌 Kafka Connect (Optional)
- List all connectors
- View connector status (running, paused, failed)
- Create new source/sink connectors
- Pause, resume, or delete connectors
- View available connector plugins
- Monitor task status

## Responsive Design

The UI is fully responsive and works seamlessly on:
- 🖥️ Desktop browsers
- 📱 Tablets
- 📱 Mobile devices

Features include:
- Mobile-friendly navigation with hamburger menu
- Responsive tables with horizontal scrolling
- Touch-optimized controls
- Adaptive layouts for all screen sizes

## Configuration

### Environment Variables

#### Core Settings
- `KAFKA_BROKERS` - Comma-separated list of Kafka brokers (default: `localhost:9092`)
- `KAFKA_CLIENT_ID` - Client ID for Kafka connections (default: `kinsight`)
- `API_PORT` - Backend API port (default: `8080`)
- `API_HOST` - Backend API host (default: `0.0.0.0`)
- `CORS_ORIGINS` - Allowed CORS origins (default: `*`)

#### Security Settings
- `KAFKA_SASL_ENABLED` - Enable SASL authentication (default: `false`)
- `KAFKA_SASL_MECHANISM` - SASL mechanism: `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`
- `KAFKA_SASL_USERNAME` - SASL username
- `KAFKA_SASL_PASSWORD` - SASL password
- `KAFKA_TLS_ENABLED` - Enable TLS/SSL (default: `false`)

#### Schema Registry
- `SCHEMA_REGISTRY_ENABLED` - Enable Schema Registry integration (default: `false`)
- `SCHEMA_REGISTRY_URL` - Schema Registry URL (e.g., `http://localhost:8081`)
- `SCHEMA_REGISTRY_USERNAME` - Schema Registry username (optional)
- `SCHEMA_REGISTRY_PASSWORD` - Schema Registry password (optional)

#### Kafka Connect
- `KAFKA_CONNECT_ENABLED` - Enable Kafka Connect integration (default: `false`)
- `KAFKA_CONNECT_URL` - Kafka Connect REST API URL (e.g., `http://localhost:8083`)
- `KAFKA_CONNECT_USERNAME` - Kafka Connect username (optional)
- `KAFKA_CONNECT_PASSWORD` - Kafka Connect password (optional)

## API Endpoints

### Topics
- `GET /api/topics` - List all topics
- `POST /api/topics` - Create a new topic
- `DELETE /api/topics/{name}` - Delete a topic
- `GET /api/topics/{topic}/messages` - Get messages from a topic

### Brokers
- `GET /api/brokers` - List all brokers
- `GET /api/brokers/{id}/config` - Get broker configuration

### Consumer Groups
- `GET /api/consumer-groups` - List all consumer groups

### Schema Registry
- `GET /api/schema-registry/subjects` - List all subjects
- `GET /api/schema-registry/subjects/{subject}/versions` - Get schema versions
- `POST /api/schema-registry/subjects/{subject}/versions` - Register new schema

### Kafka Connect
- `GET /api/connect/connectors` - List all connectors
- `GET /api/connect/connector-plugins` - List available plugins
- `POST /api/connect/connectors` - Create a new connector
- `DELETE /api/connect/connectors/{name}` - Delete a connector
- `PUT /api/connect/connectors/{name}/pause` - Pause a connector
- `PUT /api/connect/connectors/{name}/resume` - Resume a connector

### Health
- `GET /api/health` - Health check endpoint

## Development

### Backend
```bash
cd server
go mod download
go run main.go
```

### Frontend
```bash
cd ui
npm install
npm run dev
```

### Build for Production

Backend:
```bash
cd server
go build -o kinsight
```

Frontend:
```bash
cd ui
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
