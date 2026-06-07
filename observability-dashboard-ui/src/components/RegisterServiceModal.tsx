'use client';

import { useState, useEffect } from 'react';
import { X, Globe, Server, Radio } from 'lucide-react';

interface RegisterServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterServiceData) => Promise<void>;
}

export interface RegisterServiceData {
  serviceName: string;
  serviceType: string;
  monitoringMode?: string;
  targetUrl?: string;
  scheme?: string;
  port: number;
  host: string;
  description: string;
  owner: string;
  environment?: string;
  metricsEndpoint?: string;
  healthCheckEndpoint?: string;
  metricsEnabled: boolean;
  logsEnabled: boolean;
  tracingEnabled: boolean;
}

function ModeCard({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border text-left w-full ${
        active ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="text-indigo-600">{icon}</div>
      <div className="font-medium text-sm text-slate-900 mt-2">{title}</div>
      <div className="text-xs text-slate-500">{desc}</div>
    </button>
  );
}

export default function RegisterServiceModal({
  isOpen,
  onClose,
  onSubmit,
}: RegisterServiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterServiceData>({
    serviceName: '',
    serviceType: 'external',
    monitoringMode: 'HTTP_PROBE',
    targetUrl: '',
    scheme: 'https',
    port: 443,
    host: '',
    description: '',
    owner: '',
    environment: 'production',
    metricsEnabled: false,
    logsEnabled: false,
    tracingEnabled: false,
    metricsEndpoint: '/actuator/prometheus',
    healthCheckEndpoint: '/',
  });

  const isHttpProbe =
    formData.monitoringMode === 'HTTP_PROBE' || formData.serviceType === 'external';
  const isOtlp = formData.monitoringMode === 'OTLP_PUSH';

  useEffect(() => {
    if (formData.serviceType === 'external') {
      setFormData((prev) => ({
        ...prev,
        monitoringMode: 'HTTP_PROBE',
        metricsEnabled: false,
        logsEnabled: false,
        tracingEnabled: false,
        port: 443,
        scheme: 'https',
      }));
    }
  }, [formData.serviceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: RegisterServiceData = { ...formData };
      if (!payload.monitoringMode) delete payload.monitoringMode;
      if (!payload.targetUrl?.trim()) delete payload.targetUrl;
      await onSubmit(payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Register Production System</h2>
            <p className="text-sm text-slate-500 mt-1">Any URL, cloud API, or remote server</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ModeCard active={isHttpProbe} icon={<Globe className="w-5 h-5" />} title="HTTP Probe" desc="Public URLs worldwide" onClick={() => setFormData({ ...formData, monitoringMode: 'HTTP_PROBE', serviceType: 'external', metricsEnabled: false, logsEnabled: false, tracingEnabled: false, port: 443 })} />
            <ModeCard active={formData.monitoringMode === 'METRICS_SCRAPE' || (!isHttpProbe && !isOtlp)} icon={<Server className="w-5 h-5" />} title="Metrics" desc="Scrape /metrics endpoint" onClick={() => setFormData({ ...formData, monitoringMode: 'METRICS_SCRAPE', metricsEnabled: true, port: 8080, scheme: 'http' })} />
            <ModeCard active={isOtlp} icon={<Radio className="w-5 h-5" />} title="OTLP" desc="Push to Alloy" onClick={() => setFormData({ ...formData, monitoringMode: 'OTLP_PUSH', metricsEnabled: false, tracingEnabled: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Name *</label>
            <input type="text" required value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} className="input-modern" placeholder="netflix-status, stripe-api" />
          </div>
          {isHttpProbe && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target URL</label>
              <input type="url" value={formData.targetUrl} onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })} className="input-modern" placeholder="https://www.netflix.com" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Host / Domain *</label>
              <input type="text" required value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} className="input-modern" placeholder="api.example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Port *</label>
              <input type="number" required value={formData.port} onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) || 443 })} className="input-modern" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">{loading ? 'Registering...' : 'Register'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
