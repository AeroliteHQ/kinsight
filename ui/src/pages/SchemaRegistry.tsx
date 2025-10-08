import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Schema {
  id: number;
  subject: string;
  version: number;
  schema: string;
  schemaType: string;
}

export default function SchemaRegistry() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchema, setNewSchema] = useState({
    subject: '',
    schema: '',
    schemaType: 'AVRO',
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.getSchemaSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to load schema subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchemas = async (subject: string) => {
    try {
      setLoading(true);
      const response = await api.getSchemaVersions(subject);
      setSchemas(response.data);
      setSelectedSubject(subject);
    } catch (error: any) {
      alert(`Failed to load schemas: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSchema(newSchema.subject, {
        schema: newSchema.schema,
        schemaType: newSchema.schemaType,
      });
      setShowCreateForm(false);
      setNewSchema({ subject: '', schema: '', schemaType: 'AVRO' });
      await loadSubjects();
    } catch (error: any) {
      alert(`Failed to create schema: ${error.response?.data?.error || error.message}`);
    }
  };

  const formatSchema = (schema: string) => {
    try {
      const parsed = JSON.parse(schema);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schema;
    }
  };

  const getSchemaTypeColor = (type: string) => {
    switch (type) {
      case 'AVRO': return 'info';
      case 'JSON': return 'success';
      case 'PROTOBUF': return 'warning';
      default: return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading schemas...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Schema Registry</h2>
        <p>Manage Avro, JSON, and Protobuf schemas</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Subjects</h3>
          <div className="value">{subjects.length}</div>
        </div>
        <div className="stat-card">
          <h3>Selected Versions</h3>
          <div className="value">{schemas.length}</div>
        </div>
        <div className="stat-card">
          <h3>AVRO Schemas</h3>
          <div className="value" style={{ color: 'var(--info)' }}>
            {schemas.filter(s => s.schemaType === 'AVRO').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>JSON Schemas</h3>
          <div className="value" style={{ color: 'var(--success)' }}>
            {schemas.filter(s => s.schemaType === 'JSON').length}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Schema Subjects</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancel' : '+ Register Schema'}
          </button>
        </div>

        <div className="card-body">
          {showCreateForm && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Register New Schema</h4>
              <form onSubmit={handleCreateSchema}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      required
                      value={newSchema.subject}
                      onChange={(e) => setNewSchema({ ...newSchema, subject: e.target.value })}
                      placeholder="my-topic-value"
                    />
                  </div>
                  <div className="form-group">
                    <label>Schema Type</label>
                    <select
                      value={newSchema.schemaType}
                      onChange={(e) => setNewSchema({ ...newSchema, schemaType: e.target.value })}
                    >
                      <option value="AVRO">AVRO</option>
                      <option value="JSON">JSON</option>
                      <option value="PROTOBUF">PROTOBUF</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Schema Definition (JSON format)</label>
                  <textarea
                    required
                    rows={10}
                    value={newSchema.schema}
                    onChange={(e) => setNewSchema({ ...newSchema, schema: e.target.value })}
                    placeholder='{"type": "record", "name": "User", "fields": [{"name": "id", "type": "int"}]}'
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  ✓ Register Schema
                </button>
              </form>
            </div>
          )}

          {subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No schemas registered</div>
              <div className="empty-state-description">
                Register your first schema to get started
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {subjects.map((subject) => (
                <div
                  key={subject}
                  onClick={() => loadSchemas(subject)}
                  style={{
                    padding: '1rem',
                    background: selectedSubject === subject ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: selectedSubject === subject ? 'white' : 'var(--text-primary)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedSubject === subject ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{subject}</div>
                  {selectedSubject === subject && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
                      {schemas.length} versions
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {schemas.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Versions: {selectedSubject}</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas.map((schema) => (
                    <tr key={schema.id}>
                      <td>
                        <span className="badge badge-neutral">v{schema.version}</span>
                      </td>
                      <td>
                        <code style={{ color: 'var(--primary-light)' }}>{schema.id}</code>
                      </td>
                      <td>
                        <span className={`badge badge-${getSchemaTypeColor(schema.schemaType)}`}>
                          {schema.schemaType}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedSchema(schema)}
                        >
                          👁 View Schema
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedSchema && (
        <div className="modal-overlay" onClick={() => setSelectedSchema(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Schema Definition</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  ID: {selectedSchema.id} • Version: {selectedSchema.version} • Type: {selectedSchema.schemaType}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedSchema(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className="modal-body">
              <pre className="code-block">
                {formatSchema(selectedSchema.schema)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
