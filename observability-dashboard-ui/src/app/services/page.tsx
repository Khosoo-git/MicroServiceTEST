"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import RegisterServiceModal from "../../components/RegisterServiceModal";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Server,
  CheckCircle2,
  AlertCircle,
  Activity,
  Edit2,
  Trash2,
  Globe,
  RefreshCw,
} from "lucide-react";

interface Service {
  id: number;
  serviceName: string;
  serviceType: string;
  host: string;
  port: number;
  status: "HEALTHY" | "UNHEALTHY" | "DOWN" | "UNKNOWN";
  metricsEnabled: boolean;
  logsEnabled: boolean;
  tracingEnabled: boolean;
  owner: string;
  uptime: number;
  lastResponseTime?: number;
}

export default function ServicesPage() {
  const [sidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch REAL services from API
  const loadServices = async () => {
    try {
      const response = await fetch("http://localhost:8085/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      setServices([]); // Set empty array on error
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  // Fetch REAL health stats
  const loadHealthStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:8085/api/admin/health-stats",
      );
      if (response.ok) {
        const healthData = await response.json();

        // Update services with real health data
        setServices((prevServices) =>
          prevServices.map((service) => {
            const stats = healthData.services[service.serviceName];
            if (stats) {
              return {
                ...service,
                status: stats.status,
                uptime: stats.uptimePercentage,
                lastResponseTime: stats.lastResponseTime,
              };
            }
            return service;
          }),
        );
      }
    } catch (error) {
      console.error("Failed to load health stats:", error);
    }
  };

  useEffect(() => {
    loadServices();
    // Wait for services to load, then get health stats
    setTimeout(loadHealthStats, 1000);

    // Auto-refresh health stats every 10 seconds (REAL-TIME)
    const interval = setInterval(loadHealthStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterService = async (data: any) => {
    try {
      const response = await fetch("http://localhost:8085/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadServices();
        setTimeout(loadHealthStats, 2000);
        setShowModal(false);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      alert("Failed to register: " + error.message);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`http://localhost:8085/api/services/${id}`, {
        method: "DELETE",
      });
      await loadServices();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    await loadHealthStats();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      HEALTHY: "text-green-600 bg-green-50",
      UNHEALTHY: "text-amber-600 bg-amber-50",
      DOWN: "text-red-600 bg-red-50",
      UNKNOWN: "text-gray-600 bg-gray-50",
    };
    return colors[status] || colors.UNKNOWN;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <CheckCircle2 className="w-4 h-4" />;
      case "UNHEALTHY":
      case "DOWN":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "microservice":
        return <Server className="w-4 h-4" />;
      case "api":
        return <Activity className="w-4 h-4" />;
      case "database":
        return <Server className="w-4 h-4" />;
      case "external":
        return <Globe className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.host.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || service.serviceType === selectedType;
    const matchesStatus =
      selectedStatus === "all" || service.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-slate-600">Loading REAL services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onSearch={setSearchQuery} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Real-time monitoring - Updates every 10 seconds
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Register Service
                </button>
              </div>
            </div>

            {/* Stats Cards with REAL data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Services</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {services.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Healthy</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {services.filter((s) => s.status === "HEALTHY").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Unhealthy</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {
                        services.filter(
                          (s) =>
                            s.status === "UNHEALTHY" || s.status === "DOWN",
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Uptime</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {services.length > 0
                        ? (
                            services.reduce(
                              (acc, s) => acc + (s.uptime || 0),
                              0,
                            ) / services.length
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search services..."
                      className="input-modern pl-9 w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="input-modern w-40"
                    >
                      <option value="all">All Types</option>
                      <option value="microservice">Microservice</option>
                      <option value="api">API</option>
                      <option value="database">Database</option>
                      <option value="external">External</option>
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="input-modern w-40"
                    >
                      <option value="all">All Statuses</option>
                      <option value="HEALTHY">Healthy</option>
                      <option value="UNHEALTHY">Unhealthy</option>
                      <option value="DOWN">Down</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  Showing {filteredServices.length} of {services.length}{" "}
                  services
                </div>
              </div>
            </div>

            {/* Services Grid with REAL status */}
            {filteredServices.length === 0 ? (
              <div className="card p-12 text-center">
                <Server className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No services found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || selectedType !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by registering your first service"}
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Register Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div key={service.id} className="card card-hover">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(service.status)}`}
                        >
                          {getTypeIcon(service.serviceType)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {service.serviceName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {service.serviceType}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      {/* REAL Status */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Status</span>
                        <div
                          className={`flex items-center gap-1.5 font-medium ${getStatusColor(service.status)}`}
                        >
                          {getStatusIcon(service.status)}
                          <span className="capitalize">{service.status}</span>
                        </div>
                      </div>

                      {/* REAL Response Time */}
                      {service.lastResponseTime && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Response Time</span>
                          <span className="font-medium text-slate-900">
                            {service.lastResponseTime}ms
                          </span>
                        </div>
                      )}

                      {/* REAL Uptime */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Uptime</span>
                        <span
                          className={`font-medium ${service.uptime >= 95 ? "text-green-600" : service.uptime >= 80 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {service.uptime ? service.uptime.toFixed(1) : 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Host</span>
                        <span className="font-medium text-slate-900">
                          {service.host}:{service.port}
                        </span>
                      </div>

                      {service.owner && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Owner</span>
                          <span className="font-medium text-slate-900">
                            {service.owner}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Monitoring Badges */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <div
                        className={`flex-1 text-center px-2 py-1.5 rounded-lg text-xs font-medium ${
                          service.metricsEnabled
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Metrics
                      </div>
                      <div
                        className={`flex-1 text-center px-2 py-1.5 rounded-lg text-xs font-medium ${
                          service.logsEnabled
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Logs
                      </div>
                      <div
                        className={`flex-1 text-center px-2 py-1.5 rounded-lg text-xs font-medium ${
                          service.tracingEnabled
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Tracing
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button className="flex-1 btn-secondary text-sm py-1.5 flex items-center justify-center gap-2">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <RegisterServiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleRegisterService}
      />
    </div>
  );
}
