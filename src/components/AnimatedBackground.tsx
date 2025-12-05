export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-float" />
      <div 
        className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] animate-float" 
        style={{ animationDelay: '-3s' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-float" 
        style={{ animationDelay: '-1.5s' }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
}
