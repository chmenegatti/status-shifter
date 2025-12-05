import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { StatusUpdateCard } from '@/components/StatusUpdateCard';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-lg opacity-50" />
            </div>
            <span className="text-xl font-bold gradient-text">StatusHub</span>
          </div>
          
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">
              Gerenciador de{' '}
              <span className="gradient-text">Status</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Atualize rapidamente o status de registros nos seus datacenters com apenas alguns cliques.
            </p>
          </div>

          {/* Card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <StatusUpdateCard />
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p>
              Selecione um datacenter, insira o UUID do registro e clique em atualizar.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
