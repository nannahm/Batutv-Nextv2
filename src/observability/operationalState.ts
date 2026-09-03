/**
 * BatuTV News Portal & CMS — Continuous Production Operational State Tracker (P0-12)
 */

import { IncidentSeverity, IncidentPhase } from './runbook';
import { AlertSeverity } from './alertPolicy';

export interface ActiveIncident {
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  phase: IncidentPhase;
  startTime: string;
  lastUpdated: string;
  leadResponder?: string;
  containmentNotes?: string;
}

export interface ActiveAlert {
  alertCode: string;
  severity: AlertSeverity;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}

export interface OperationalStateSnapshot {
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  lastHealthCheckTime: string;
  activeIncidents: ActiveIncident[];
  activeAlerts: ActiveAlert[];
  activeRealtimeListenersCount: number;
  lastSuccessfulBackupTime: string;
  isMaintenanceMode: boolean;
}

class OperationalStateManager {
  private state: OperationalStateSnapshot = {
    systemHealth: 'HEALTHY',
    lastHealthCheckTime: new Date().toISOString(),
    activeIncidents: [],
    activeAlerts: [],
    activeRealtimeListenersCount: 0,
    lastSuccessfulBackupTime: new Date(Date.now() - 4.2 * 3600 * 1000).toISOString(),
    isMaintenanceMode: false,
  };

  public getSnapshot(): OperationalStateSnapshot {
    return { ...this.state };
  }

  public updateHealth(health: 'HEALTHY' | 'DEGRADED' | 'OUTAGE') {
    this.state.systemHealth = health;
    this.state.lastHealthCheckTime = new Date().toISOString();
  }

  public trackActiveListeners(count: number) {
    this.state.activeRealtimeListenersCount = count;
  }

  public raiseAlert(alertCode: string, severity: AlertSeverity, message: string) {
    const existing = this.state.activeAlerts.find((a) => a.alertCode === alertCode);
    if (!existing) {
      this.state.activeAlerts.push({
        alertCode,
        severity,
        message,
        triggeredAt: new Date().toISOString(),
        acknowledged: false,
      });
    }
  }

  public clearAlert(alertCode: string) {
    this.state.activeAlerts = this.state.activeAlerts.filter((a) => a.alertCode !== alertCode);
  }

  public declareIncident(incidentId: string, title: string, severity: IncidentSeverity): ActiveIncident {
    let incident = this.state.activeIncidents.find((i) => i.incidentId === incidentId);
    if (!incident) {
      incident = {
        incidentId,
        title,
        severity,
        phase: 'DETECTED',
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      this.state.activeIncidents.push(incident);
      this.state.systemHealth = 'DEGRADED';
    }
    return incident;
  }

  public transitionIncidentPhase(incidentId: string, phase: IncidentPhase, notes?: string) {
    const incident = this.state.activeIncidents.find((i) => i.incidentId === incidentId);
    if (incident) {
      incident.phase = phase;
      incident.lastUpdated = new Date().toISOString();
      if (notes) incident.containmentNotes = notes;
      if (phase === 'CLOSED') {
        this.state.activeIncidents = this.state.activeIncidents.filter((i) => i.incidentId !== incidentId);
        if (this.state.activeIncidents.length === 0) {
          this.state.systemHealth = 'HEALTHY';
        }
      }
    }
  }
}

export const operationalState = new OperationalStateManager();
