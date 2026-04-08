import { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface BackupContextType {
  syncing: boolean;
  lastSync: string | null;
  syncToDrive: (data: any) => Promise<boolean>;
  restoreFromDrive: () => Promise<any | null>;
  isDriveConnected: boolean;
  connectDrive: () => void;
  disconnectDrive: () => void;
  syncError: string | null;
}

const BackupContext = createContext<BackupContextType | null>(null);

export function BackupProvider({ children }: { children: ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('nutriai_last_sync'));
  const [syncError, setSyncError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('nutriai_google_token');

  const connectDrive = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google login success, token received:', tokenResponse.access_token?.substring(0, 10) + '...');
      localStorage.setItem('nutriai_google_token', tokenResponse.access_token);
      setSyncError(null);
      window.location.reload();
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setSyncError('Falha ao conectar com Google Drive');
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const disconnectDrive = () => {
    localStorage.removeItem('nutriai_google_token');
    localStorage.removeItem('nutriai_last_sync');
    setLastSync(null);
    setSyncError(null);
    window.location.reload();
  };

  const getDriveFileId = async (token: string, filename: string): Promise<string | null> => {
    try {
      const q = encodeURIComponent(`name='${filename}' and trashed=false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Drive file query failed:', res.status, errorText);
        if (res.status === 401) {
          throw new Error('TOKEN_EXPIRED');
        }
        return null;
      }

      const data = await res.json();
      console.log('Drive files found:', data.files?.length || 0);
      return data.files && data.files.length > 0 ? data.files[0].id : null;
    } catch (e) {
      console.error('getDriveFileId error:', e);
      throw e;
    }
  };

  const syncToDrive = useCallback(async (data: any): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      setSyncError('Token não encontrado. Conecte novamente ao Drive.');
      return false;
    }

    setSyncing(true);
    setSyncError(null);

    try {
      console.log('Starting backup to Drive...');
      const filename = 'nutriai_backup.json';
      const fileId = await getDriveFileId(token, filename);
      console.log('Existing file ID:', fileId || 'none (will create new)');

      // Create multipart body properly
      const metadata = {
        name: filename,
        mimeType: 'application/json'
      };

      const jsonData = JSON.stringify(data);
      console.log('Data size:', jsonData.length, 'bytes');

      const boundary = '-------314159265358979323846264';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n' +
        '\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n' +
        '\r\n' +
        jsonData +
        close_delim;

      let response;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      };

      if (fileId) {
        // Update existing file
        console.log('Updating existing file...');
        response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
          method: 'PATCH',
          headers,
          body: multipartRequestBody
        });
      } else {
        // Create new file
        console.log('Creating new file...');
        response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers,
          body: multipartRequestBody
        });
      }

      console.log('Drive response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Drive upload failed:', response.status, errorText);

        if (response.status === 401) {
          setSyncError('Sessão expirada. Desconecte e conecte novamente ao Drive.');
          return false;
        }

        setSyncError(`Erro ${response.status}: Falha ao salvar no Drive`);
        return false;
      }

      const responseData = await response.json();
      console.log('Drive upload success, file ID:', responseData.id);

      const time = new Date().toISOString();
      setLastSync(time);
      localStorage.setItem('nutriai_last_sync', time);
      setSyncing(false);
      return true;

    } catch (e: any) {
      console.error('Drive sync failed:', e);

      if (e.message === 'TOKEN_EXPIRED' || e.message?.includes('Unauthorized')) {
        setSyncError('Token expirado. Desconecte e conecte novamente.');
      } else if (e.message?.includes('Failed to fetch') || e.message?.includes('Network')) {
        setSyncError('Erro de conexão. Verifique sua internet.');
      } else {
        setSyncError(`Erro: ${e.message || 'Falha ao sincronizar'}`);
      }

      setSyncing(false);
      return false;
    }
  }, []);

  const restoreFromDrive = useCallback(async (): Promise<any | null> => {
    const token = getToken();
    if (!token) {
      setSyncError('Token não encontrado. Conecte ao Drive primeiro.');
      return null;
    }

    setSyncing(true);
    setSyncError(null);

    try {
      console.log('Restoring from Drive...');
      const fileId = await getDriveFileId(token, 'nutriai_backup.json');

      if (!fileId) {
        console.log('No backup file found on Drive');
        setSyncing(false);
        return null;
      }

      console.log('Downloading file ID:', fileId);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Drive download failed:', res.status, errorText);

        if (res.status === 401) {
          setSyncError('Sessão expirada. Desconecte e conecte novamente ao Drive.');
        } else {
          setSyncError(`Erro ${res.status}: Falha ao baixar backup`);
        }
        setSyncing(false);
        return null;
      }

      const data = await res.json();
      console.log('Restore successful, data keys:', Object.keys(data));

      setSyncing(false);
      return data;

    } catch (e: any) {
      console.error('Drive restore failed:', e);

      if (e.message?.includes('Failed to fetch') || e.message?.includes('Network')) {
        setSyncError('Erro de conexão. Verifique sua internet.');
      } else {
        setSyncError(`Erro ao restaurar: ${e.message || 'Falha desconhecida'}`);
      }

      setSyncing(false);
      return null;
    }
  }, []);

  return (
    <BackupContext.Provider value={{
      syncing,
      lastSync,
      syncToDrive,
      restoreFromDrive,
      isDriveConnected: !!getToken(),
      connectDrive,
      disconnectDrive,
      syncError
    }}>
      {children}
    </BackupContext.Provider>
  );
}

export function useBackup() {
  const ctx = useContext(BackupContext);
  if (!ctx) throw new Error('useBackup within BackupProvider');
  return ctx;
}
