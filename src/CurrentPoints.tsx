export const CurrentPoints = ({ points }: { points: [number, number][] }) => {
  const pointsStr = points.map((p) => `(${p[0]}, ${p[1]})`).join(', ');
  return <div className="text-base">{pointsStr}</div>;
};
