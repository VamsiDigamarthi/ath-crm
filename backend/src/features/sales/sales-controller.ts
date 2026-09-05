import { Request, Response } from 'express';
import { SalesService } from './sales-service.js';

export class SalesController {
  public static async getPipelineLeads(req: Request, res: Response) {
    try {
      const result = await SalesService.getPipelineLeads({
        stage: req.query.stage as string,
        search: req.query.search as string,
        salesAgentId: req.query.salesAgentId as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 100,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to fetch sales pipeline leads' });
    }
  }

  public static async getLeadById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const lead = await SalesService.getLeadById(id);
      if (!lead) {
        return res.status(404).json({ message: 'Sales Lead not found' });
      }
      res.json({ lead });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to fetch sales lead' });
    }
  }

  public static async getSalesStaff(_req: Request, res: Response) {
    try {
      const staff = await SalesService.getSalesStaff();
      res.json({ staff });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to fetch sales staff' });
    }
  }

  public static async getManagerStats(_req: Request, res: Response) {
    try {
      const stats = await SalesService.getManagerStats();
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to fetch sales manager stats' });
    }
  }

  public static async getAgentStats(req: Request, res: Response) {
    try {
      const salesAgentId = (req.query.salesAgentId as string) || req.currentUser?.id || (req as any).user?.id;
      if (!salesAgentId) {
        return res.status(400).json({ message: 'salesAgentId is required' });
      }
      const stats = await SalesService.getAgentStats(salesAgentId);
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to fetch sales agent stats' });
    }
  }

  public static async assignLead(req: Request, res: Response) {
    try {
      const { applicationId, applicationIds, salesAgentId } = req.body;
      const raw = applicationIds || applicationId;
      const ids = Array.isArray(raw)
        ? raw
        : typeof raw === 'string'
        ? raw.includes(',')
          ? raw.split(',').map((s) => s.trim())
          : [raw]
        : [];
      const managerUserId = req.currentUser?.id || (req as any).user?.id || '';
      const result = await SalesService.assignLead(ids, salesAgentId, managerUserId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to assign sales lead' });
    }
  }

  public static async autoRoundRobin(req: Request, res: Response) {
    try {
      const managerUserId = req.currentUser?.id || (req as any).user?.id || '';
      const result = await SalesService.autoRoundRobin(managerUserId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to execute auto round robin' });
    }
  }

  public static async dispatchToFiling(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.currentUser?.id || (req as any).user?.id || '';
      const result = await SalesService.dispatchToFiling(id, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to dispatch to filing' });
    }
  }

  public static async recordPayment(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.currentUser?.id || (req as any).user?.id || '';
      const result = await SalesService.recordPayment(id, req.body, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to record payment' });
    }
  }

  public static async recordEsign(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.currentUser?.id || (req as any).user?.id || '';
      const result = await SalesService.recordEsign(id, req.body, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to record Form 8879 authorization' });
    }
  }
}
