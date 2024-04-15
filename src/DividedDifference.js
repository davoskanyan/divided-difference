import React, {Fragment, useMemo} from 'react';
import {
  ConstantNode,
  OperatorNode,
  simplify,
  ParenthesisNode,
  SymbolNode,
  rationalize,
  fraction,
  simplifyCore,
} from "mathjs";
import {MathJax} from "better-react-mathjax";

function toFractionCoefficients(node) {
  return node.transform(arg => {
    if (arg.isConstantNode) {
      const fractionValue = fraction(arg.value);
      return simplifyCore(new OperatorNode('/', 'divide', [
        new ConstantNode(fractionValue.n * fractionValue.s),
        new ConstantNode(fractionValue.d)
      ]))
    }
    return arg
  })
}

function beautifyPolynomial(node) {
  const simplified = simplify(node, [
    ...simplify.rules,
    'n1-n2 -> n1+ -n2',
    'n1(n2+n3) -> n1*n2 + n1*n3',
    '(n2+n3)n1 -> n1*n2 + n1*n3',
  ])

  return toFractionCoefficients(rationalize(simplified))
}

function withOptionalParentheses(node) {
  const isNegative = node.op === '-'
  return isNegative ? new ParenthesisNode(node) : node
}

function getProduct(points) {
  if (!points.length) {
    return null
  }

  const pointNodes = points.map(point => new ParenthesisNode(new OperatorNode(
    '-',
    'subtract',
    [
      new SymbolNode('x'),
      new ConstantNode(point[0])
    ])
  ))

  return pointNodes.reduce((product, mult) => {
    return new OperatorNode('*', "multiply", [
      product, mult
    ], true)
  })
}

class DDNode {
  minX
  maxX
  value
  formula

  static fromPoint(x, y) {
    const newNode = new DDNode()
    newNode.minX = x;
    newNode.maxX = x;
    // newNode.value = new ConstantNode(y);
    newNode.formula = new ConstantNode(y);

    return newNode;
  }

  static fromPair(node1, node2) {
    const newNode = new DDNode()
    newNode.minX = node1.minX;
    newNode.maxX = node2.maxX;

    newNode.formula = new OperatorNode(
      '/',
      "divide",
      [
        new OperatorNode('-', 'subtract', [simplify(node2.formula), withOptionalParentheses(simplify(node1.formula))]),
        new OperatorNode('-', 'subtract', [new ConstantNode(node2.maxX), withOptionalParentheses(new ConstantNode(node1.minX))])
      ]
    )

    return newNode
  }
}

function getNextLayer(nodes) {
  const nextLevel = [];

  nodes.forEach((node, index) => {
    if (index === nodes.length - 1) {
      return;
    }
    const nextNode = nodes[index + 1];
    const newNode = DDNode.fromPair(node, nextNode)
    nextLevel.push(newNode)
  })

  return nextLevel
}

function getDividedDifference(nodes) {
  const layers = [nodes]

  let currentLayer = nodes;
  while (currentLayer.length > 1) {
    const nextLayer = getNextLayer(currentLayer);
    layers.push(nextLayer)
    currentLayer = nextLayer
  }
  return layers
}

function getDifferenceGrid(difference) {
  const grid = [];
  difference.forEach((layer, layerIndex) => {
    const emptyCells = Array(layerIndex).fill('');
    const layerCells = []
    layer.forEach((cell, cellIndex) => {
      layerCells.push(cell);
      if (cellIndex !== layer.length - 1) {
        layerCells.push('')
      }
    })
    grid.push([...emptyCells, ...layerCells, ...emptyCells])
  })

  return grid
}

function sumOrDiffNode(op1, {coef, product}) {
  const absCoef = coef.fn === 'unaryMinus' ? coef.args[0] : coef
  const op2 = product ? new OperatorNode('*', 'multiply', [absCoef, product], true) : coef;
  if (!op1) {
    return op2;
  }

  const isNegative = coef.op === '-'
  return isNegative ?
    new OperatorNode('-', 'subtract', [op1, op2], true) :
    new OperatorNode('+', 'add', [op1, op2]);
}

function getInterpolationPolynomial(points, matrix) {
  const range = Array.from({length: points.length}, (_, index) => index);
  const pointSets = range.map(count => points.slice(0, count));

  const sums = pointSets.map(pointSet => {
    const coefLayer = pointSet.length;
    const coefNode = simplify(matrix[coefLayer][0].formula)
    const productNode = getProduct(pointSet)
    return {
      coef: coefNode,
      product: productNode
    }
  })

  return sums.reduce((allSum, sum) => sumOrDiffNode(allSum, sum), null)
}

export const DividedDifference = ({points}) => {
  const difference = useMemo(() => {
    return getDividedDifference(points.map(point => DDNode.fromPoint(point[0], point[1])))
  }, [points])

  const grid = useMemo(() => {
    return getDifferenceGrid(difference)
  }, [difference])

  const pol = useMemo(() => {
    return getInterpolationPolynomial(points, difference)
  }, [points, difference])

  const beautified = useMemo(() => {
    return beautifyPolynomial(pol)
  }, [pol])

  return (
    <Fragment key={JSON.stringify(grid)}>
      <h3>Divided Difference</h3>
      <div style={{display: "flex", gap: '20px'}}>
        {grid.map(layer => (
          <div>
            {layer.map(cell => (
              <div style={{height: '40px'}}>
                <DividedDifferenceCell cell={cell}/>
              </div>
            ))}
          </div>
        ))}
      </div>

      <h3>Interpolation Polynomial</h3>
      <p>
        <MathJax>\(f(x) = {pol.toTex()} = {beautified.toTex()} \)</MathJax>
      </p>
    </Fragment>
  );
};

const DividedDifferenceCell = ({cell}) => {
  if (!cell) {
    return <span></span>
  }

  const formulaStr = cell.formula.toTex()
  const simplifiedFormulaStr = simplify(cell.formula).toTex()

  const combined = formulaStr === simplifiedFormulaStr ? formulaStr : `${formulaStr} = ${simplifiedFormulaStr}`

  return <MathJax>\({combined}\)</MathJax>
}