import { Fragment, useMemo } from 'react';
import {
  ConstantNode,
  OperatorNode,
  simplify,
  ParenthesisNode,
  SymbolNode,
  rationalize,
  fraction,
  simplifyCore,
} from 'mathjs';
import type { MathNode } from 'mathjs';
import { MathJax } from 'better-react-mathjax';

function toFractionCoefficients(node: MathNode): MathNode {
  return node.transform((arg: MathNode) => {
    if ('isConstantNode' in arg && arg.isConstantNode) {
      const fractionValue = fraction(
        (arg as unknown as { value: number }).value
      );
      return simplifyCore(
        new OperatorNode('/', 'divide', [
          new ConstantNode(fractionValue.n * fractionValue.s),
          new ConstantNode(fractionValue.d),
        ])
      ) as MathNode;
    }
    return arg;
  }) as MathNode;
}

function beautifyPolynomial(node: MathNode): MathNode {
  const simplified = simplify(node, [
    ...simplify.rules,
    'n1-n2 -> n1+ -n2',
    'n1(n2+n3) -> n1*n2 + n1*n3',
    '(n2+n3)n1 -> n1*n2 + n1*n3',
  ]);
  return toFractionCoefficients(rationalize(simplified) as MathNode);
}

function withOptionalParentheses(node: MathNode): MathNode {
  const isNegative = 'op' in node && node.op === '-';
  return isNegative ? new ParenthesisNode(node) : node;
}

function getProduct(points: [number, number][]): MathNode | null {
  if (!points.length) return null;

  const pointNodes = points.map(
    (point) =>
      new ParenthesisNode(
        new OperatorNode('-', 'subtract', [
          new SymbolNode('x'),
          new ConstantNode(point[0]),
        ])
      )
  );

  const [first, ...rest] = pointNodes;
  return rest.reduce<MathNode>(
    (product, mult) => new OperatorNode('*', 'multiply', [product, mult]),
    first
  );
}

class DDNode {
  minX!: number;
  maxX!: number;
  formula!: MathNode;

  static fromPoint(x: number, y: number): DDNode {
    const newNode = new DDNode();
    newNode.minX = x;
    newNode.maxX = x;
    newNode.formula = new ConstantNode(y);
    return newNode;
  }

  static fromPair(node1: DDNode, node2: DDNode): DDNode {
    const newNode = new DDNode();
    newNode.minX = node1.minX;
    newNode.maxX = node2.maxX;
    newNode.formula = new OperatorNode('/', 'divide', [
      new OperatorNode('-', 'subtract', [
        simplify(node2.formula),
        withOptionalParentheses(simplify(node1.formula)),
      ]),
      new OperatorNode('-', 'subtract', [
        new ConstantNode(node2.maxX),
        withOptionalParentheses(new ConstantNode(node1.minX)),
      ]),
    ]);
    return newNode;
  }
}

function getNextLayer(nodes: DDNode[]): DDNode[] {
  const nextLevel: DDNode[] = [];
  nodes.forEach((node, index) => {
    if (index === nodes.length - 1) return;
    const nextNode = nodes[index + 1];
    nextLevel.push(DDNode.fromPair(node, nextNode));
  });
  return nextLevel;
}

function getDividedDifference(nodes: DDNode[]): DDNode[][] {
  const layers: DDNode[][] = [nodes];
  let currentLayer = nodes;
  while (currentLayer.length > 1) {
    const nextLayer = getNextLayer(currentLayer);
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }
  return layers;
}

function getDifferenceGrid(difference: DDNode[][]): (DDNode | '')[][] {
  const grid: (DDNode | '')[][] = [];
  difference.forEach((layer, layerIndex) => {
    const emptyCells = Array(layerIndex).fill('');
    const layerCells: (DDNode | '')[] = [];
    layer.forEach((cell, cellIndex) => {
      layerCells.push(cell);
      if (cellIndex !== layer.length - 1) layerCells.push('');
    });
    grid.push([...emptyCells, ...layerCells, ...emptyCells]);
  });
  return grid;
}

function sumOrDiffNode(
  op1: MathNode | null,
  { coef, product }: { coef: MathNode; product: MathNode | null }
): MathNode {
  const absCoef =
    'fn' in coef && coef.fn === 'unaryMinus'
      ? (coef as unknown as { args: MathNode[] }).args[0]
      : coef;
  const op2 =
    product !== null
      ? new OperatorNode('*', 'multiply', [absCoef, product])
      : absCoef;
  if (!op1) return op2;
  const isNegative = 'op' in coef && coef.op === '-';
  return isNegative
    ? new OperatorNode('-', 'subtract', [op1, op2])
    : new OperatorNode('+', 'add', [op1, op2]);
}

function getInterpolationPolynomial(
  points: [number, number][],
  matrix: DDNode[][]
): MathNode | null {
  const range = Array.from({ length: points.length }, (_, index) => index);
  const pointSets = range.map((count) => points.slice(0, count));
  const sums = pointSets.map((pointSet) => {
    const coefLayer = pointSet.length;
    const coefNode = simplify(matrix[coefLayer][0].formula);
    const productNode = getProduct(pointSet);
    return { coef: coefNode, product: productNode };
  });
  return sums.reduce<MathNode | null>(
    (allSum, sum) =>
      sumOrDiffNode(allSum, { coef: sum.coef, product: sum.product }),
    null
  );
}

export const DividedDifference = ({
  points,
}: {
  points: [number, number][];
}) => {
  const difference = useMemo(
    () =>
      getDividedDifference(
        points.map((point) => DDNode.fromPoint(point[0], point[1]))
      ),
    [points]
  );

  const grid = useMemo(() => getDifferenceGrid(difference), [difference]);

  const pol = useMemo(
    () => getInterpolationPolynomial(points, difference),
    [points, difference]
  );

  const beautified = useMemo(
    () => (pol ? beautifyPolynomial(pol) : null),
    [pol]
  );

  if (!pol || !beautified) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Enter at least two points to see the divided difference table and
        interpolation polynomial.
      </p>
    );
  }

  return (
    <Fragment key={JSON.stringify(grid)}>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Divided difference table
        </h3>
        <div className="overflow-x-auto -mx-1">
          <div className="flex gap-4 min-w-min py-1">
            {grid.map((layer, i) => (
              <div key={i} className="flex flex-col gap-1">
                {layer.map((cell, j) => (
                  <div
                    key={j}
                    className="min-h-[2.25rem] flex items-center text-gray-900 dark:text-gray-100"
                  >
                    <DividedDifferenceCell cell={cell} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-200 dark:border-zinc-700 mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          Interpolation polynomial
        </h3>
        <div className="rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 p-4 overflow-x-auto">
          <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 [&_.MathJax]:overflow-x-auto">
            <MathJax>
              \(f(x) = {pol.toTex()} = {beautified.toTex()} \)
            </MathJax>
          </p>
        </div>
      </div>
    </Fragment>
  );
};

const DividedDifferenceCell = ({ cell }: { cell: DDNode | '' }) => {
  if (!cell) return <span></span>;
  const formulaStr = cell.formula.toTex();
  const simplifiedFormulaStr = simplify(cell.formula).toTex();
  const combined =
    formulaStr === simplifiedFormulaStr
      ? formulaStr
      : `${formulaStr} = ${simplifiedFormulaStr}`;
  return <MathJax>\({combined}\)</MathJax>;
};
