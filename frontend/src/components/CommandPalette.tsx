import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Database,
  Code,
  BarChart3,
  Plus,
  Home,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
}

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Cmd+K or Ctrl+K to toggle
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  });

  // ESC to close
  useHotkeys('esc', () => setOpen(false), { enabled: open });

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Dashboards',
      icon: Home,
      action: () => {
        navigate('/');
        setOpen(false);
      },
      category: 'Navigation',
    },
    {
      id: 'nav-connections',
      label: 'Go to Connections',
      icon: Database,
      action: () => {
        navigate('/connections');
        setOpen(false);
      },
      category: 'Navigation',
    },
    {
      id: 'nav-queries',
      label: 'Go to Queries',
      icon: Code,
      action: () => {
        navigate('/queries');
        setOpen(false);
      },
      category: 'Navigation',
    },
    {
      id: 'nav-visualizations',
      label: 'Go to Visualizations',
      icon: BarChart3,
      action: () => {
        navigate('/visualizations');
        setOpen(false);
      },
      category: 'Navigation',
    },
    // Quick Actions
    {
      id: 'create-dashboard',
      label: 'Create New Dashboard',
      icon: Plus,
      action: () => {
        navigate('/');
        setOpen(false);
        // TODO: Trigger create modal
      },
      category: 'Actions',
    },
    {
      id: 'create-connection',
      label: 'Create New Connection',
      icon: Plus,
      action: () => {
        navigate('/connections');
        setOpen(false);
      },
      category: 'Actions',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <Command className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex-1 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-gray-500">
                  No results found.
                </Command.Empty>

                {/* Group commands by category */}
                {['Navigation', 'Actions'].map((category) => (
                  <Command.Group
                    key={category}
                    heading={category}
                    className="mb-2"
                  >
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {category}
                    </div>
                    {commands
                      .filter((cmd) => cmd.category === category)
                      .map((cmd) => {
                        const Icon = cmd.icon;
                        return (
                          <Command.Item
                            key={cmd.id}
                            value={cmd.label}
                            onSelect={cmd.action}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-900/30 data-[selected=true]:text-primary-600 dark:data-[selected=true]:text-primary-400 transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="flex-1 font-medium">{cmd.label}</span>
                          </Command.Item>
                        );
                      })}
                  </Command.Group>
                ))}
              </Command.List>

              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↓</kbd>
                    <span className="ml-1">navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
                    <span className="ml-1">select</span>
                  </div>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
