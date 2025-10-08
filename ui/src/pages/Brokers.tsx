import { useEffect, useMemo, useState } from 'react';
import { api, type Broker as ApiBroker, type BrokerConfig as ApiBrokerConfig } from '../api/client';

interface Broker extends ApiBroker {}
interface BrokerConfig extends ApiBrokerConfig {}

export default function Brokers() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<number | null>(null);
  const [configs, setConfigs] = useState<BrokerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const response = await api.getBrokers();
      setBrokers(response.data);
      setSelectedBroker(null);
      setConfigs([]);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to load brokers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrokerConfig = async (brokerId: number) => {
    try {
      setConfigsLoading(true);
      const response = await api.getBrokerConfig(brokerId);
      setConfigs(response.data);
      setSelectedBroker(brokerId);
    } catch (error: any) {
      alert(`Failed to load broker config: ${error.response?.data?.error || error.message}`);
    } finally {
      setConfigsLoading(false);
    }
  };

  const rackDistribution = useMemo(() => {
    return brokers.reduce<Record<string, number>>((acc, broker) => {
      const rackKey = broker.rack || 'Unassigned';
      acc[rackKey] = (acc[rackKey] || 0) + 1;
      return acc;
    }, {});
  }, [brokers]);

  const rackEntries = Object.entries(rackDistribution).sort((a, b) => b[1] - a[1]);
  const controllerId = brokers[0]?.id;
  const uniqueHosts = new Set(brokers.map((broker) => broker.host)).size;
  const portFloor = brokers.length ? Math.min(...brokers.map((broker) => broker.port)) : null;
  const portCeil = brokers.length ? Math.max(...brokers.map((broker) => broker.port)) : null;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading brokers...</div>
      </div>
    );
  }

  const hasBrokers = brokers.length > 0;
  const lastSyncLabel = lastSync
    ? lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="container">
      <div className="page-header">
        <h2>Brokers</h2>
        <p>Monitor broker topology, configuration, and health status</p>
      </div>

      <div className="info-banner">
        <div>
          <h3>Broker Status</h3>
          <p>
            View controller leadership, rack distribution, and configuration details.
          </p>
        </div>
        <div className="info-banner-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadBrokers}>
            🔄 Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => window.open('https://kafka.apache.org/documentation/', '_blank')}
          >
            � Documentation
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Brokers</h3>
          <div className="value">{brokers.length}</div>
          <div className="stat-label">Unique hosts: {uniqueHosts}</div>
        </div>
        <div className="stat-card">
          <h3>Controller</h3>
          <div className="value">{controllerId ?? 'N/A'}</div>
          <div className="stat-label">Rack-aware leader tracking</div>
        </div>
        <div className="stat-card">
          <h3>Rack Domains</h3>
          <div className="value">{rackEntries.length}</div>
          <div className="stat-label">{rackEntries.length > 0 ? `${rackEntries[0][0]} leads` : 'No rack metadata'}</div>
        </div>
        <div className="stat-card">
          <h3>Port Envelope</h3>
          <div className="value">
            {portFloor !== null && portCeil !== null ? `${portFloor} – ${portCeil}` : '—'}
          </div>
          <div className="stat-label">Last sync {lastSyncLabel}</div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="card highlight-card">
          <div className="card-header">
            <h3>Rack Distribution</h3>
            {hasBrokers && <span className="badge badge-info">{brokers.length} brokers</span>}
          </div>
          <div className="card-body">
            {!hasBrokers ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛰️</div>
                <div className="empty-state-title">No brokers registered</div>
                <div className="empty-state-description">
                  Brokers will appear here once the cluster metadata is reachable.
                </div>
              </div>
            ) : (
              <div className="rack-distribution">
                {rackEntries.map(([rack, count]) => (
                  <div className="rack-bar" key={rack}>
                    <div className="rack-bar-header">
                      <span>{rack}</span>
                      <span>{count} broker{count === 1 ? '' : 's'}</span>
                    </div>
                    <div className="rack-bar-track">
                      <div
                        className="rack-bar-fill"
                        style={{ width: `${(count / Math.max(brokers.length, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Broker Insights</h3>
          </div>
          <div className="card-body">
            <div className="insights-grid">
              <div className="insight-card">
                <span>Leadership</span>
                <strong>{controllerId ?? 'Unknown'}</strong>
                <small style={{ color: 'var(--text-secondary)' }}>
                  Current cluster controller identifier
                </small>
              </div>
              <div className="insight-card">
                <span>Rack balance</span>
                <strong>{rackEntries.length > 0 ? `${rackEntries[0][1]} / ${brokers.length}` : '—'}</strong>
                <small style={{ color: 'var(--text-secondary)' }}>
                  Brokers sharing the largest rack domain
                </small>
              </div>
              <div className="insight-card">
                <span>Port span</span>
                <strong>{portFloor !== null && portCeil !== null ? `${portFloor}-${portCeil}` : 'Uniform'}</strong>
                <small style={{ color: 'var(--text-secondary)' }}>
                  Validate firewall allowances across the fleet
                </small>
              </div>
              <div className="insight-card">
                <span>Configuration drift</span>
                <strong>{configs.length} props</strong>
                <small style={{ color: 'var(--text-secondary)' }}>
                  Review broker-level overrides for compliance
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Broker Inventory</h3>
        </div>
        <div className="card-body flush">
          {hasBrokers ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Host</th>
                    <th>Port</th>
                    <th>Rack</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brokers.map((broker) => (
                    <tr key={broker.id}>
                      <td><strong>{broker.id}</strong></td>
                      <td>{broker.host}</td>
                      <td>{broker.port}</td>
                      <td>{broker.rack || '—'}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => loadBrokerConfig(broker.id)}
                          disabled={configsLoading && selectedBroker === broker.id}
                        >
                          {configsLoading && selectedBroker === broker.id ? 'Loading…' : 'View config'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No brokers detected</div>
              <div className="empty-state-description">
                Ensure your Kafka cluster is reachable and refresh the fleet listing.
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedBroker !== null && configs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Broker {selectedBroker} Configuration</h3>
          </div>
          <div className="card-body flush">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.name}>
                      <td><code>{config.name}</code></td>
                      <td>{config.value}</td>
                      <td>{config.isDefault ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
