import { useState, useMemo } from 'react';
import { KeyRound, RefreshCw, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { generatePassword, estimateEntropy } from '@/lib/crypto/webcrypto';

export default function PasswordPage() {
  const { toast } = useToast();
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [pwd, setPwd] = useState('');

  const gen = () => setPwd(generatePassword({ length, upper, lower, digits, symbols }));

  const entropy = useMemo(() => Math.round(estimateEntropy(pwd)), [pwd]);
  const strength = entropy < 40 ? 'Weak' : entropy < 70 ? 'Fair' : entropy < 100 ? 'Strong' : 'Excellent';
  const strengthColor = entropy < 40 ? 'text-destructive' : entropy < 70 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div>
      <PageHeader icon={KeyRound} title="Password Generator" description="Cryptographically secure random passwords with entropy scoring." />
      <Card>
        <CardHeader><CardTitle>Generate</CardTitle><CardDescription>Uses crypto.getRandomValues under the hood.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between"><Label>Length</Label><span className="text-sm font-mono">{length}</span></div>
            <Slider value={[length]} min={8} max={64} onValueChange={([v]) => setLength(v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between"><Label>Uppercase</Label><Switch checked={upper} onCheckedChange={setUpper} /></div>
            <div className="flex items-center justify-between"><Label>Lowercase</Label><Switch checked={lower} onCheckedChange={setLower} /></div>
            <div className="flex items-center justify-between"><Label>Digits</Label><Switch checked={digits} onCheckedChange={setDigits} /></div>
            <div className="flex items-center justify-between"><Label>Symbols</Label><Switch checked={symbols} onCheckedChange={setSymbols} /></div>
          </div>
          <Button onClick={gen} className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Generate</Button>
          {pwd && (
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between gap-2">
                <code className="text-lg font-mono break-all">{pwd}</code>
                <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(pwd); toast({ title: 'Copied' }); }}><Copy className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Strength: <span className={strengthColor + ' font-medium'}>{strength}</span></span>
                  <span className="text-muted-foreground">{entropy} bits of entropy</span>
                </div>
                <Progress value={Math.min(100, entropy)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
