export const CurrentPoints = ({ points }: { points: [number, number][] }) => {
  if (points.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        No data points yet.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {points.map(([x, y], i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          (<span className="tabular-nums">{x}</span>,{' '}
          <span className="tabular-nums">{y}</span>)
        </span>
      ))}
    </div>
  );
};
