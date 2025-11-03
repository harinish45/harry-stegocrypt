import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash, Key, Shield } from "lucide-react";
import { EncryptionMetadata } from "@/utils/encryptionAdvanced";

interface EncryptionMetadataDisplayProps {
  metadata: EncryptionMetadata | null;
}

export const EncryptionMetadataDisplay = ({ metadata }: EncryptionMetadataDisplayProps) => {
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

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Message Hash:</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono break-all max-w-[200px]">
            {metadata.messageHash}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
