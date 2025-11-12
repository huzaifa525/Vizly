import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
}

export const Skeleton = ({ className, shimmer = false }: SkeletonProps) => {
  return (
    <div
      className={cn(
        shimmer ? 'skeleton-shimmer' : 'skeleton',
        className
      )}
    />
  );
};

export const SkeletonText = ({ className }: { className?: string }) => {
  return <Skeleton className={cn('skeleton-text', className)} />;
};

export const SkeletonHeading = ({ className }: { className?: string }) => {
  return <Skeleton className={cn('skeleton-heading', className)} />;
};

export const SkeletonCircle = ({ className, size = 12 }: { className?: string; size?: number }) => {
  return (
    <Skeleton
      className={cn('skeleton-circle', className)}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="card">
      <div className="card-body space-y-4">
        <SkeletonHeading />
        <SkeletonText />
        <SkeletonText className="w-2/3" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="card">
      <div className="card-body space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonCircle size={10} />
            <div className="flex-1 space-y-2">
              <SkeletonText className="w-full" />
              <SkeletonText className="w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
