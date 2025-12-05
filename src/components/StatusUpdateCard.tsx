import { useState } from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatacenterSelector } from './DatacenterSelector';
import { UuidInput } from './UuidInput';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function StatusUpdateCard() {
  const [datacenter, setDatacenter] = useState('');
  const [aggregateId, setAggregateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = datacenter && UUID_REGEX.test(aggregateId);

  const handleUpdate = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setIsSuccess(false);

    // Simulated API call - replace with actual backend call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsSuccess(true);

    toast({
      title: "Status Atualizado!",
      description: (
        <div className="flex flex-col gap-1">
          <span>Datacenter: <code className="font-mono bg-muted px-1 rounded">{datacenter}</code></span>
          <span>Status alterado de <code className="font-mono bg-destructive/20 text-destructive px-1 rounded">Sent</code> para <code className="font-mono bg-emerald-500/20 text-emerald-600 px-1 rounded">Pending</code></span>
        </div>
      ),
    });

    // Reset success state after animation
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="relative">
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50 animate-pulse-glow" />
      
      <div className="relative glass rounded-2xl border border-border/50 shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Atualização de Status</h2>
              <p className="text-sm text-muted-foreground">Alterar status de Sent para Pending</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <DatacenterSelector value={datacenter} onChange={setDatacenter} />
          
          <UuidInput value={aggregateId} onChange={setAggregateId} />

          {/* Status Preview */}
          <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 font-medium text-sm">
                Sent
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 font-medium text-sm">
              Pending
            </span>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleUpdate}
            disabled={!isValid || isLoading}
            className={cn(
              "w-full h-14 text-base font-semibold relative overflow-hidden transition-all duration-300",
              isSuccess 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Atualizando...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2 animate-scale-in">
                <CheckCircle2 className="w-5 h-5" />
                Atualizado com Sucesso!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Atualizar Status
              </span>
            )}
            
            {/* Shimmer effect */}
            {!isLoading && !isSuccess && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
