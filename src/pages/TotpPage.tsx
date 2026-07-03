import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import { Timer, Trash2, Plus, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

interface Entry { id: string; issuer: string; label: string; secret: string; }
const STORE = 'totp-entries';

export default function TotpPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; }
  });
  const [issuer, setIssuer] = useState('');
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const save = (next: Entry[]) => { setEntries(next); localStorage.setItem(STORE, JSON.stringify(next)); };

  const add = () => {
    if (!secret) return;
    try {
      new OTPAuth.TOTP({ issuer, label, secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, '').toUpperCase()) }).generate();
      save([...entries, { id: crypto.randomUUID(), issuer, label, secret: secret.replace(/\s/g, '').toUpperCase() }]);
      setIssuer(''); setLabel(''); setSecret('');
    } catch {
      toast({ title: 'Invalid secret', description: 'Must be Base32.', variant: 'destructive' });
    }
  };

  const code = (e: Entry) => {
    try {
      const t = new OTPAuth.TOTP({ issuer: e.issuer, label: e.label, secret: OTPAuth.Secret.fromBase32(e.secret) });
      return t.generate();
    } catch { return '------'; }
  };

  const seconds = 30 - Math.floor(Date.now() / 1000) % 30;

  return (
    <div>
      <PageHeader icon={Timer} title="TOTP / 2FA Codes" description="RFC 6238 codes stored only in this browser's local storage." />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Add account</CardTitle><CardDescription>Paste the Base32 secret from the service.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Issuer</Label><Input value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="GitHub" /></div>
            <div><Label>Account</Label><Input value={label} onChange={e => setLabel(e.target.value)} placeholder="you@example.com" /></div>
            <div><Label>Secret (Base32)</Label><Input value={secret} onChange={e => setSecret(e.target.value)} placeholder="JBSWY3DPEHPK3PXP" className="font-mono" /></div>
            <Button onClick={add} className="w-full"><Plus className="w-4 h-4 mr-2" />Add</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Codes</CardTitle><CardDescription>Refreshes in {seconds}s</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {entries.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No accounts yet.</p>}
            {entries.map(e => {
              const c = code(e);
              return (
                <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground">{e.issuer || 'Account'}</div>
                    <div className="text-sm">{e.label}</div>
                    <div className="text-2xl font-mono tracking-widest mt-1">{c.slice(0,3)} {c.slice(3)}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(c); toast({ title: 'Code copied' }); }}><Copy className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => save(entries.filter(x => x.id !== e.id))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
