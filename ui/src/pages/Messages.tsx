import { useEffect, useState } from 'react';
import { api, type Topic } from '../api/client';

interface Message {
  partition: number;
  offset: number;
  key: string;
  value: string;
  timestamp: string;
  headers: Record<string, string>;
}

export default function Messages() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [partition, setPartition] = useState(0);
  const [offset, setOffset] = useState('latest');
  const [limit, setLimit] = useState(100);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await api.getTopics();
      setTopics(response.data.filter(t => !t.internal));
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    setLoading(true);
    try {
      // This will be implemented in the backend
      const response = await api.getMessages(selectedTopic, partition, offset, limit);
      setMessages(response.data);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      alert(`Failed to load messages: ${error.response?.data?.error || error.message}`);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Messages</h2>
        <p>Browse and inspect Kafka messages</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Message Browser</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.name} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Partition</label>
            <input
              type="number"
              min="0"
              value={partition}
              onChange={(e) => setPartition(parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            />
          </div>

          <div className="form-group">
            <label>Offset</label>
            <select
              value={offset}
              onChange={(e) => setOffset(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            >
              <option value="latest">Latest</option>
              <option value="earliest">Earliest</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="form-group">
            <label>Limit</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={loadMessages}
          disabled={loading || !selectedTopic}
        >
          {loading ? 'Loading...' : 'Load Messages'}
        </button>
      </div>

      {messages.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Messages ({messages.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Offset</th>
                <th>Partition</th>
                <th>Key</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, idx) => (
                <tr key={idx}>
                  <td>{msg.offset}</td>
                  <td>{msg.partition}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.key || '(null)'}
                  </td>
                  <td>{new Date(msg.timestamp).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedMessage(msg)}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '800px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>Message Details</h3>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Partition:</strong> {selectedMessage.partition} | 
              <strong> Offset:</strong> {selectedMessage.offset} | 
              <strong> Timestamp:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}
            </div>
            {selectedMessage.key && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Key:</strong>
                <pre style={{ background: '#f7fafc', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                  {selectedMessage.key}
                </pre>
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <strong>Value:</strong>
              <pre style={{ background: '#f7fafc', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                {formatValue(selectedMessage.value)}
              </pre>
            </div>
            {Object.keys(selectedMessage.headers || {}).length > 0 && (
              <div>
                <strong>Headers:</strong>
                <pre style={{ background: '#f7fafc', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                  {JSON.stringify(selectedMessage.headers, null, 2)}
                </pre>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setSelectedMessage(null)}
              style={{ marginTop: '1rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
