import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Database,
  FileCode,
  BarChart3,
  Search,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onClose]);

  const handleSelect = useCallback(
    (value: string) => {
      navigate(value);
      onClose();
      setSearch('');
    },
    [navigate, onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/3 z-50 w-full max-w-2xl"
          >
            <Command
              className="card overflow-hidden shadow-strong"
              label="Command Menu"
            >
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search or jump to..."
                  className="flex-1 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-gray-500">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading="Navigation"
                  className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  <CommandItem
                    value="/"
                    onSelect={() => handleSelect('/')}
                    icon={<LayoutDashboard className="h-4 w-4" />}
                  >
                    Dashboards
                  </CommandItem>
                  <CommandItem
                    value="/connections"
                    onSelect={() => handleSelect('/connections')}
                    icon={<Database className="h-4 w-4" />}
                  >
                    Connections
                  </CommandItem>
                  <CommandItem
                    value="/queries"
                    onSelect={() => handleSelect('/queries')}
                    icon={<FileCode className="h-4 w-4" />}
                  >
                    Queries
                  </CommandItem>
                  <CommandItem
                    value="/visualizations"
                    onSelect={() => handleSelect('/visualizations')}
                    icon={<BarChart3 className="h-4 w-4" />}
                  >
                    Visualizations
                  </CommandItem>
                </Command.Group>

                <Command.Group
                  heading="Quick Actions"
                  className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2"
                >
                  <CommandItem
                    value="new-dashboard"
                    onSelect={() => handleSelect('/')}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Create Dashboard
                  </CommandItem>
                  <CommandItem
                    value="new-connection"
                    onSelect={() => handleSelect('/connections')}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Connection
                  </CommandItem>
                  <CommandItem
                    value="new-query"
                    onSelect={() => handleSelect('/queries')}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Create Query
                  </CommandItem>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface CommandItemProps {
  value: string;
  onSelect: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const CommandItem = ({ value, onSelect, icon, children }: CommandItemProps) => {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer',
        'text-gray-700 dark:text-gray-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'data-[selected=true]:bg-brand-50 dark:data-[selected=true]:bg-brand-900/20',
        'data-[selected=true]:text-brand-700 dark:data-[selected=true]:text-brand-400',
        'transition-colors'
      )}
    >
      <div className="flex items-center justify-center">{icon}</div>
      <span>{children}</span>
    </Command.Item>
  );
};
