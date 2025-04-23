
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeyInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const KeyInput: React.FC<KeyInputProps> = ({ id, value, onChange, label = "Encryption Key" }) => {
  const [showKey, setShowKey] = useState(false);
  
  const getKeyStrength = (key: string): { strength: string; color: "default" | "secondary" | "destructive" } => {
    if (!key) return { strength: "No Key", color: "destructive" };
    if (key.length < 8) return { strength: "Weak", color: "destructive" };
    if (key.length < 12) return { strength: "Medium", color: "secondary" };
    return { strength: "Strong", color: "default" };
  };

  const strength = getKeyStrength(value);
  
  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
        <Badge variant={strength.color}>{strength.strength}</Badge>
      </div>
      <div className="relative">
        <Input
          id={id}
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          placeholder="Enter encryption key"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <button 
            type="button" 
            onClick={toggleShowKey} 
            className="h-4 w-4 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyInput;
