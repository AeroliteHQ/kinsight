import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

interface Topic {
  name: string;
  partitions: number;
  replicationFactor: number;
  internal: boolean;
  config?: Record<string, any>;
}

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'messages' | 'publish' | 'config'>('list');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await api.getTopics();
      setTopics(response.data || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch topics: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>📝 Topics</h1>
          <p>Loading topic information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📝 Topics</h1>
        <p>Manage Kafka topics, publish messages, and view configurations</p>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 Topic List
          </button>
          <button
            className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            💬 Messages
          </button>
          <button
            className={`tab-button ${activeTab === 'publish' ? 'active' : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            📤 Publish Message
          </button>
          <button
            className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            ⚙️ Configuration
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <>
          <div className="info-banner">
            <h3>📊 Topic Overview</h3>
            <p>View and manage Kafka topics in your cluster</p>
          </div>

          <div className="insights-grid">
            <div className="insight-card">
              <span>Total Topics</span>
              <strong>{topics.length}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>Including internal topics</small>
            </div>
            <div className="insight-card">
              <span>User Topics</span>
              <strong>{topics.filter(t => !t.internal).length}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>Application topics</small>
            </div>
            <div className="insight-card">
              <span>Internal Topics</span>
              <strong>{topics.filter(t => t.internal).length}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>System topics</small>
            </div>
            <div className="insight-card">
              <span>Total Partitions</span>
              <strong>{topics.reduce((sum, t) => sum + (t.partitions || 0), 0)}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>Across all topics</small>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Topics</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Topic Name</th>
                      <th>Partitions</th>
                      <th>Replication Factor</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic) => (
                      <tr key={topic.name}>
                        <td>
                          <strong style={{ color: topic.internal ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                            {topic.name}
                          </strong>
                        </td>
                        <td>{topic.partitions}</td>
                        <td>{topic.replicationFactor}×</td>
                        <td>
                          <span className={`status-badge ${topic.internal ? 'warning' : 'success'}`}>
                            {topic.internal ? 'Internal' : 'User'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setActiveTab('messages')}
                          >
                            👁 View Messages
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'messages' && (
        <div className="card">
          <div className="card-header">
            <h3>💬 Message Browser</h3>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Message browsing - Backend implementation needed
            </div>
          </div>
        </div>
      )}

      {activeTab === 'publish' && (
        <div className="card">
          <div className="card-header">
            <h3>📤 Publish Message</h3>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Message publishing - Backend implementation needed
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="card">
          <div className="card-header">
            <h3>⚙️ Configuration</h3>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Topic configuration viewer - Backend implementation needed
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
