import { useState, useRef } from 'react';
import { Fingerprint, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import { digest } from '@/lib/crypto/webcrypto';

export default function ForensicsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<{ hash: string; size: number; w: number; h: number; chi: number; verdict: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analyze = async () => {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(r => (img.onload = r));
    const canvas = canvasRef.current!;
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    // Chi-square LSB heuristic on R channel
    const counts = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) counts[data[i]]++;
    let chi = 0;
    for (let i = 0; i < 256; i += 2) {
      const observed = counts[i], expected = (counts[i] + counts[i + 1]) / 2;
      if (expected > 0) chi += ((observed - expected) ** 2) / expected;
    }

    const buf = await file.arrayBuffer();
    const hash = await digest('SHA-256', buf);
    const verdict = chi < 128 ? 'Likely contains hidden data (LSB steganography suspected)'
                  : chi < 400 ? 'Suspicious — statistical anomalies present'
                  : 'Clean — no LSB payload detected';
    setStats({ hash, size: file.size, w: img.width, h: img.height, chi: Math.round(chi), verdict });
  };

  return (
    <div>
      <PageHeader icon={Fingerprint} title="Image Forensics" description="Compute a fingerprint and run a chi-square LSB steganalysis heuristic." />
      <Card>
        <CardHeader><CardTitle>Analyze an image</CardTitle><CardDescription>All processing is client-side.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-center">
            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button onClick={analyze} disabled={!file}><Upload className="w-4 h-4 mr-2" />Analyze</Button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {stats && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted rounded"><div className="text-xs text-muted-foreground">Dimensions</div><div className="font-mono">{stats.w} × {stats.h}</div></div>
                <div className="p-3 bg-muted rounded"><div className="text-xs text-muted-foreground">Size</div><div className="font-mono">{(stats.size / 1024).toFixed(1)} KB</div></div>
                <div className="p-3 bg-muted rounded col-span-2"><div className="text-xs text-muted-foreground">SHA-256 fingerprint</div><code className="text-xs break-all">{stats.hash}</code></div>
                <div className="p-3 bg-muted rounded"><div className="text-xs text-muted-foreground">Chi² (R-channel)</div><div className="font-mono">{stats.chi}</div></div>
                <div className="p-3 rounded border border-primary/40 bg-primary/5"><div className="text-xs text-muted-foreground">Verdict</div><div className="text-sm font-medium">{stats.verdict}</div></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
