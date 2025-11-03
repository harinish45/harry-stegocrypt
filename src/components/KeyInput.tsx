
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Key, Eye, EyeOff, Shuffle, Copy, CheckCircle2 } from "lucide-react";
import { validateKeyStrength } from "@/utils/encryptionAdvanced";
import { useToast } from "@/hooks/use-toast";

interface KeyInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const KeyInput: React.FC<KeyInputProps> = ({ id, value, onChange, label = "Encryption Key" }) => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { strength, score } = validateKeyStrength(value);
  
  const strengthConfig = {
    weak: { color: "bg-destructive", label: "Weak", variant: "destructive" as const },
    medium: { color: "bg-yellow-500", label: "Medium", variant: "secondary" as const },
    strong: { color: "bg-green-500", label: "Strong", variant: "default" as const }
  };
  
  const currentConfig = strengthConfig[strength] || { color: "bg-muted", label: "No Key", variant: "destructive" as const };
  
  const toggleShowKey = () => setShowKey(!showKey);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const length = 16;
    let key = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      key += chars[array[i] % chars.length];
    }
    
    onChange(key);
    toast({
      title: "Key Generated",
      description: "A strong random key has been generated"
    });
  };

  const copyKey = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Key copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy key",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{currentConfig.label}</span>
          <div className="text-xs font-medium">{score}%</div>
        </div>
      </div>
      
      <div className="relative">
        <Input
          id={id}
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-20"
          placeholder="Enter or generate encryption key"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <button 
            type="button" 
            onClick={toggleShowKey} 
            className="p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button 
            type="button" 
            onClick={copyKey}
            disabled={!value}
            className="p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors disabled:opacity-30"
            aria-label="Copy key"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={score} className="h-2" indicatorClassName={currentConfig.color} />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateRandomKey}
            className="flex-1"
          >
            <Shuffle className="h-3 w-3 mr-2" />
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeyInput;
