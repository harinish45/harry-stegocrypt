import { useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

export default function QrKeyPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const gen = async () => {
    if (!text) return;
    setUrl(await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', width: 400, margin: 2 }));
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = url; a.download = 'qrcode.png'; a.click();
  };

  return (
    <div>
      <PageHeader icon={QrCode} title="QR Key Exchange" description="Turn a public key, message, or any text into a scannable QR code." />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Payload</CardTitle><CardDescription>Paste a public key (PEM/JWK), token, or link.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Label>Text</Label>
            <Textarea rows={10} value={text} onChange={e => setText(e.target.value)} placeholder="-----BEGIN PUBLIC KEY-----&#10;..." className="font-mono text-xs" />
            <Button onClick={gen} disabled={!text} className="w-full">Generate QR</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>QR</CardTitle><CardDescription>Scan with any QR reader.</CardDescription></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {url ? (
              <>
                <img src={url} alt="QR" className="rounded-lg border bg-white p-2" />
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(text); toast({ title: 'Payload copied' }); }}><Copy className="w-4 h-4 mr-2" />Copy text</Button>
                  <Button className="flex-1" onClick={download}><Download className="w-4 h-4 mr-2" />PNG</Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground py-20">QR will appear here</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
