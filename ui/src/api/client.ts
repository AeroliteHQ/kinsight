import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Topic {
  name: string;
  partitions: number;
  replicationFactor: number;
  internal: boolean;
  config: Record<string, string>;
  size?: number; // Size in bytes
}

export interface CreateTopicRequest {
  name: string;
  partitions: number;
  replicationFactor: number;
  config: Record<string, string>;
}

export interface ConsumerGroup {
  groupId: string;
  state: string;
  protocol: string;
  protocolType: string;
  members: ConsumerMember[];
  coordinatorId: number;
}

export interface ConsumerMember {
  memberId: string;
  clientId: string;
  clientHost: string;
}

export interface Message {
  partition: number;
  offset: number;
  key: string;
  value: string;
  timestamp: string;
  headers: Record<string, string>;
}

export interface PublishMessageRequest {
  key?: string;
  value: string;
  partition?: number;
}

export interface PublishMessageResponse {
  topic: string;
  partition: number;
  offset: number;
  success: boolean;
}

export interface Broker {
  id: number;
  host: string;
  port: number;
  rack?: string;
}

export interface BrokerConfig {
  name: string;
  value: string;
  isDefault: boolean;
}

export interface Schema {
  id: number;
  subject: string;
  version: number;
  schema: string;
  schemaType: string;
}

export interface Connector {
  name: string;
  type: string;
  state: string;
  workerId: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  state: string;
  workerId: string;
}

export interface ConnectorPlugin {
  class: string;
  type: string;
  version: string;
}

export const api = {
  // Topics
  getTopics: () => apiClient.get<Topic[]>('/topics'),
  createTopic: (data: CreateTopicRequest) => apiClient.post('/topics', data),
  deleteTopic: (name: string) => apiClient.delete(`/topics/${name}`),

  // Consumer Groups
  getConsumerGroups: () => apiClient.get<ConsumerGroup[]>('/consumer-groups'),

  // Messages
  getMessages: (topic: string, partition: number, offset: string, limit: number) => 
    apiClient.get<Message[]>(`/topics/${topic}/messages`, { params: { partition, offset, limit } }),
  publishMessage: (topic: string, data: PublishMessageRequest) => 
    apiClient.post<PublishMessageResponse>(`/topics/${topic}/messages`, data),

  // Brokers
  getBrokers: () => apiClient.get<Broker[]>('/brokers'),
  getBrokerConfig: (brokerId: number) => apiClient.get<BrokerConfig[]>(`/brokers/${brokerId}/config`),

  // Schema Registry
  getSchemaSubjects: () => apiClient.get<string[]>('/schema-registry/subjects'),
  getSchemaVersions: (subject: string) => apiClient.get<Schema[]>(`/schema-registry/subjects/${subject}/versions`),
  createSchema: (subject: string, data: { schema: string; schemaType: string }) => 
    apiClient.post(`/schema-registry/subjects/${subject}/versions`, data),

  // Kafka Connect
  getConnectors: () => apiClient.get<Connector[]>('/connect/connectors'),
  getConnectorPlugins: () => apiClient.get<ConnectorPlugin[]>('/connect/connector-plugins'),
  createConnector: (name: string, config: any) => 
    apiClient.post('/connect/connectors', { name, config }),
  deleteConnector: (name: string) => apiClient.delete(`/connect/connectors/${name}`),
  pauseConnector: (name: string) => apiClient.put(`/connect/connectors/${name}/pause`),
  resumeConnector: (name: string) => apiClient.put(`/connect/connectors/${name}/resume`),

  // Health
  getHealth: () => apiClient.get('/health'),
};

export default api;
