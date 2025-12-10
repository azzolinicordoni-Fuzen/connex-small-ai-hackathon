import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link 
        to="/dashboard" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
