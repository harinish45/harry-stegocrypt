import { useState, useEffect } from 'react';
import { Link2, Copy, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { aesEncrypt, aesDecryptText, AesBundle } from '@/lib/crypto/webcrypto';

export default function OneTimeLinkPage() {
  const { toast } = useToast();
  const [msg, setMsg] = useState('');
  const [pwd, setPwd] = useState('');
  const [link, setLink] = useState('');
  const [incomingBundle, setIncomingBundle] = useState<AesBundle | null>(null);
  const [decrypted, setDecrypted] = useState('');
  const [readPwd, setReadPwd] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      try {
        const b = JSON.parse(atob(decodeURIComponent(hash.slice(6))));
        setIncomingBundle(b);
      } catch {}
    }
  }, []);

  const create = async () => {
    if (!msg || !pwd) return;
    const bundle = await aesEncrypt(msg, pwd);
    const payload = encodeURIComponent(btoa(JSON.stringify(bundle)));
    const url = `${window.location.origin}${window.location.pathname}#data=${payload}`;
    setLink(url);
  };

  const open = async () => {
    if (!incomingBundle) return;
    try {
      setDecrypted(await aesDecryptText(incomingBundle, readPwd));
    } catch {
      toast({ title: 'Wrong password', variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader icon={Link2} title="One-Time Decrypt Link" description="Encrypted payload lives in the URL fragment — never sent to any server." />
      {incomingBundle ? (
        <Card className="mb-6 border-primary/40">
          <CardHeader><CardTitle className="flex items-center gap-2"><Unlock className="w-5 h-5" />Incoming encrypted payload</CardTitle>
            <CardDescription>Enter the password shared out-of-band to reveal the message.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Input type="password" placeholder="Password" value={readPwd} onChange={e => setReadPwd(e.target.value)} />
            <Button onClick={open} className="w-full">Decrypt</Button>
            {decrypted && (
              <div className="p-3 bg-muted rounded whitespace-pre-wrap break-words">{decrypted}</div>
            )}
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Create link</CardTitle>
          <CardDescription>Share the URL over one channel and the password over another.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Secret message</Label><Textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} /></div>
          <Button onClick={create} disabled={!msg || !pwd} className="w-full">Create link</Button>
          {link && (
            <>
              <div className="p-3 bg-muted rounded text-xs font-mono break-all">{link}</div>
              <Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(link); toast({ title: 'Link copied' }); }}><Copy className="w-4 h-4 mr-2" />Copy link</Button>
              <Alert><AlertDescription className="text-xs">URL fragments (after #) are never transmitted to servers. The ciphertext stays local.</AlertDescription></Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
