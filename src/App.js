import './App.css'
import React, {useState} from "react";
import {DividedDifference} from "./DividedDifference";
import {MathJaxContext} from "better-react-mathjax";
import {EnterPoints} from "./EnterPoints";
import {CurrentPoints} from "./CurrentPoints";

function App() {
  console.log('dv:', 1)
  console.log('dv:', 2)
  const [points, setPoints] = useState([[1, 6], [2, 20], [4, 10]])

  return (
    <MathJaxContext>
      <div style={{fontSize: '18px', margin: '20px'}}>
        <h1>Newton Divided Difference Interpolation Polynomial</h1>
        <section className="mt-12">
          <h2>Enter Points</h2>
          <EnterPoints points={points} onChange={setPoints}/>
        </section>
        <section className="mt-12">
          <h2>Current Points</h2>
          <CurrentPoints points={points}/>
        </section>
        <section className="mt-12">
          <DividedDifference points={points}/>
        </section>
      </div>
    </MathJaxContext>
  );
}

export default App;
