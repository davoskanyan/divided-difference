import { useState } from 'react'

type Point = [number, number]

function validatePoints(points: Point[]): { validatedPoints: Point[]; error: string | null } {
  const validatedPoints: Point[] = []
  let error: string | null = null

  points.forEach(point => {
    const hasValues = !Number.isNaN(point[0]) && !Number.isNaN(point[1])
    const isUnique = !validatedPoints.some(validatePoint => validatePoint[0] === point[0])

    if (!isUnique) {
      error = `Error: You have duplicate values for x=${point[0]}`
    }

    if (hasValues && isUnique) {
      validatedPoints.push(point)
    }
  })

  validatedPoints.sort((p1, p2) => p1[0] - p2[0])

  return { validatedPoints, error }
}

export const EnterPoints = ({
  points,
  onChange,
}: {
  points: Point[]
  onChange: (points: Point[]) => void
}) => {
  const [pointsState, setPointsState] = useState<Point[]>(points)
  const [error, setError] = useState<string | undefined>()

  const handlePointChange = (newPoints: Point[]) => {
    setPointsState(newPoints)
    const { validatedPoints, error } = validatePoints(newPoints)
    setError(error ?? undefined)
    onChange(validatedPoints)
  }

  const handleEdit = (row: number, index: number, newValue: number) => {
    const newPoints = pointsState.with(row, pointsState[row].with(index, newValue) as Point)
    handlePointChange(newPoints)
  }

  const handleRemoveRow = (index: number) => {
    const newPoints = [...pointsState.slice(0, index), ...pointsState.slice(index + 1)]
    handlePointChange(newPoints)
  }

  const handleAddPoint = () => {
    const newPoints = [...pointsState, [NaN, NaN] as Point]
    handlePointChange(newPoints)
  }

  return (
    <>
      <div id="point-input-grid">
        {pointsState.map((point, rowIndex) => (
          <div id="point-input-row" key={rowIndex}>
            <PointInput
              value={point[0]}
              onChange={newValue => handleEdit(rowIndex, 0, newValue)}
            />
            <PointInput
              value={point[1]}
              onChange={newValue => handleEdit(rowIndex, 1, newValue)}
            />
            <button onClick={() => handleRemoveRow(rowIndex)}>✕</button>
          </div>
        ))}
        <button onClick={handleAddPoint}>Add new point</button>
        {error && <p className="error">{error}</p>}
      </div>
    </>
  )
}

const PointInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const inputValue = Number.isNaN(value) ? '' : value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.valueAsNumber)

  return <input type="number" value={inputValue} onChange={handleChange} />
}
