import { useState } from 'react';
import { Hash as HashIcon, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { digest, hmac, HashAlgo, toHex } from '@/lib/crypto/webcrypto';

const ALGOS: HashAlgo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function HashPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [algo, setAlgo] = useState<HashAlgo>('SHA-256');
  const [hashResult, setHashResult] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [hmacResult, setHmacResult] = useState('');

  const run = async () => setHashResult(await digest(algo, text));

  const runFile = async () => {
    if (!file) return;
    const buf = await file.arrayBuffer();
    const h = await crypto.subtle.digest(algo, buf);
    setFileHash(toHex(h));
  };

  const runHmac = async () => setHmacResult(await hmac(algo === 'SHA-1' ? 'SHA-256' : algo, hmacKey, text));

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    toast({ title: 'Copied' });
  };

  return (
    <div>
      <PageHeader icon={HashIcon} title="Hash & HMAC" description="SHA family digests and keyed HMAC for text or files." />
      <div className="mb-4 max-w-xs">
        <Label>Algorithm</Label>
        <Select value={algo} onValueChange={(v) => setAlgo(v as HashAlgo)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ALGOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="text">
        <TabsList className="mb-4"><TabsTrigger value="text">Text</TabsTrigger><TabsTrigger value="file">File</TabsTrigger><TabsTrigger value="hmac">HMAC</TabsTrigger></TabsList>
        <TabsContent value="text">
          <Card><CardHeader><CardTitle>Text hash</CardTitle><CardDescription>Compute a fingerprint of any string.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Type anything..." />
              <Button onClick={run}>Compute {algo}</Button>
              {hashResult && (
                <div className="p-3 bg-muted rounded flex items-start justify-between gap-2">
                  <code className="text-xs font-mono break-all">{hashResult}</code>
                  <Button size="icon" variant="ghost" onClick={() => copy(hashResult)}><Copy className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="file">
          <Card><CardHeader><CardTitle>File hash</CardTitle><CardDescription>Verify integrity of downloads or backups.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
              <Button disabled={!file} onClick={runFile}>Compute {algo}</Button>
              {fileHash && (
                <div className="p-3 bg-muted rounded flex items-start justify-between gap-2">
                  <code className="text-xs font-mono break-all">{fileHash}</code>
                  <Button size="icon" variant="ghost" onClick={() => copy(fileHash)}><Copy className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hmac">
          <Card><CardHeader><CardTitle>HMAC</CardTitle><CardDescription>Keyed message authentication (uses SHA-256 if SHA-1 selected).</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Key</Label><Input value={hmacKey} onChange={e => setHmacKey(e.target.value)} placeholder="Secret key" /></div>
              <div><Label>Message</Label><Textarea rows={3} value={text} onChange={e => setText(e.target.value)} /></div>
              <Button disabled={!hmacKey} onClick={runHmac}>Compute HMAC</Button>
              {hmacResult && (
                <div className="p-3 bg-muted rounded flex items-start justify-between gap-2">
                  <code className="text-xs font-mono break-all">{hmacResult}</code>
                  <Button size="icon" variant="ghost" onClick={() => copy(hmacResult)}><Copy className="w-4 h-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
