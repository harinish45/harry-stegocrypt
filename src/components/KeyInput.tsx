
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeyInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const KeyInput: React.FC<KeyInputProps> = ({ id, value, onChange, label = "Encryption Key" }) => {
  const getKeyStrength = (key: string): { strength: string; color: "default" | "secondary" | "destructive" } => {
    if (!key) return { strength: "No Key", color: "destructive" };
    if (key.length < 8) return { strength: "Weak", color: "destructive" };
    if (key.length < 12) return { strength: "Medium", color: "secondary" };
    return { strength: "Strong", color: "default" };
  };

  const strength = getKeyStrength(value);

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
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          placeholder="Enter encryption key"
        />
        <Key className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
};

export default KeyInput;
