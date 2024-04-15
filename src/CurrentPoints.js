import React from 'react';

export const CurrentPoints = ({points}) => {
  const pointsStr = points.map(p => `(${p[0]}, ${p[1]})`).join(', ')
  return (
    <div>
      {pointsStr}
    </div>
  );
};
