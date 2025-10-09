import { useEffect, useState } from 'react';
import { api, type ConsumerGroup } from '../api/client';

export default function ConsumerGroups() {
  const [groups, setGroups] = useState<ConsumerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<ConsumerGroup | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.getConsumerGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load consumer groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toUpperCase()) {
      case 'STABLE':
        return 'success';
      case 'PREPARING_REBALANCE':
      case 'COMPLETING_REBALANCE':
        return 'warning';
      case 'DEAD':
      case 'EMPTY':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading consumer groups...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Consumer Groups</h2>
        <p>Monitor consumer groups, lag, and member activity</p>
      </div>

      <div className="info-banner">
        <div>
          <h3>Consumer Monitoring</h3>
          <p>
            Track consumer group health, lag metrics, and member assignments.
          </p>
        </div>
        <div className="info-banner-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadGroups}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Groups</h3>
          <div className="value">{groups.length}</div>
        </div>
        <div className="stat-card">
          <h3>Stable</h3>
          <div className="value" style={{ color: 'var(--success)' }}>
            {groups.filter(g => g.state === 'Stable').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Rebalancing</h3>
          <div className="value" style={{ color: 'var(--warning)' }}>
            {groups.filter(g => g.state.includes('Rebalance')).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Total Members</h3>
          <div className="value">
            {groups.reduce((acc, g) => acc + g.members.length, 0)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Consumer Groups</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No consumer groups found</div>
              <div className="empty-state-description">
                Consumer groups will appear here when applications start consuming
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Group ID</th>
                    <th>State</th>
                    <th>Protocol</th>
                    <th>Members</th>
                    <th>Lag Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.groupId}>
                      <td>
                        <strong>{group.groupId}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${getStateColor(group.state)}`}>
                          {group.state}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {group.protocolType || group.protocol || 'N/A'}
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {group.members.length}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <span className="badge badge-info">Monitoring</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedGroup(group)}
                        >
                          👁 View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedGroup && (
        <div className="modal-overlay" onClick={() => setSelectedGroup(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedGroup.groupId}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {selectedGroup.members.length} members • Coordinator: {selectedGroup.coordinatorId}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedGroup(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className="modal-body">
              {selectedGroup.members.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👤</div>
                  <div className="empty-state-title">No members</div>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Member ID</th>
                        <th>Client ID</th>
                        <th>Host</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.members.map((member, idx) => (
                        <tr key={idx}>
                          <td>
                            <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {member.memberId}
                            </code>
                          </td>
                          <td><strong>{member.clientId}</strong></td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {member.clientHost}
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
