import { useState, useRef, useEffect } from 'react';
import {
  Fingerprint,
  Upload,
  Layers,
  Activity,
  SplitSquareVertical,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { digest } from '@/lib/crypto/webcrypto';
import { calculateChannelEntropy, calculateBlockEntropy, ChannelEntropyResult, BlockEntropyResult } from '@/lib/forensics/entropy';
import { calculateChiSquare, ChiSquareResult } from '@/lib/forensics/chisquare';
import { extractBitPlane, BitPlaneChannel } from '@/lib/forensics/bitplane';
import { computeVisualDiff, VisualDiffResult } from '@/lib/forensics/visualDiff';

export default function ForensicsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [diffFile, setDiffFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<Uint8ClampedArray | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [hash, setHash] = useState<string>('');
  
  // Forensic Results
  const [chiResult, setChiResult] = useState<ChiSquareResult | null>(null);
  const [entropyResult, setEntropyResult] = useState<ChannelEntropyResult | null>(null);
  const [blockEntropyResult, setBlockEntropyResult] = useState<BlockEntropyResult | null>(null);
  const [visualDiffResult, setVisualDiffResult] = useState<VisualDiffResult | null>(null);

  // Bit-plane visualizer controls
  const [activePlane, setActivePlane] = useState<number>(0);
  const [activeChannel, setActiveChannel] = useState<BitPlaneChannel>('grayscale');

  // Canvas refs
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const bitplaneCanvasRef = useRef<HTMLCanvasElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render bit plane whenever plane/channel changes or new image loaded
  useEffect(() => {
    if (!imageData || !bitplaneCanvasRef.current || imageDims.width === 0) return;
    const canvas = bitplaneCanvasRef.current;
    canvas.width = imageDims.width;
    canvas.height = imageDims.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const planeData = extractBitPlane(imageData, imageDims.width, imageDims.height, {
      plane: activePlane,
      channel: activeChannel,
    });
    const imgDataObj = ctx.createImageData(imageDims.width, imageDims.height);
    imgDataObj.data.set(planeData);
    ctx.putImageData(imgDataObj, 0, 0);
  }, [imageData, imageDims, activePlane, activeChannel]);

  const loadPrimaryImage = async (inputFile: File) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(inputFile);
    img.src = objectUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = originalCanvasRef.current || document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    const buf = await inputFile.arrayBuffer();
    const fileHash = await digest('SHA-256', buf);

    setImageData(data);
    setImageDims({ width: img.width, height: img.height });
    setHash(fileHash);

    // Run Chi-Square and Entropy analysis
    const chi = calculateChiSquare(data, 'all');
    const channelH = calculateChannelEntropy(data);
    const blockH = calculateBlockEntropy(data, img.width, img.height, 16);

    setChiResult(chi);
    setEntropyResult(channelH);
    setBlockEntropyResult(blockH);
    URL.revokeObjectURL(objectUrl);
  };

  const handleDiffCompare = async () => {
    if (!file || !diffFile || !imageData) return;
    const img2 = new Image();
    const objectUrl = URL.createObjectURL(diffFile);
    img2.src = objectUrl;
    await new Promise((resolve) => { img2.onload = resolve; });

    const canvas2 = document.createElement('canvas');
    canvas2.width = imageDims.width;
    canvas2.height = imageDims.height;
    const ctx2 = canvas2.getContext('2d')!;
    ctx2.drawImage(img2, 0, 0, imageDims.width, imageDims.height);
    const data2 = ctx2.getImageData(0, 0, imageDims.width, imageDims.height).data;

    const diff = computeVisualDiff(imageData, data2, imageDims.width, imageDims.height, 60);
    setVisualDiffResult(diff);

    if (diffCanvasRef.current) {
      const dCanvas = diffCanvasRef.current;
      dCanvas.width = imageDims.width;
      dCanvas.height = imageDims.height;
      const dCtx = dCanvas.getContext('2d')!;
      const dImg = dCtx.createImageData(imageDims.width, imageDims.height);
      dImg.data.set(diff.diffImageData);
      dCtx.putImageData(dImg, 0, 0);
    }
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Fingerprint}
        title="Steganalysis & Forensics"
        description="Deep statistical analysis, Shannon entropy, Chi-square LSB attack, and bit-plane visualizer."
      />

      <Card>
        <CardHeader>
          <CardTitle>Inspect Carrier Image</CardTitle>
          <CardDescription>Upload an image for cryptographic & forensic analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f) loadPrimaryImage(f);
              }}
            />
            {file && (
              <Button onClick={() => loadPrimaryImage(file)} variant="outline">
                <Upload className="w-4 h-4 mr-2" /> Reload
              </Button>
            )}
          </div>
          <canvas ref={originalCanvasRef} className="hidden" />

          {chiResult && entropyResult && (
            <Tabs defaultValue="overview" className="w-full mt-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="overview"><Activity className="w-4 h-4 mr-2" /> Analysis</TabsTrigger>
                <TabsTrigger value="bitplanes"><Layers className="w-4 h-4 mr-2" /> Bit-Planes</TabsTrigger>
                <TabsTrigger value="diff"><SplitSquareVertical className="w-4 h-4 mr-2" /> Visual Diff</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Dimensions</div>
                    <div className="font-mono font-medium">{imageDims.width} × {imageDims.height}</div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Overall Entropy</div>
                    <div className="font-mono font-medium">{entropyResult.overall} bits</div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Chi² Statistic</div>
                    <div className="font-mono font-medium">{chiResult.chiSquare} (df={chiResult.degreesOfFreedom})</div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Stego Risk</div>
                    <Badge variant={chiResult.riskLevel === 'clean' ? 'secondary' : chiResult.riskLevel === 'suspicious' ? 'outline' : 'destructive'}>
                      {chiResult.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded border flex items-center gap-3">
                  {chiResult.riskLevel === 'clean' ? (
                    <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
                  ) : chiResult.riskLevel === 'suspicious' ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-destructive shrink-0" />
                  )}
                  <div>
                    <div className="font-medium">{chiResult.verdict}</div>
                    <div className="text-xs text-muted-foreground">
                      Probability of LSB tampering: {(chiResult.probabilityOfStego * 100).toFixed(2)}% | p-value: {chiResult.pValue}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-muted/60 rounded border">
                    <div className="text-xs text-red-500 font-semibold">Red Channel Entropy</div>
                    <div className="font-mono font-medium">{entropyResult.red} / 8.0</div>
                  </div>
                  <div className="p-3 bg-muted/60 rounded border">
                    <div className="text-xs text-green-500 font-semibold">Green Channel Entropy</div>
                    <div className="font-mono font-medium">{entropyResult.green} / 8.0</div>
                  </div>
                  <div className="p-3 bg-muted/60 rounded border">
                    <div className="text-xs text-blue-500 font-semibold">Blue Channel Entropy</div>
                    <div className="font-mono font-medium">{entropyResult.blue} / 8.0</div>
                  </div>
                  <div className="p-3 bg-muted/60 rounded border">
                    <div className="text-xs text-muted-foreground font-semibold">Alpha Channel Entropy</div>
                    <div className="font-mono font-medium">{entropyResult.alpha} / 8.0</div>
                  </div>
                </div>

                {blockEntropyResult && (
                  <div className="p-3 bg-muted/40 rounded border space-y-1">
                    <div className="text-xs font-semibold">Block-Level Spatial Entropy (16x16 blocks)</div>
                    <div className="text-xs text-muted-foreground flex gap-4">
                      <span>Min: {blockEntropyResult.minEntropy}</span>
                      <span>Avg: {blockEntropyResult.averageEntropy}</span>
                      <span>Max: {blockEntropyResult.maxEntropy}</span>
                      <span>Suspicious blocks: {blockEntropyResult.suspiciousBlocks.length}</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">SHA-256 Fingerprint</div>
                  <code className="text-xs font-mono break-all">{hash}</code>
                </div>
              </TabsContent>

              {/* Bitplanes Tab */}
              <TabsContent value="bitplanes" className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/40 p-4 rounded-lg">
                  <div className="w-full sm:w-1/2 space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label>Bit Plane: {activePlane} ({activePlane === 0 ? 'LSB - Least Significant' : activePlane === 7 ? 'MSB - Most Significant' : `Bit ${activePlane}`})</Label>
                    </div>
                    <Slider
                      min={0}
                      max={7}
                      step={1}
                      value={[activePlane]}
                      onValueChange={(val) => setActivePlane(val[0])}
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['grayscale', 'red', 'green', 'blue'] as BitPlaneChannel[]).map((chan) => (
                      <Button
                        key={chan}
                        size="sm"
                        variant={activeChannel === chan ? 'default' : 'outline'}
                        onClick={() => setActiveChannel(chan)}
                        className="capitalize text-xs"
                      >
                        {chan}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center p-4 border rounded-lg bg-black/5 dark:bg-black/40 overflow-auto">
                  <canvas ref={bitplaneCanvasRef} className="max-h-96 object-contain rounded shadow-sm" />
                </div>
              </TabsContent>

              {/* Visual Diff Tab */}
              <TabsContent value="diff" className="space-y-4 pt-4">
                <div className="p-4 bg-muted/40 rounded-lg space-y-3">
                  <Label>Compare with suspected or original counterpart image</Label>
                  <div className="flex gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDiffFile(e.target.files?.[0] || null)}
                    />
                    <Button onClick={handleDiffCompare} disabled={!diffFile}>
                      Compare
                    </Button>
                  </div>
                </div>

                {visualDiffResult && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-3 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">Changed Pixels</div>
                        <div className="font-mono font-medium">{visualDiffResult.changedPixels.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">Changed Area</div>
                        <div className="font-mono font-medium">{visualDiffResult.changedPercentage}%</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">MSE</div>
                        <div className="font-mono font-medium">{visualDiffResult.meanSquaredError}</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">PSNR</div>
                        <div className="font-mono font-medium">{visualDiffResult.psnr} dB</div>
                      </div>
                    </div>

                    <div className="flex justify-center p-4 border rounded-lg bg-black/5 dark:bg-black/40 overflow-auto">
                      <canvas ref={diffCanvasRef} className="max-h-96 object-contain rounded shadow-sm" />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
