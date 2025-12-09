import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden transition-all duration-300 hover:scale-105"
            aria-label="Toggle theme"
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
                }`} />
            <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
                }`} />
        </Button>
    );
};
