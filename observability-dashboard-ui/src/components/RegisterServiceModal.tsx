'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface RegisterServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterServiceData) => Promise<void>;
}

interface RegisterServiceData {
  serviceName: string;
  serviceType: string;
  port: number;
  host: string;
  description: string;
  owner: string;
  metricsEnabled: boolean;
  logsEnabled: boolean;
  tracingEnabled: boolean;
}

export default function RegisterServiceModal({
  isOpen,
  onClose,
  onSubmit,
}: RegisterServiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterServiceData>({
    serviceName: '',
    serviceType: 'web',
    port: 8080,
    host: '',
    description: '',
    owner: '',
    metricsEnabled: true,
    logsEnabled: true,
    tracingEnabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to register service:', error);
      alert('Failed to register service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Register New Service
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Add a new system to monitor
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Service Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                placeholder="e.g., Production API, Netflix, AWS EC2"
                className="input-modern"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Service Type *
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                className="input-modern"
              >
                <option value="web">Web Application</option>
                <option value="api">API / REST Service</option>
                <option value="cloud">Cloud Service (AWS, Azure, GCP)</option>
                <option value="database">Database</option>
                <option value="server">Server / VM</option>
                <option value="container">Container / Kubernetes</option>
                <option value="external">External Internet Service</option>
                <option value="microservice">Microservice</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Port */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Port *
              </label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: parseInt(e.target.value) })
                }
                placeholder="8080"
                className="input-modern"
              />
            </div>

            {/* Host */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Host / IP / Domain *
              </label>
              <input
                type="text"
                required
                value={formData.host}
                onChange={(e) =>
                  setFormData({ ...formData, host: e.target.value })
                }
                placeholder="e.g., localhost, netflix.com, ec2-52-12-34-56.compute.amazonaws.com"
                className="input-modern"
              />
              <p className="text-xs text-slate-500 mt-1">
                Can be: Domain name, Public IP, Private IP, DNS name
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the service..."
                rows={2}
                className="input-modern resize-none"
              />
            </div>

            {/* Owner */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Owner / Team
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                placeholder="e.g., Platform Team, DevOps"
                className="input-modern"
              />
            </div>

            {/* Monitoring Options */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monitoring Capabilities
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.metricsEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metricsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Metrics</div>
                    <div className="text-xs text-slate-500">
                      Prometheus metrics endpoint (/actuator/prometheus)
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.logsEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logsEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Logs</div>
                    <div className="text-xs text-slate-500">
                      Centralized logging (writes to /logs/{'<service>'}.log)
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.tracingEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tracingEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Tracing</div>
                    <div className="text-xs text-slate-500">
                      OpenTelemetry tracing (OTLP endpoint)
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
