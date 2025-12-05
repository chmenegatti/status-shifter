"use client";

import { Server } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const DATACENTERS = [
  { id: 'TECE01', location: 'Ceará', status: 'online' },
  { id: 'TESP02', location: 'São Paulo', status: 'online' },
  { id: 'TESP03', location: 'São Paulo', status: 'online' },
  { id: 'TESP05', location: 'São Paulo', status: 'online' },
  { id: 'TESP06', location: 'São Paulo', status: 'online' },
  { id: 'TESP07', location: 'São Paulo', status: 'online' },
] as const;

interface DatacenterSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatacenterSelector({ value, onChange }: DatacenterSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="datacenter" className="text-sm font-medium flex items-center gap-2">
        <Server className="w-4 h-4 text-primary" />
        Datacenter
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="datacenter"
          className="w-full glass border-border/50 h-12 text-base focus:ring-2 focus:ring-primary/50"
        >
          <SelectValue placeholder="Selecione um datacenter" />
        </SelectTrigger>
        <SelectContent className="glass border-border/50 z-50 bg-popover">
          {DATACENTERS.map((dc) => (
            <SelectItem
              key={dc.id}
              value={dc.id}
              className="cursor-pointer focus:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                </div>
                <span className="font-mono font-medium">{dc.id}</span>
                <span className="text-muted-foreground text-sm">({dc.location})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
