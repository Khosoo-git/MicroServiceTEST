import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverAPI, observabilityAPI } from '../api';
import { Container, Card, Button, Modal, Form, Row, Col, Table, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [servers, setServers] = useState([]);
  const [showAddServer, setShowAddServer] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', host: '', port: 8080, labels: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [traces, setTraces] = useState(null);
  const [query, setQuery] = useState('{service="company"}');
  const [metricQuery, setMetricQuery] = useState('up');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await serverAPI.getAll();
      setServers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch servers');
      setLoading(false);
    }
  };

  const handleAddServer = async () => {
    try {
      await serverAPI.add(newServer);
      setShowAddServer(false);
      setNewServer({ name: '', host: '', port: 8080, labels: '' });
      fetchServers();
    } catch (err) {
      setError('Failed to add server');
    }
  };

  const handleDeleteServer = async (id) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      try {
        await serverAPI.delete(id);
        fetchServers();
      } catch (err) {
        setError('Failed to delete server');
      }
    }
  };

  const fetchLogs = async () => {
    try {
      setError('');
      const response = await observabilityAPI.getLogs({ query });
      setLogs(JSON.parse(response.data));
    } catch (err) {
      setError('Failed to fetch logs: ' + (err.message || 'Unknown error'));
    }
  };

  const fetchMetrics = async () => {
    try {
      setError('');
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - 3600;
      const response = await observabilityAPI.getMetricsRange({
        query: metricQuery,
        start: startTime,
        end: endTime,
        step: '60s'
      });
      setMetrics(JSON.parse(response.data));
    } catch (err) {
      setError('Failed to fetch metrics: ' + (err.message || 'Unknown error'));
    }
  };

  const fetchTraces = async () => {
    try {
      setError('');
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - 3600;
      const response = await observabilityAPI.searchTraces({
        start: startTime,
        end: endTime,
        limit: 20
      });
      setTraces(JSON.parse(response.data));
    } catch (err) {
      setError('Failed to fetch traces: ' + (err.message || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const prepareChartData = (data) => {
    if (!data || !data.data || !data.data.result || data.data.result.length === 0) {
      return [];
    }
    const result = data.data.result[0];
    if (!result.values) return [];
    return result.values.map(v => ({
      time: new Date(v[0] * 1000).toLocaleTimeString(),
      value: parseFloat(v[1])
    }));
  };

  const renderLogs = () => {
    if (!logs) return <Alert variant="info">Click "Fetch Logs" to load data from Loki</Alert>;
    if (!logs.data || !logs.data.result) return <Alert variant="warning">No logs found</Alert>;

    return (
      <div>
        <Form.Group className="mb-3">
          <Form.Label>Loki Query (LogQL)</Form.Label>
          <Row>
            <Col>
              <Form.Control
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='{service="company"}'
              />
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={fetchLogs}>Fetch Logs</Button>
            </Col>
          </Row>
          <Form.Text className="text-muted">
            Example: {'{service="company"}'} |= "error"
          </Form.Text>
        </Form.Group>

        {logs.data.result.map((result, idx) => (
          <Card key={idx} className="mb-3">
            <Card.Header>
              <Badge bg="secondary">Stream {idx + 1}</Badge>
              <small className="ms-2 text-muted">
                {JSON.stringify(result.stream)}
              </small>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {result.values.map((v, i) => (
                <div key={i} className="mb-1 font-monospace" style={{ fontSize: '12px' }}>
                  <Badge bg="light" text="dark" className="me-2">
                    {new Date(parseInt(v[0]) / 1000000).toLocaleString()}
                  </Badge>
                  {v[1]}
                </div>
              ))}
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  const renderMetrics = () => {
    const chartData = prepareChartData(metrics);

    return (
      <div>
        <Form.Group className="mb-3">
          <Form.Label>Prometheus Query (PromQL)</Form.Label>
          <Row>
            <Col>
              <Form.Control
                value={metricQuery}
                onChange={(e) => setMetricQuery(e.target.value)}
                placeholder="up"
              />
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={fetchMetrics}>Fetch Metrics</Button>
            </Col>
          </Row>
          <Form.Text className="text-muted">
            Example: up, rate(http_requests_total[5m]), jvm_memory_used_bytes
          </Form.Text>
        </Form.Group>

        {chartData.length > 0 && (
          <Card className="mb-3">
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        )}

        {metrics && metrics.data && metrics.data.result && metrics.data.result.length > 0 && (
          <Card>
            <Card.Header>Latest Values</Card.Header>
            <Card.Body>
              <Table striped size="sm">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.data.result.map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <small>{JSON.stringify(r.metric)}</small>
                      </td>
                      <td>{r.value ? r.value[1] : 'N/A'}</td>
                      <td>
                        {r.value ? new Date(r.value[0] * 1000).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  const renderTraces = () => {
    if (!traces) return <Alert variant="info">Click "Fetch Traces" to load data from Tempo</Alert>;
    if (!traces.traces || traces.traces.length === 0) return <Alert variant="warning">No traces found</Alert>;

    return (
      <div>
        <Row className="mb-3">
          <Col>
            <Button variant="primary" onClick={fetchTraces}>Fetch Traces</Button>
          </Col>
        </Row>

        <Table striped hover>
          <thead>
            <tr>
              <th>Trace ID</th>
              <th>Root Service</th>
              <th>Root Operation</th>
              <th>Duration</th>
              <th>Spans</th>
            </tr>
          </thead>
          <tbody>
            {traces.traces.map((trace, idx) => (
              <tr key={idx}>
                <td>
                  <code>{trace.traceID}</code>
                </td>
                <td>{trace.rootServiceName}</td>
                <td>{trace.rootTraceName}</td>
                <td>{(trace.duration / 1000000).toFixed(2)} ms</td>
                <td>{trace.spans?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Observability Dashboard</h2>
        <div>
          <span className="me-3">Welcome, {localStorage.getItem('username')}</span>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Server Management */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>📡 My Servers</span>
          <Button variant="primary" size="sm" onClick={() => setShowAddServer(true)}>
            + Add Server
          </Button>
        </Card.Header>
        <Card.Body>
          {servers.length === 0 ? (
            <Alert variant="info">No servers added yet. Click "Add Server" to get started.</Alert>
          ) : (
            <Table striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Host</th>
                  <th>Port</th>
                  <th>Labels</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server) => (
                  <tr key={server.id}>
                    <td>{server.name}</td>
                    <td>{server.host}</td>
                    <td>{server.port}</td>
                    <td>{server.labels || '-'}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteServer(server.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Observability Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="logs" title="📝 Logs (Loki)">
          {renderLogs()}
        </Tab>
        <Tab eventKey="metrics" title="📊 Metrics (Prometheus)">
          {renderMetrics()}
        </Tab>
        <Tab eventKey="traces" title="🔍 Traces (Tempo)">
          {renderTraces()}
        </Tab>
      </Tabs>

      {/* Add Server Modal */}
      <Modal show={showAddServer} onHide={() => setShowAddServer(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Server</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Server Name</Form.Label>
              <Form.Control
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Host</Form.Label>
              <Form.Control
                value={newServer.host}
                onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                placeholder="localhost or 192.168.1.100"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Port</Form.Label>
              <Form.Control
                type="number"
                value={newServer.port}
                onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Labels (optional)</Form.Label>
              <Form.Control
                value={newServer.labels}
                onChange={(e) => setNewServer({ ...newServer, labels: e.target.value })}
                placeholder="service=company,env=prod"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddServer(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddServer}>
            Add Server
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Dashboard;
