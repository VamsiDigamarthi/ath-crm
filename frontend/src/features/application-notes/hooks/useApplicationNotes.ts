import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { applicationNotesService, type ApplicationNote, type NoteTeam } from '../services/application-notes-service';

export const useApplicationNotes = (applicationId?: string) => {
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [targetTeam, setTargetTeam] = useState<NoteTeam>('ALL');

  const load = useCallback(async () => {
    if (!applicationId) return;
    try {
      const res = await applicationNotesService.list(applicationId);
      setNotes(res.data);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  const addNote = async () => {
    if (!applicationId) return;
    const text = message.trim();
    if (text.length < 2) {
      toast.error('Write a note first');
      return;
    }
    setIsSaving(true);
    try {
      const res = await applicationNotesService.create(applicationId, targetTeam, text);
      setNotes(res.data);
      setMessage('');
      toast.success('Note added');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to add note');
    } finally {
      setIsSaving(false);
    }
  };

  return { notes, isLoading, isSaving, message, setMessage, targetTeam, setTargetTeam, addNote, refresh: load };
};
