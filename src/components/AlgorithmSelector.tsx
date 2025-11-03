import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EncryptionAlgorithm } from "@/utils/encryptionAdvanced";
import { Shield, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AlgorithmSelectorProps {
  value: EncryptionAlgorithm;
  onChange: (value: EncryptionAlgorithm) => void;
}

export const AlgorithmSelector = ({ value, onChange }: AlgorithmSelectorProps) => {
  const algorithmInfo = {
    AES: "Advanced Encryption Standard - Fast symmetric encryption, widely used in industry",
    RSA: "Rivest-Shamir-Adleman - Asymmetric encryption using public/private key pairs",
    ChaCha20: "Modern stream cipher - Excellent performance and security"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="algorithm" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Encryption Algorithm
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Choose the encryption algorithm for securing your message. Each has different characteristics:
              </p>
              <ul className="text-xs mt-2 space-y-1">
                <li><strong>AES:</strong> Best for speed and compatibility</li>
                <li><strong>RSA:</strong> Best for key exchange scenarios</li>
                <li><strong>ChaCha20:</strong> Best for modern applications</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={value} onValueChange={(val) => onChange(val as EncryptionAlgorithm)}>
        <SelectTrigger id="algorithm">
          <SelectValue placeholder="Select algorithm" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AES">
            <div className="flex flex-col items-start">
              <span className="font-medium">AES-256</span>
              <span className="text-xs text-muted-foreground">
                {algorithmInfo.AES}
              </span>
            </div>
          </SelectItem>
          <SelectItem value="RSA">
            <div className="flex flex-col items-start">
              <span className="font-medium">RSA-2048</span>
              <span className="text-xs text-muted-foreground">
                {algorithmInfo.RSA}
              </span>
            </div>
          </SelectItem>
          <SelectItem value="ChaCha20">
            <div className="flex flex-col items-start">
              <span className="font-medium">ChaCha20</span>
              <span className="text-xs text-muted-foreground">
                {algorithmInfo.ChaCha20}
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
