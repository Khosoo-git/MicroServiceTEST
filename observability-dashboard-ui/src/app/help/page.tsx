"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { Book, HelpCircle, MessageSquare, FileText, ExternalLink, Server, Activity, Zap, FileText as FileIcon } from "lucide-react";

export default function HelpPage() {
  const [sidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: Book },
    { id: "services", title: "Services", icon: Server },
    { id: "metrics", title: "Metrics", icon: Activity },
    { id: "logs", title: "Logs", icon: FileIcon },
    { id: "traces", title: "Traces", icon: Zap },
    { id: "incidents", title: "Incidents", icon: HelpCircle },
    { id: "api", title: "API Reference", icon: FileText },
  ];

  const content = {
    "getting-started": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started</h2>
          <p className="text-slate-600 mb-4">
            Welcome to the MicroService Observatory Platform! This dashboard helps you monitor and manage your microservices infrastructure.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Start</h3>
          <ol className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
              <span><strong>Register Services:</strong> Go to Services page and click "Register Service" to add your microservices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
              <span><strong>Monitor Health:</strong> Dashboard shows real-time health status of all registered services</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
              <span><strong>View Metrics:</strong> Check Metrics page for Prometheus metrics from your services</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
              <span><strong>Check Logs:</strong> Use Logs page to query and view logs from Loki</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">5</span>
              <span><strong>Track Traces:</strong> View distributed traces in Traces page from Tempo</span>
            </li>
          </ol>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">System Architecture</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold text-slate-900">Prometheus</div>
              <div className="text-sm text-slate-500">Metrics Collection</div>
              <div className="text-xs text-indigo-600 mt-2">:9090</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold text-slate-900">Loki</div>
              <div className="text-sm text-slate-500">Log Aggregation</div>
              <div className="text-xs text-indigo-600 mt-2">:3100</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold text-slate-900">Tempo</div>
              <div className="text-sm text-slate-500">Distributed Tracing</div>
              <div className="text-xs text-indigo-600 mt-2">:3200</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold text-slate-900">Service API</div>
              <div className="text-sm text-slate-500">Backend API</div>
              <div className="text-xs text-indigo-600 mt-2">:8085</div>
            </div>
          </div>
        </div>
      </div>
    ),

    "services": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Services Management</h2>
          <p className="text-slate-600 mb-4">
            Register and manage your microservices for monitoring.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">How to Register a Service</h3>
          <ol className="space-y-3 text-slate-600">
            <li>Go to <strong>Services</strong> page</li>
            <li>Click <strong>"Register Service"</strong> button</li>
            <li>Fill in the form:
              <ul className="mt-2 ml-6 space-y-1 text-sm">
                <li><strong>Service Name:</strong> Unique name for your service</li>
                <li><strong>Service Type:</strong> Select from dropdown (Web, API, Database, etc.)</li>
                <li><strong>Port:</strong> Service port number (e.g., 8080)</li>
                <li><strong>Host:</strong> Hostname or IP (e.g., localhost, 192.168.1.100)</li>
              </ul>
            </li>
            <li>Enable monitoring options (Metrics, Logs, Tracing)</li>
            <li>Click <strong>"Register"</strong></li>
          </ol>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Service Health Monitoring</h3>
          <p className="text-slate-600 mb-3">
            Services are automatically health-checked every 10 seconds:
          </p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <strong>HEALTHY:</strong> Service is responding normally
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              <strong>UNHEALTHY:</strong> Service is having issues
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <strong>DOWN:</strong> Service is not responding
            </li>
          </ul>
        </div>
      </div>
    ),

    "metrics": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Metrics</h2>
          <p className="text-slate-600 mb-4">
            View real-time metrics from Prometheus.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">PromQL Queries</h3>
          <p className="text-slate-600 mb-3">Use PromQL to query metrics:</p>
          <div className="bg-slate-100 rounded-lg p-4 font-mono text-sm space-y-2">
            <div><span className="text-slate-500"># Check if service is up</span></div>
            <div className="text-indigo-600">up{"{job=\"company\"}"}</div>
            <div className="border-t border-slate-200 pt-2"></div>
            <div><span className="text-slate-500"># HTTP request rate</span></div>
            <div className="text-indigo-600">rate(http_server_requests_seconds_count[1m])</div>
            <div className="border-t border-slate-200 pt-2"></div>
            <div><span className="text-slate-500"># JVM memory usage</span></div>
            <div className="text-indigo-600">jvm_memory_used_bytes</div>
          </div>
        </div>
      </div>
    ),

    "logs": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Logs</h2>
          <p className="text-slate-600 mb-4">
            Query and view logs from Loki using LogQL.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">LogQL Examples</h3>
          <div className="bg-slate-100 rounded-lg p-4 font-mono text-sm space-y-2">
            <div><span className="text-slate-500"># Logs from company service</span></div>
            <div className="text-indigo-600">{"{job=\"company\"}"}</div>
            <div className="border-t border-slate-200 pt-2"></div>
            <div><span className="text-slate-500"># Error logs only</span></div>
            <div className="text-indigo-600">{"{job=~\".*\"} |= \"ERROR\""}</div>
            <div className="border-t border-slate-200 pt-2"></div>
            <div><span className="text-slate-500"># Logs containing specific text</span></div>
            <div className="text-indigo-600">{"{job=\"gateway\"} |= \"timeout\""}</div>
          </div>
        </div>
      </div>
    ),

    "traces": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Traces</h2>
          <p className="text-slate-600 mb-4">
            View distributed traces from Tempo.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Configuring Tracing</h3>
          <p className="text-slate-600 mb-3">Add OpenTelemetry to your service:</p>
          <div className="bg-slate-100 rounded-lg p-4 font-mono text-sm">
            <div className="text-slate-500"># Environment variables</div>
            <div>OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318</div>
            <div>OTEL_TRACES_EXPORTER=otlp</div>
            <div>OTEL_SERVICE_NAME=your-service-name</div>
          </div>
        </div>
      </div>
    ),

    "incidents": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Incidents</h2>
          <p className="text-slate-600 mb-4">
            Manually create and track incidents.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Creating an Incident</h3>
          <ol className="space-y-3 text-slate-600">
            <li>Go to <strong>Incidents</strong> page</li>
            <li>Click <strong>"New Incident"</strong></li>
            <li>Fill in:
              <ul className="mt-2 ml-6 space-y-1 text-sm">
                <li><strong>Title:</strong> Brief description</li>
                <li><strong>Description:</strong> Detailed information</li>
                <li><strong>Severity:</strong> Critical, Warning, or Info</li>
                <li><strong>Service:</strong> Affected service</li>
                <li><strong>Assignee:</strong> Person responsible</li>
              </ul>
            </li>
            <li>Click <strong>"Create Incident"</strong></li>
          </ol>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Incident Statuses</h3>
          <ul className="space-y-2 text-slate-600">
            <li><strong>Open:</strong> Newly created, needs attention</li>
            <li><strong>Investigating:</strong> Team is working on it</li>
            <li><strong>Resolved:</strong> Issue has been fixed</li>
          </ul>
        </div>
      </div>
    ),

    "api": (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">API Reference</h2>
          <p className="text-slate-600 mb-4">
            REST API endpoints for programmatic access.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Services API</h3>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <div className="text-green-600 font-semibold">GET /api/services</div>
              <div className="text-slate-500">Get all registered services</div>
            </div>
            <div className="border-t border-slate-200"></div>
            <div>
              <div className="text-blue-600 font-semibold">POST /api/services</div>
              <div className="text-slate-500">Register a new service</div>
              <div className="bg-slate-100 p-2 mt-1 rounded">
                {"{ \"serviceName\": \"my-service\", \"port\": 8080, \"host\": \"localhost\" }"}
              </div>
            </div>
            <div className="border-t border-slate-200"></div>
            <div>
              <div className="text-red-600 font-semibold">DELETE /api/services/:id</div>
              <div className="text-slate-500">Delete a service</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Health API</h3>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <div className="text-green-600 font-semibold">GET /api/admin/health-stats</div>
              <div className="text-slate-500">Get real-time health statistics</div>
            </div>
            <div className="border-t border-slate-200"></div>
            <div>
              <div className="text-green-600 font-semibold">GET /api/activities</div>
              <div className="text-slate-500">Get activity log</div>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Help & Documentation</h1>
              <p className="text-slate-600">Learn how to use the MicroService Observatory Platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="md:col-span-1">
                <div className="card p-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeSection === section.id
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="md:col-span-3">
                {content[activeSection as keyof typeof content]}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
