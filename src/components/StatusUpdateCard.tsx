"use client";

import { useEffect, useState, useRef } from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, Database, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [connectionInfo, setConnectionInfo] = useState<{ dbName: string; datacenter: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectInFlight = useRef<AbortController | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<'unknown' | 'sent' | 'pending' | 'other' | 'missing'>('unknown');
  const statusInFlight = useRef<AbortController | null>(null);

  // Attempt connection automatically when datacenter changes
  useEffect(() => {
    if (!datacenter) {
      setConnectionStatus('idle');
      setConnectionError(null);
      setConnectionInfo(null);
      setIsSuccess(false);
      return;
    }
    void connectToDb({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datacenter]);

  const connectToDb = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!datacenter) return false;

    connectInFlight.current?.abort();
    const abortController = new AbortController();
    connectInFlight.current = abortController;

    setConnectionStatus('loading');
    setConnectionError(null);
    setConnectionInfo(null);

    try {
      const res = await fetch('/api/db/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datacenter }),
        signal: abortController.signal,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao conectar ao banco');
      }

      setConnectionInfo({ dbName: data?.db?.name || 'desconhecido', datacenter });
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      if ((error as any)?.name === 'AbortError') return false;
      const message = (error as Error).message || 'Erro ao conectar';
      setConnectionStatus('error');
      setConnectionError(message);
      if (!silent) {
        toast({
          title: 'Erro ao conectar',
          description: message,
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const isValid = datacenter && UUID_REGEX.test(aggregateId);

  // Fetch current outbox status when datacenter + valid UUID change
  useEffect(() => {
    if (!datacenter || !UUID_REGEX.test(aggregateId)) {
      setRemoteStatus('unknown');
      return;
    }

    statusInFlight.current?.abort();
    const abortController = new AbortController();
    statusInFlight.current = abortController;

    (async () => {
      try {
        const res = await fetch('/api/status/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datacenter, aggregateId }),
          signal: abortController.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Falha ao consultar status');
        const status: string | null = data?.status ?? null;
        if (!status) {
          setRemoteStatus('missing');
          return;
        }
        const norm = status.toLowerCase();
        if (norm === 'sent') setRemoteStatus('sent');
        else if (norm === 'pending') setRemoteStatus('pending');
        else setRemoteStatus('other');
      } catch (error) {
        if ((error as any)?.name === 'AbortError') return;
        setRemoteStatus('unknown');
        toast({
          title: 'Erro ao consultar status',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    })();
  }, [aggregateId, datacenter, toast]);

  const handleUpdate = async () => {
    if (!isValid) return;

    setIsLoading(true);
    setIsSuccess(false);

    const connected = await connectToDb({ silent: false });
    if (!connected) {
      setIsLoading(false);
      return;
    }

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      toast({
        title: 'Buscando Outbox Send Receipt',
        description: `com base no aggregate ${aggregateId}`,
      });

      const res = await fetch('/api/status/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datacenter, aggregateId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao atualizar status');
      }

      if (!data.deletedIds || data.deletedIds.length === 0) {
        toast({
          title: 'Nenhum receipt encontrado',
          description: `aggregate ${aggregateId} não retornou registros em outbox_send_receipt`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      await delay(800);
      toast({
        title: 'Deletando Outbox Send Receipt',
        description: `registros ${data.deletedIds.join(', ')}`,
      });

      await delay(800);
      toast({
        title: 'Atualizando Outbox Status',
        description: `de Sent para Pending em ${aggregateId}`,
      });

      setRemoteStatus('pending');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      const message = (error as Error).message || 'Erro ao atualizar';
      toast({
        title: 'Erro ao processar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative">
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50 animate-pulse-glow" />

      <div className="relative glass rounded-2xl border border-border/50 shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Atualização de Status</h2>
                <p className="text-sm text-muted-foreground">Alterar status de Sent para Pending</p>
              </div>
            </div>
            {connectionStatus === 'loading' && (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Conectando...
              </Badge>
            )}
            {connectionStatus === 'connected' && connectionInfo && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                Conectado • {connectionInfo.dbName}
              </Badge>
            )}
            {connectionStatus === 'error' && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-4 h-4" />
                Erro na conexão
              </Badge>
            )}
            {connectionStatus === 'idle' && (
              <Badge variant="secondary" className="text-muted-foreground">
                Desconectado
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <DatacenterSelector value={datacenter} onChange={setDatacenter} />

          <UuidInput value={aggregateId} onChange={setAggregateId} />

          {connectionStatus === 'error' && connectionError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {connectionError}
            </div>
          )}

          {/* Status Preview */}
          <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full font-semibold text-sm transition-all",
                  remoteStatus === 'sent'
                    ? "bg-amber-200/50 text-orange-300 shadow-[0_0_18px_rgba(255,180,80,0.95)] border border-amber-200 saturate-150"
                    : "bg-amber-500/20 text-amber-600"
                )}
              >
                Sent
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <span
              className={cn(
                "px-3 py-1 rounded-full font-medium text-sm transition-all",
                remoteStatus === 'pending'
                  ? "bg-emerald-500/30 text-emerald-700 shadow-glow"
                  : "bg-emerald-500/20 text-emerald-600"
              )}
            >
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
