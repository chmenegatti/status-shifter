"use client";

import { useState } from 'react';
import { Hash, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface UuidInputProps {
  value: string;
  onChange: (value: string) => void;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function UuidInput({ value, onChange }: UuidInputProps) {
  const [touched, setTouched] = useState(false);

  const isValid = UUID_REGEX.test(value);
  const showValidation = touched && value.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="aggregate-id" className="text-sm font-medium flex items-center gap-2">
        <Hash className="w-4 h-4 text-primary" />
        Aggregate ID (UUID)
      </Label>
      <div className="relative">
        <Input
          id="aggregate-id"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className={cn(
            "glass border-border/50 h-12 text-base font-mono pr-10 transition-all",
            "focus:ring-2 focus:ring-primary/50",
            showValidation && (isValid
              ? "border-emerald-500/50 focus:ring-emerald-500/30"
              : "border-destructive/50 focus:ring-destructive/30"
            )
          )}
        />
        {showValidation && (
          <div className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 transition-all animate-scale-in",
            isValid ? "text-emerald-500" : "text-destructive"
          )}>
            {isValid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </div>
        )}
      </div>
      {showValidation && !isValid && (
        <p className="text-sm text-destructive animate-fade-in">
          Por favor, insira um UUID válido
        </p>
      )}
    </div>
  );
}
