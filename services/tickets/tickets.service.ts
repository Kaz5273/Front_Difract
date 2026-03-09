import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Ticket } from '../api/types';

export interface ScanResult {
  valid: boolean;
  reason: string | null;
  scanned_at?: string;
  ticket?: Partial<Ticket> & {
    event?: { id: number; title: string; event_date: string };
    holder?: { id: number; name: string };
  };
}

export const ticketsService = {
  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>(ENDPOINTS.ME_TICKETS);
    return response.data;
  },

  getMyTicket: async (id: number | string): Promise<Ticket> => {
    const response = await apiClient.get<Ticket>(ENDPOINTS.ME_TICKET(id));
    return response.data;
  },

  // Remboursement — uniquement si has_insurance = true et avant la date de l'événement
  deleteTicket: async (id: number | string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(ENDPOINTS.ME_TICKET(id));
    return response.data;
  },

  // Scan à l'entrée de l'événement (usage organisateur)
  scanTicket: async (qrCode: string): Promise<ScanResult> => {
    const response = await apiClient.post<ScanResult>(ENDPOINTS.TICKETS_SCAN(qrCode));
    return response.data;
  },
};

export default ticketsService;
