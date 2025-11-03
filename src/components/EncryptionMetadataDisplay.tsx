import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Hash, Key, Shield, Copy, CheckCircle2 } from "lucide-react";
import { EncryptionMetadata } from "@/utils/encryptionAdvanced";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EncryptionMetadataDisplayProps {
  metadata: EncryptionMetadata | null;
}

export const EncryptionMetadataDisplay = ({ metadata }: EncryptionMetadataDisplayProps) => {
  const [hashCopied, setHashCopied] = useState(false);
  const { toast } = useToast();
  
  if (!metadata) return null;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case 'AES':
        return 'default';
      case 'RSA':
        return 'secondary';
      case 'ChaCha20':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(metadata.messageHash);
      setHashCopied(true);
      toast({
        title: "Hash Copied",
        description: "SHA-256 hash copied to clipboard"
      });
      setTimeout(() => setHashCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy hash",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Encryption Metadata
        </CardTitle>
        <CardDescription>
          Security information about the encrypted message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Algorithm:</span>
          </div>
          <Badge variant={getAlgorithmColor(metadata.algorithm)}>
            {metadata.algorithm}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Timestamp:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(metadata.timestamp)}
          </span>
        </div>

        {metadata.keyStrength && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Key Strength:</span>
            </div>
            <Badge variant="outline">{metadata.keyStrength}</Badge>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Message Hash (SHA-256):</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted p-2 rounded break-all">
              {metadata.messageHash}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyHash}
              className="shrink-0"
            >
              {hashCopied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this hash to verify message integrity after extraction
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
