import { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';

interface BackupContextType {
  syncing: boolean;
  lastSync: string | null;
  syncToDrive: (data: any) => Promise<boolean>;
  restoreFromDrive: () => Promise<any | null>;
  isDriveConnected: boolean;
}

const BackupContext = createContext<BackupContextType | null>(null);

export function BackupProvider({ children }: { children: ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('nutriai_last_sync'));

  const getToken = () => localStorage.getItem('nutriai_google_token');

  const getDriveFileId = async (token: string, filename: string): Promise<string | null> => {
    const q = encodeURIComponent(`name='${filename}' and trashed=false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  };

  const syncToDrive = useCallback(async (data: any): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;
    
    setSyncing(true);
    try {
      const filename = 'nutriai_backup.json';
      const fileId = await getDriveFileId(token, filename);

      const metadata = {
        name: filename,
        mimeType: 'application/json'
      };

      const boundary = 'foo_bar_baz';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(data) +
        close_delim;

      let response;
      if (fileId) {
        // Update existing file
        response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        });
      } else {
        // Create new file
        response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        });
      }

      if (response.ok) {
        const time = new Date().toISOString();
        setLastSync(time);
        localStorage.setItem('nutriai_last_sync', time);
        setSyncing(false);
        return true;
      }
    } catch (e) {
      console.error('Drive sync failed', e);
    }
    setSyncing(false);
    return false;
  }, []);

  const restoreFromDrive = useCallback(async (): Promise<any | null> => {
    const token = getToken();
    if (!token) return null;

    setSyncing(true);
    try {
      const fileId = await getDriveFileId(token, 'nutriai_backup.json');
      if (fileId) {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSyncing(false);
          return data;
        }
      }
    } catch (e) {
      console.error('Drive restore failed', e);
    }
    setSyncing(false);
    return null;
  }, []);

  return (
    <BackupContext.Provider value={{
      syncing,
      lastSync,
      syncToDrive,
      restoreFromDrive,
      isDriveConnected: !!getToken()
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
