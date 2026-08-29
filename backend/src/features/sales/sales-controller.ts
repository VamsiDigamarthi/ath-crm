import { Request, Response } from 'express';
import { SalesService } from './sales-service.js';

export class SalesController {
  public static async getPipelineLeads(req: Request, res: Response) {
    try {
      const result = await SalesService.getPipelineLeads({
        stage: req.query.stage as string,
        search: req.query.search as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 50,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to fetch sales pipeline leads' });
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
      const managerUserId = (req as any).user?.id || 'SYSTEM';
      const result = await SalesService.assignLead(ids, salesAgentId, managerUserId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to assign sales lead' });
    }
  }

  public static async autoRoundRobin(req: Request, res: Response) {
    try {
      const managerUserId = (req as any).user?.id || 'SYSTEM';
      const result = await SalesService.autoRoundRobin(managerUserId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to execute auto round robin' });
    }
  }
}
