import { useEffect, useState } from 'react';
import { api, type Topic, type ConsumerGroup, type Connector } from '../api/client';

interface HealthPayload {
  status?: string;
  kafka_version?: string;
  version?: string;
}

export default function Overview() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<ConsumerGroup[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [healthRes, topicsRes, groupsRes, connectorsRes, subjectsRes] = await Promise.all([
        api.getHealth().catch(() => ({ data: { status: 'unavailable' } })),
        api.getTopics().catch(() => ({ data: [] })),
        api.getConsumerGroups().catch(() => ({ data: [] })),
        api.getConnectors().catch(() => ({ data: [] })),
        api.getSchemaSubjects().catch(() => ({ data: [] })),
      ]);

      setHealth(healthRes.data);
      setTopics(topicsRes.data);
      setGroups(groupsRes.data);
      setConnectors(connectorsRes.data);
      setSubjects(subjectsRes.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading cluster overview...</div>
      </div>
    );
  }

  const totalPartitions = topics.reduce((sum: number, topic: Topic) => sum + topic.partitions, 0);
  const stableGroups = groups.filter((group: ConsumerGroup) => group.state === 'Stable').length;
  const rebalancingGroups = groups.filter((group: ConsumerGroup) => group.state.includes('Rebalance')).length;
  const internalTopics = topics.filter((topic: Topic) => topic.internal).length;
  const activeGroups = groups.filter((group: ConsumerGroup) => group.members.length > 0).length;
  const connectorsRunning = connectors.filter((connector: Connector) => connector.state === 'RUNNING').length;
  const connectorsFailed = connectors.filter((connector: Connector) => connector.state === 'FAILED').length;
  const replicationAverage = topics.length
    ? (topics.reduce((sum: number, topic: Topic) => sum + topic.replicationFactor, 0) / topics.length).toFixed(1)
    : null;
  const topTopic = [...topics].sort((a, b) => b.partitions - a.partitions)[0];

  const sparklineData = topics.slice(0, Math.min(topics.length, 10));
  const maxPartitions = sparklineData.reduce((max: number, topic: Topic) => Math.max(max, topic.partitions), 0) || 1;

  type Insight = { label: string; value: string; caption: string };
  const insights: Insight[] = [
    {
      label: 'Top topic by partitions',
      value: topTopic ? topTopic.name : 'No topics available',
      caption: topTopic ? `${topTopic.partitions} partitions • RF ×${topTopic.replicationFactor}` : 'Create topics to start streaming',
    },
    {
      label: 'Consumer activity',
      value: `${activeGroups} active groups`,
      caption: `${stableGroups} stable • ${rebalancingGroups} rebalancing`,
    },
    {
      label: 'Connector uptime',
      value: connectors.length ? `${connectorsRunning}/${connectors.length} running` : 'No connectors',
      caption: connectors.length
        ? `Deploy connectors to integrate external systems`
        : 'Deploy connectors to integrate external systems',
    },
    {
      label: 'Schema coverage',
      value: `${subjects.length} subjects`,
      caption: subjects.length ? 'No schemas registered yet' : 'No schemas registered yet',
    },
  ];

  const streamingSummaries = connectors.slice(0, 4);

  return (
    <div className="container">
      <div className="page-header">
        <h2>Cluster Overview</h2>
        <p>Monitor cluster health, topics, consumers, and connectors</p>
      </div>

      <div className="info-banner">
        <div>
          <h3>Kafka Cluster Status</h3>
          <p>
            Monitor broker health, topic distribution, consumer activity, and connector status.
          </p>
        </div>
        <div className="info-banner-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            🔄 Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => window.open('/topics', '_self')}
          >
            📝 Manage Topics
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Cluster Status</h3>
          <div className="value">
            {health?.status ? health.status.toUpperCase() : 'UNKNOWN'}
          </div>
          <div className="stat-label">
            {health?.kafka_version || health?.version ? `Kafka ${health.kafka_version || health.version}` : 'Version unknown'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Total Topics</h3>
          <div className="value">{topics.length}</div>
          <div className="stat-label">
            {internalTopics} internal • {Math.max(topics.length - internalTopics, 0)} user
          </div>
        </div>
        <div className="stat-card">
          <h3>Partitions</h3>
          <div className="value">{totalPartitions}</div>
          <div className="stat-label">
            {topics.length > 0 ? `Avg ${(totalPartitions / topics.length).toFixed(1)} per topic` : 'Create your first topic'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Consumer Groups</h3>
          <div className="value">{groups.length}</div>
          <div className="stat-label">
            {stableGroups} stable • {groups.length - stableGroups} scanning
          </div>
        </div>
        <div className="stat-card">
          <h3>Connectors</h3>
          <div className="value">{connectors.length}</div>
          <div className="stat-label">
            {connectorsRunning} running • {connectorsFailed} failed
          </div>
        </div>
        <div className="stat-card">
          <h3>Schema Registry</h3>
          <div className="value">{subjects.length}</div>
          <div className="stat-label">Subjects registered</div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="card highlight-card">
          <div className="card-header">
            <h3>Topics</h3>
            {topics.length > 0 && (
              <span className="badge badge-info">{topics.length} total</span>
            )}
          </div>
          <div className="card-body">
            {topics.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No topics found</div>
                <div className="empty-state-description">
                  Create your first topic to start streaming data.
                </div>
              </div>
            ) : (
              <>
                <div className="sparkline">
                  {sparklineData.map((topic: Topic) => (
                    <div className="spark-segment" key={topic.name}>
                      <div
                        className="spark-bar"
                        style={{ height: `${Math.max(12, (topic.partitions / maxPartitions) * 100)}%` }}
                      />
                      <div className="spark-bar-label">{topic.name}</div>
                    </div>
                  ))}
                </div>
                <div className="insights-grid">
                  <div className="insight-card">
                    <span>Avg Replication</span>
                    <strong>{replicationAverage ? `${replicationAverage}×` : 'N/A'}</strong>
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Average replication factor
                    </small>
                  </div>
                  <div className="insight-card">
                    <span>Total Partitions</span>
                    <strong>{totalPartitions}</strong>
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Distributed across brokers
                    </small>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>System Health</h3>
          </div>
          <div className="card-body">
            <div className="insights-grid">
              {insights.map((insight: Insight) => (
                <div className="insight-card" key={insight.label}>
                  <span>{insight.label}</span>
                  <strong>{insight.value}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>{insight.caption}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Connectors</h3>
            {connectors.length > 0 && (
              <span className="badge badge-info">{connectorsRunning} running</span>
            )}
          </div>
          <div className="card-body">
            {streamingSummaries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔌</div>
                <div className="empty-state-title">No connectors found</div>
                <div className="empty-state-description">
                  Deploy connectors to integrate external systems.
                </div>
              </div>
            ) : (
              <div className="list">
                {streamingSummaries.map((connector: Connector) => (
                  <div className="list-item" key={connector.name}>
                    <div className="list-title">
                      {connector.name}
                      <span
                        className={`badge badge-${
                          connector.state === 'RUNNING'
                            ? 'success'
                            : connector.state === 'FAILED'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {connector.state}
                      </span>
                    </div>
                    <div className="list-subtitle">
                      {connector.type} • {connector.tasks.length} tasks • Worker {connector.workerId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Topics</h3>
          </div>
          <div className="card-body flush">
            {topics.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">No topics found</div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Partitions</th>
                      <th>Replication</th>
                      <th>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.slice(0, 6).map((topic: Topic) => (
                      <tr key={topic.name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>{topic.name}</strong>
                            {topic.internal && <span className="badge badge-neutral">internal</span>}
                          </div>
                        </td>
                        <td>{topic.partitions}</td>
                        <td>{topic.replicationFactor}×</td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {topic.size ? `${(topic.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Consumer Groups</h3>
          </div>
          <div className="card-body flush">
            {groups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">No consumer groups</div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Group ID</th>
                      <th>State</th>
                      <th>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.slice(0, 6).map((group: ConsumerGroup) => (
                      <tr key={group.groupId}>
                        <td><strong>{group.groupId}</strong></td>
                        <td>
                          <span
                            className={`badge badge-${
                              group.state === 'Stable'
                                ? 'success'
                                : group.state.includes('Rebalance')
                                ? 'warning'
                                : 'danger'
                            }`}
                          >
                            {group.state}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{group.members.length}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
