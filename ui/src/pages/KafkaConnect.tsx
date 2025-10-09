import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Connector {
  name: string;
  type: string;
  state: string;
  workerId: string;
  tasks: Task[];
}

interface Task {
  id: number;
  state: string;
  workerId: string;
}

interface ConnectorPlugin {
  class: string;
  type: string;
  version: string;
}

export default function KafkaConnect() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [plugins, setPlugins] = useState<ConnectorPlugin[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [newConnector, setNewConnector] = useState({
    name: '',
    config: '{\n  "connector.class": "",\n  "tasks.max": "1"\n}',
  });

  useEffect(() => {
    loadConnectors();
    loadPlugins();
  }, []);

  const loadConnectors = async () => {
    try {
      setLoading(true);
      const response = await api.getConnectors();
      setConnectors(response.data);
    } catch (error) {
      console.error('Failed to load connectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlugins = async () => {
    try {
      const response = await api.getConnectorPlugins();
      setPlugins(response.data);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const handleCreateConnector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = JSON.parse(newConnector.config);
      await api.createConnector(newConnector.name, config);
      setShowCreateForm(false);
      setNewConnector({
        name: '',
        config: '{\n  "connector.class": "",\n  "tasks.max": "1"\n}',
      });
      await loadConnectors();
    } catch (error: any) {
      alert(`Failed to create connector: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteConnector = async (name: string) => {
    if (!confirm(`Are you sure you want to delete connector "${name}"?`)) {
      return;
    }

    try {
      await api.deleteConnector(name);
      await loadConnectors();
    } catch (error: any) {
      alert(`Failed to delete connector: ${error.response?.data?.error || error.message}`);
    }
  };

  const handlePauseConnector = async (name: string) => {
    try {
      await api.pauseConnector(name);
      await loadConnectors();
    } catch (error: any) {
      alert(`Failed to pause connector: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleResumeConnector = async (name: string) => {
    try {
      await api.resumeConnector(name);
      await loadConnectors();
    } catch (error: any) {
      alert(`Failed to resume connector: ${error.response?.data?.error || error.message}`);
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toUpperCase()) {
      case 'RUNNING':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getTypeColor = (type: string) => {
    return type.toLowerCase() === 'source' ? 'info' : 'warning';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading Kafka Connect...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Kafka Connect</h2>
        <p>Manage connectors and streaming data pipelines</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Connectors</h3>
          <div className="value">{connectors.length}</div>
        </div>
        <div className="stat-card">
          <h3>Running</h3>
          <div className="value" style={{ color: 'var(--success)' }}>
            {connectors.filter((c) => c.state === 'RUNNING').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Failed</h3>
          <div className="value" style={{ color: 'var(--danger)' }}>
            {connectors.filter((c) => c.state === 'FAILED').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Available Plugins</h3>
          <div className="value">{plugins.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Connectors</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancel' : '+ Create Connector'}
          </button>
        </div>

        <div className="card-body">
          {showCreateForm && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Create New Connector</h4>
              <form onSubmit={handleCreateConnector}>
                <div className="form-group">
                  <label>Connector Name</label>
                  <input
                    type="text"
                    required
                    value={newConnector.name}
                    onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })}
                    placeholder="my-connector"
                  />
                </div>
                <div className="form-group">
                  <label>Configuration (JSON)</label>
                  <textarea
                    required
                    rows={15}
                    value={newConnector.config}
                    onChange={(e) => setNewConnector({ ...newConnector, config: e.target.value })}
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  ✓ Create Connector
                </button>
              </form>
            </div>
          )}

          {connectors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔌</div>
              <div className="empty-state-title">No connectors found</div>
              <div className="empty-state-description">
                Create your first connector to start streaming data
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>State</th>
                    <th>Worker</th>
                    <th>Tasks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connectors.map((connector) => (
                    <tr key={connector.name}>
                      <td>
                        <strong>{connector.name}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${getTypeColor(connector.type)}`}>
                          {connector.type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${getStateColor(connector.state)}`}>
                          {connector.state}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {connector.workerId}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelectedConnector(connector)}
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                          {connector.tasks.length} tasks
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {connector.state === 'RUNNING' ? (
                            <button
                              className="btn btn-sm"
                              onClick={() => handlePauseConnector(connector.name)}
                              style={{ background: 'var(--warning)', color: 'white' }}
                            >
                              ⏸ Pause
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleResumeConnector(connector.name)}
                            >
                              ▶ Resume
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteConnector(connector.name)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {plugins.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Available Connector Plugins</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {plugins.map((plugin, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    {plugin.class.split('.').pop()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {plugin.class}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className={`badge badge-${plugin.type.toLowerCase() === 'source' ? 'info' : 'warning'}`}>
                      {plugin.type}
                    </span>
                    <span className="badge badge-neutral">v{plugin.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedConnector && (
        <div className="modal-overlay" onClick={() => setSelectedConnector(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Tasks: {selectedConnector.name}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {selectedConnector.tasks.length} tasks • Worker: {selectedConnector.workerId}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedConnector(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className="modal-body">
              {selectedConnector.tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">⚙️</div>
                  <div className="empty-state-title">No tasks</div>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Task ID</th>
                        <th>State</th>
                        <th>Worker ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedConnector.tasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <code style={{ color: 'var(--primary-light)' }}>{task.id}</code>
                          </td>
                          <td>
                            <span className={`badge badge-${getStateColor(task.state)}`}>
                              {task.state}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {task.workerId}
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
      )}
    </div>
  );
}
