import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

const colorVariants = {
  primary: {
    bg: 'from-primary-500 to-primary-600',
    lightBg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
  },
  success: {
    bg: 'from-success-500 to-success-600',
    lightBg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
  },
  warning: {
    bg: 'from-warning-500 to-warning-600',
    lightBg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
  },
  danger: {
    bg: 'from-danger-500 to-danger-600',
    lightBg: 'bg-danger-50 dark:bg-danger-900/20',
    text: 'text-danger-600 dark:text-danger-400',
    iconBg: 'bg-gradient-to-br from-danger-500 to-danger-600',
  },
  info: {
    bg: 'from-info-500 to-info-600',
    lightBg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    iconBg: 'bg-gradient-to-br from-info-500 to-info-600',
  },
};

const KPICard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  color = 'primary',
  loading = false,
}: KPICardProps) => {
  const colors = colorVariants[color];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success-600 dark:text-success-400';
    if (trend === 'down') return 'text-danger-600 dark:text-danger-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="card-gradient animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            {title}
          </p>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-display">
            {value}
          </h3>
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-2">
              {change !== undefined && (
                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
                  {getTrendIcon()}
                  {Math.abs(change)}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-3 bg-gradient-to-br ${colors.bg} rounded-xl shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KPICard;
