import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, Gauge, Home, LayoutDashboard, Upload } from 'lucide-react';
import { cn } from './ui';

const navItems = [
  { path: '/', label: 'Дашборд', icon: LayoutDashboard },
  { path: '/apply', label: 'Новая заявка', icon: FileText },
  { path: '/batch', label: 'Batch scoring', icon: Upload },
  { path: '/model', label: 'Model Card', icon: Activity },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <Gauge className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">CreditScore ML</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Система онлайн
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-card flex items-center px-4 md:hidden">
          <Gauge className="h-5 w-5 text-primary mr-2" />
          <span className="font-semibold">CreditScore ML</span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}