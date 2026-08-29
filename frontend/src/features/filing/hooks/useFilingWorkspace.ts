import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { filingService } from '../services/filing-service';
import type { FilingLeadItem } from '../types/filing.types';
import toast from 'react-hot-toast';

export function useFilingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lead, setLead] = useState<FilingLeadItem | null>(null);
  const [xmlData, setXmlData] = useState<{
    submissionId: string;
    efin: string;
    etin: string;
    xml: string;
  } | null>(null);

  const fetchWorkspaceData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [leadData, xmlPayload] = await Promise.all([
        filingService.getLeadById(id),
        filingService.getMeFXML(id),
      ]);

      setLead(leadData);
      setXmlData(xmlPayload);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load filing workspace');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleTransmit = async () => {
    if (!id || !lead) return;
    setIsTransmitting(true);
    try {
      await filingService.transmitToIRS(id);
      toast.success('🎉 IRS E-File Accepted! Submission ID generated.');
      await fetchWorkspaceData();
    } catch (err: any) {
      toast.error(err.message || 'Transmission to IRS Gateway failed');
    } finally {
      setIsTransmitting(false);
    }
  };

  return {
    id,
    isLoading,
    isTransmitting,
    lead,
    xmlData,
    fetchWorkspaceData,
    handleTransmit,
  };
}
