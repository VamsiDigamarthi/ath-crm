import { Request, Response } from 'express';
import { FilingService } from './filing-service.js';

export class FilingController {
  public static async getQueue(req: Request, res: Response) {
    try {
      const { stage, search, filingAgentId, limit, offset } = req.query;
      const result = await FilingService.getFilingQueue({
        stage: stage as string,
        search: search as string,
        filingAgentId: filingAgentId as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch filing queue' });
    }
  }

  public static async getLeadById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const lead = await FilingService.getFilingLeadById(id);
      res.json(lead);
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'Filing lead not found' });
    }
  }

  public static async getStaff(req: Request, res: Response) {
    try {
      const staff = await FilingService.getFilingStaff();
      res.json(staff);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch filing staff' });
    }
  }

  public static async getManagerStats(req: Request, res: Response) {
    try {
      const stats = await FilingService.getManagerStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch manager stats' });
    }
  }

  public static async getMeFXML(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const xmlData = await FilingService.generateMeFXML(id);
      res.json(xmlData);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate MeF XML' });
    }
  }

  public static async transmit(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const userId = (req as any).user?.id || 'SYSTEM';
      const result = await FilingService.transmitToIRS(id, req.body || {}, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'IRS transmission failed' });
    }
  }

  public static async assign(req: Request, res: Response) {
    try {
      const { applicationIds, filingAgentId } = req.body;
      const managerUserId = (req as any).user?.id || 'SYSTEM';
      const result = await FilingService.assignFilingAgent(applicationIds, filingAgentId, managerUserId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to assign filing specialist' });
    }
  }

  public static async autoRoundRobin(req: Request, res: Response) {
    try {
      const managerUserId = (req as any).user?.id || 'SYSTEM';
      const result = await FilingService.autoRoundRobin(managerUserId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to balance filing workload' });
    }
  }
}
