import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  fallbackRoute?: string;
  showLabel?: boolean;
  className?: string;
  onBeforeNavigate?: () => boolean; // Return false to prevent navigation
}

export function BackButton({ 
  fallbackRoute = '/dashboard',
  showLabel = false,
  className,
  onBeforeNavigate,
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we can go back (has history)
  const canGoBack = window.history.length > 2;

  // Pages that should not trigger back navigation (entry points)
  const entryPages = ['/', '/login', '/cadastro'];
  const isEntryPage = entryPages.includes(location.pathname);

  const handleBack = () => {
    // If there's a beforeNavigate callback, check if we should proceed
    if (onBeforeNavigate && !onBeforeNavigate()) {
      return;
    }

    if (canGoBack && !isEntryPage) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  // Don't show on entry pages
  if (isEntryPage) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size={showLabel ? 'sm' : 'icon'}
      onClick={handleBack}
      className={cn('gap-2', className)}
    >
      <ArrowLeft className="w-5 h-5" />
      {showLabel && <span>Voltar</span>}
    </Button>
  );
}