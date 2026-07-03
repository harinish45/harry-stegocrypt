import { useState } from 'react';
import { FileLock, Upload, Download, Lock, Unlock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { aesEncrypt, aesDecrypt, AesBundle } from '@/lib/crypto/webcrypto';

export default function FileCryptoPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const doEncrypt = async () => {
    if (!file || !password) {
      toast({ title: 'Missing input', description: 'Choose a file and enter a password.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bundle = await aesEncrypt(buf, password);
      const blob = new Blob([JSON.stringify({ ...bundle, name: file.name })], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${file.name}.enc.json`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Encrypted', description: `${file.name} encrypted with AES-256-GCM.` });
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const doDecrypt = async () => {
    if (!file || !password) {
      toast({ title: 'Missing input', description: 'Choose a .enc.json file and enter the password.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const text = await file.text();
      const bundle = JSON.parse(text) as AesBundle & { name?: string };
      const pt = await aesDecrypt(bundle, password);
      const blob = new Blob([pt as BlobPart]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = bundle.name || 'decrypted.bin'; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Decrypted', description: 'File restored successfully.' });
    } catch (e) {
      toast({ title: 'Decryption failed', description: 'Wrong password or corrupt file.', variant: 'destructive' });
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        icon={FileLock}
        title="File Encryption"
        description="AES-256-GCM with PBKDF2 (250k iters). Everything runs in your browser via WebCrypto."
      />
      <Tabs defaultValue="encrypt">
        <TabsList className="grid grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="encrypt"><Lock className="w-4 h-4 mr-2" /> Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt"><Unlock className="w-4 h-4 mr-2" /> Decrypt</TabsTrigger>
        </TabsList>
        {(['encrypt', 'decrypt'] as const).map((mode) => (
          <TabsContent key={mode} value={mode}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{mode} a file</CardTitle>
                <CardDescription>
                  {mode === 'encrypt'
                    ? 'Select any file, provide a strong password, download a .enc.json bundle.'
                    : 'Select a .enc.json bundle produced by this tool and enter the password.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id={`file-${mode}`}
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor={`file-${mode}`} className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm">{file ? file.name : 'Click to choose a file'}</span>
                      {file && <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`pwd-${mode}`}>Password</Label>
                  <Input
                    id={`pwd-${mode}`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                  />
                </div>
                <Button className="w-full" disabled={busy} onClick={mode === 'encrypt' ? doEncrypt : doDecrypt}>
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {mode === 'encrypt' ? 'Encrypt & Download' : 'Decrypt & Download'}
                </Button>
                <Alert>
                  <AlertDescription className="text-xs">
                    Password is never sent anywhere. If you forget it, the file cannot be recovered.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
