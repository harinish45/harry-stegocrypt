import { useRef, useCallback, useState } from 'react';
import { EncryptionAlgorithm, EncryptionMetadata } from '@/utils/encryptionAdvanced';

interface WorkerResponse {
  success: boolean;
  data?: any;
  error?: string;
  progress?: number;
}

export const useCryptoWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/cryptoWorker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const encrypt = useCallback(
    (message: string, key: string, algorithm: EncryptionAlgorithm): Promise<{
      encrypted: string;
      metadata: EncryptionMetadata;
    }> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker();
        setIsProcessing(true);
        setProgress(0);

        const handleMessage = (e: MessageEvent<WorkerResponse>) => {
          if (e.data.progress !== undefined) {
            setProgress(e.data.progress);
          }

          if (e.data.success && e.data.data) {
            setIsProcessing(false);
            setProgress(100);
            worker.removeEventListener('message', handleMessage);
            resolve(e.data.data);
          } else if (!e.data.success) {
            setIsProcessing(false);
            worker.removeEventListener('message', handleMessage);
            reject(new Error(e.data.error || 'Encryption failed'));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'encrypt',
          payload: { message, key, algorithm }
        });
      });
    },
    [initWorker]
  );

  const decrypt = useCallback(
    (encryptedMessage: string, key: string, algorithm: EncryptionAlgorithm): Promise<string> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker();
        setIsProcessing(true);
        setProgress(0);

        const handleMessage = (e: MessageEvent<WorkerResponse>) => {
          if (e.data.progress !== undefined) {
            setProgress(e.data.progress);
          }

          if (e.data.success && e.data.data) {
            setIsProcessing(false);
            setProgress(100);
            worker.removeEventListener('message', handleMessage);
            resolve(e.data.data);
          } else if (!e.data.success) {
            setIsProcessing(false);
            worker.removeEventListener('message', handleMessage);
            reject(new Error(e.data.error || 'Decryption failed'));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'decrypt',
          payload: { encryptedMessage, key, algorithm }
        });
      });
    },
    [initWorker]
  );

  const generateHash = useCallback(
    (message: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const worker = initWorker();

        const handleMessage = (e: MessageEvent<WorkerResponse>) => {
          if (e.data.success && e.data.data) {
            worker.removeEventListener('message', handleMessage);
            resolve(e.data.data);
          } else if (!e.data.success) {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(e.data.error || 'Hash generation failed'));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({
          type: 'hash',
          payload: { message }
        });
      });
    },
    [initWorker]
  );

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    encrypt,
    decrypt,
    generateHash,
    progress,
    isProcessing,
    cleanup
  };
};
