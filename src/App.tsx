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
      <div className="min-h-screen py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <header className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Newton's Divided Difference
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-base">
              Build an interpolation polynomial from your data points
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <section
              className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm"
              aria-labelledby="enter-points-heading"
            >
              <h2
                id="enter-points-heading"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
              >
                Enter data points
              </h2>
              <EnterPoints points={points} onChange={setPoints} />
            </section>

            <section
              className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm"
              aria-labelledby="current-points-heading"
            >
              <h2
                id="current-points-heading"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
              >
                Your data points
              </h2>
              <CurrentPoints points={points} />
            </section>

            <section
              className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm"
              aria-labelledby="result-heading"
            >
              <h2
                id="result-heading"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
              >
                Result
              </h2>
              <DividedDifference points={points} />
            </section>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}

export default App;
