import { useState } from 'react';
import { DividedDifference } from './DividedDifference';
import { MathJaxContext } from 'better-react-mathjax';
import { EnterPoints } from './EnterPoints';
import { CurrentPoints } from './CurrentPoints';

function App() {
  const [points, setPoints] = useState<[number, number][]>([
    [1, 6],
    [2, 20],
    [4, 10],
  ]);

  return (
    <MathJaxContext>
      <div className="text-lg m-5">
        <h1 className="text-2xl font-semibold">
          Newton Divided Difference Interpolation Polynomial
        </h1>
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Enter Points</h2>
          <EnterPoints points={points} onChange={setPoints} />
        </section>
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Current Points</h2>
          <CurrentPoints points={points} />
        </section>
        <section className="mt-12">
          <DividedDifference points={points} />
        </section>
      </div>
    </MathJaxContext>
  );
}

export default App;
