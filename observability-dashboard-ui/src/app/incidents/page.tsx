"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { incidentApi } from "../../lib/api";
import { Plus, AlertTriangle, RefreshCw, X } from "lucide-react";

interface ApiIncident {
  id: number;
  title: string;
  description: string;
  severity: string;
  serviceName: string;
  status: string;
  source: string;
  createdAt: string;
  assignee?: string;
}

interface DisplayIncident {
  id: number;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  service: string;
  status: "open" | "investigating" | "resolved";
  source: string;
  createdAt: string;
  assignee?: string;
}

function mapIncident(i: ApiIncident): DisplayIncident {
  const s = i.status.toLowerCase();
  return {
    id: i.id,
    title: i.title,
    description: i.description || "",
    severity: (i.severity?.toLowerCase() || "warning") as DisplayIncident["severity"],
    service: i.serviceName,
    status: s === "open" ? "open" : s === "investigating" ? "investigating" : "resolved",
    source: i.source || "MANUAL",
    createdAt: i.createdAt,
    assignee: i.assignee || "Unassigned",
  };
}

export default function IncidentsPage() {
  const [sidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [incidents, setIncidents] = useState<DisplayIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "warning" as "critical" | "warning" | "info",
    service: "",
    assignee: "",
  });

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data: ApiIncident[] = await incidentApi.getAll();
      setIncidents(data.map(mapIncident));
    } catch (error) {
      console.error("Failed to load incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreate = async () => {
    try {
      await incidentApi.create({
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        serviceName: formData.service || "general",
        assignee: formData.assignee || undefined,
      });
      await loadIncidents();
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        severity: "warning",
        service: "",
        assignee: "",
      });
    } catch (error) {
      console.error("Failed to create incident:", error);
      alert("Failed to create incident");
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: DisplayIncident["status"],
  ) => {
    const apiStatus =
      status === "open"
        ? "OPEN"
        : status === "investigating"
          ? "INVESTIGATING"
          : "RESOLVED";
    try {
      await incidentApi.update(id, { status: apiStatus });
      await loadIncidents();
    } catch (error) {
      console.error("Failed to update incident:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this incident?")) return;
    try {
      await incidentApi.delete(id);
      await loadIncidents();
    } catch (error) {
      console.error("Failed to delete incident:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-100 text-red-700 border-red-200",
      warning: "bg-amber-100 text-amber-700 border-amber-200",
      info: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[severity as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-amber-100 text-amber-700",
      investigating: "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Incidents</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Production incidents — auto-created from critical alerts + manual
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Incident
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {incidents.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Open</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {incidents.filter((i) => i.status === "open").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Critical</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {
                        incidents.filter((i) => i.severity === "critical")
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Resolved</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {incidents.filter((i) => i.status === "resolved").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="card p-12 text-center">
                  <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Incidents
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Create your first incident to start tracking
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    New Incident
                  </button>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="card card-hover p-0 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(incident.severity)}`}
                            >
                              {incident.severity.toUpperCase()}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
                            >
                              {incident.status.toUpperCase()}
                            </span>
                            <span className="text-sm text-slate-500">
                              {incident.service}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {incident.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-4">
                            {incident.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            <span>Assignee: {incident.assignee}</span>
                            <span>
                              Created:{" "}
                              {new Date(incident.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {incident.status !== "resolved" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    incident.id,
                                    "investigating",
                                  )
                                }
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                              >
                                Investigating
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(incident.id, "resolved")
                                }
                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100"
                              >
                                Resolve
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(incident.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  New Incident
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Create a new incident to track
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Brief incident title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-modern resize-none"
                  rows={4}
                  placeholder="Describe the incident..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severity: e.target.value as any,
                      })
                    }
                    className="input-modern"
                  >
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Service
                  </label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    className="input-modern"
                    placeholder="Affected service"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) =>
                    setFormData({ ...formData, assignee: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Person responsible"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 btn-primary"
              >
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
