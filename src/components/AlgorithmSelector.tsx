import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EncryptionAlgorithm } from "@/utils/encryptionAdvanced";
import { Shield, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from 'react-i18next';

interface AlgorithmSelectorProps {
  value: EncryptionAlgorithm;
  onChange: (value: EncryptionAlgorithm) => void;
}

export const AlgorithmSelector = ({ value, onChange }: AlgorithmSelectorProps) => {
  const { t } = useTranslation();
  
  const algorithmInfo = {
    AES: t('algorithms.aes.description'),
    RSA: t('algorithms.rsa.description'),
    ChaCha20: t('algorithms.chacha.description')
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="algorithm" className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4" />
          {t('encryption.algorithm')}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm mb-2">
                {t('algorithms.tooltip.description')}
              </p>
              <ul className="text-xs space-y-1">
                <li><strong>AES:</strong> {t('algorithms.tooltip.aes')}</li>
                <li><strong>RSA:</strong> {t('algorithms.tooltip.rsa')}</li>
                <li><strong>ChaCha20:</strong> {t('algorithms.tooltip.chacha')}</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={value} onValueChange={(val) => onChange(val as EncryptionAlgorithm)}>
        <SelectTrigger id="algorithm" className="h-auto">
          <SelectValue placeholder={t('algorithms.select')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AES" className="cursor-pointer">
            <div className="flex flex-col items-start py-2">
              <span className="font-semibold text-base mb-1">{t('algorithms.aes.name')}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {algorithmInfo.AES}
              </span>
            </div>
          </SelectItem>
          <SelectItem value="RSA" className="cursor-pointer">
            <div className="flex flex-col items-start py-2">
              <span className="font-semibold text-base mb-1">{t('algorithms.rsa.name')}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {algorithmInfo.RSA}
              </span>
            </div>
          </SelectItem>
          <SelectItem value="ChaCha20" className="cursor-pointer">
            <div className="flex flex-col items-start py-2">
              <span className="font-semibold text-base mb-1">{t('algorithms.chacha.name')}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {algorithmInfo.ChaCha20}
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
