import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Topics from './pages/Topics';
import ConsumerGroups from './pages/ConsumerGroups';
import Overview from './pages/Overview';
import SchemaRegistry from './pages/SchemaRegistry';
import KafkaConnect from './pages/KafkaConnect';
import Brokers from './pages/Brokers';
import { api } from './api/client';

const CLUSTER_NAME = import.meta.env.VITE_CLUSTER_NAME || 'KInsight Control Plane';
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'Production';

function NavLink({ to, children, onNavigate }: { to: string; children: React.ReactNode; onNavigate?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={isActive ? 'active' : ''} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clusterHealth, setClusterHealth] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    let mounted = true;

    const fetchHealth = async () => {
      try {
        const response = await api.getHealth();
        if (!mounted) return;
        setClusterHealth(response.data);
        setLastUpdated(new Date());
      } catch (error) {
        console.warn('Unable to refresh cluster health', error);
      }
    };

    fetchHealth();
    const intervalId = window.setInterval(fetchHealth, 60_000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const clusterStatus = (clusterHealth?.status || 'unknown').toString().toUpperCase();
  const kafkaVersion = clusterHealth?.kafka_version || clusterHealth?.version;
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="app">
      <button className="sidebar-mobile-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />
      
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <h1>KInsight</h1>
          <p>Kafka Management</p>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink to="/" onNavigate={closeSidebar}>📊 Overview</NavLink>
          </li>
          <li>
            <NavLink to="/brokers" onNavigate={closeSidebar}>🖥️ Brokers</NavLink>
          </li>
          <li>
            <NavLink to="/topics" onNavigate={closeSidebar}>📝 Topics</NavLink>
          </li>
          <li>
            <NavLink to="/consumer-groups" onNavigate={closeSidebar}>👥 Consumer Groups</NavLink>
          </li>
          <li>
            <NavLink to="/schema-registry" onNavigate={closeSidebar}>📋 Schema Registry</NavLink>
          </li>
          <li>
            <NavLink to="/kafka-connect" onNavigate={closeSidebar}>🔌 Kafka Connect</NavLink>
          </li>
        </ul>
      </nav>
      <main className="content">
        <div className="content-inner">
          <header className="topbar">
            <div className="topbar-left">
              <div className="cluster-chip">{ENVIRONMENT}</div>
              <div>
                <h2>{CLUSTER_NAME}</h2>
                <p>High-fidelity control plane for Apache Kafka • Updated {lastUpdatedLabel}</p>
              </div>
            </div>
            <div className="topbar-right">
              <div className="topbar-metrics">
                <div className="topbar-metric">
                  <span className="metric-label">Status</span>
                  <span className={`metric-value status-${clusterStatus.toLowerCase()}`}>
                    {clusterStatus}
                  </span>
                </div>
                <div className="topbar-metric">
                  <span className="metric-label">Kafka</span>
                  <span className="metric-value">{kafkaVersion || '—'}</span>
                </div>
                <div className="topbar-metric">
                  <span className="metric-label">Last Check</span>
                  <span className="metric-value">{lastUpdatedLabel}</span>
                </div>
              </div>
              <div className="topbar-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.open('https://github.com/AeroliteHQ/kinsight/blob/main/README.md', '_blank')}
                >
                  📚 Docs
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
                  ⟳ Refresh
                </button>
              </div>
            </div>
          </header>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/brokers" element={<Brokers />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/consumer-groups" element={<ConsumerGroups />} />
              <Route path="/schema-registry" element={<SchemaRegistry />} />
              <Route path="/kafka-connect" element={<KafkaConnect />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
