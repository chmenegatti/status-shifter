import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { mode, setMode, customPrimary, customAccent, setCustomPrimary, setCustomAccent } = useTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Escuro' },
    { id: 'custom', icon: Palette, label: 'Personalizado' },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <div className="glass rounded-full p-1 flex items-center gap-1 shadow-card">
        {themes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={cn(
              "relative p-2 rounded-full transition-all duration-300",
              mode === id 
                ? "bg-primary text-primary-foreground shadow-glow" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 glass">
              <div 
                className="w-4 h-4 rounded-full border border-border" 
                style={{ background: `linear-gradient(135deg, ${customPrimary}, ${customAccent})` }}
              />
              Cores
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 glass border-border/50" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-sm font-medium">
                  Cor Primária
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="primary-color"
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {customPrimary}
                  </code>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accent-color" className="text-sm font-medium">
                  Cor de Destaque
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="accent-color"
                    type="color"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {customAccent}
                  </code>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
