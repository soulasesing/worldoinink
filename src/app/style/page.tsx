import StyleDashboard from '@/components/style/style-dashboard';

export const metadata = {
  title: 'Mi Estilo Literario | World in Ink',
  description: 'Descubre tu voz única como escritor con análisis de estilo impulsado por IA',
};

export default function StylePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <StyleDashboard />
      </div>
    </div>
  );
}

