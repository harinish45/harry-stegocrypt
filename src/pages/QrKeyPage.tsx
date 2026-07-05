import { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QrCode, Copy, Download, Upload, ScanLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

export default function QrKeyPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const [scanText, setScanText] = useState('');
  const [scanError, setScanError] = useState('');

  const gen = async () => {
    if (!text) return;
    setUrl(await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', width: 400, margin: 2 }));
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = url; a.download = 'qrcode.png'; a.click();
  };

  const decodeImage = useCallback((file: File) => {
    setScanText('');
    setScanError('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          setScanText(code.data);
        } else {
          setScanError('No QR code found in that image. Try a clearer or larger image.');
        }
      };
      img.onerror = () => setScanError('Could not load that image file.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) decodeImage(file);
  }, [decodeImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeImage(file);
  };

  return (
    <div className="space-y-8">
      <PageHeader icon={QrCode} title="QR Key Exchange" description="Turn a public key, message, or any text into a scannable QR code." />

      {/* Encode */}
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
          </CardContent>
        </Card>
      </div>

      {/* Decode */}
      <Card>
        <CardHeader><CardTitle>Decode QR</CardTitle><CardDescription>Upload a QR code image to read its contents.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">Click or drop a QR image here</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP</p>
          </div>

          {scanError && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">{scanError}</div>
          )}

          {scanText && (
            <div className="space-y-2">
              <Label>Decoded text</Label>
              <Textarea readOnly rows={6} value={scanText} className="font-mono text-xs" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(scanText); toast({ title: 'Decoded text copied' }); }}>
                  <Copy className="w-4 h-4 mr-2" />Copy
                </Button>
                <Button variant="outline" onClick={() => { setText(scanText); gen(); toast({ title: 'Loaded into encoder' }); }}>
                  <ScanLine className="w-4 h-4 mr-2" />Load into encoder
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
