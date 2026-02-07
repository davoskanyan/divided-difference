import { useState } from 'react'
import { NumberField, Button, ActionButton, InlineAlert } from '@react-spectrum/s2'

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
    <div className="flex flex-col gap-2">
      {pointsState.map((point, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 items-center">
          <NumberField
            aria-label={`Point ${rowIndex + 1} x`}
            value={Number.isNaN(point[0]) ? undefined : point[0]}
            onChange={(v: number) => handleEdit(rowIndex, 0, v)}
          />
          <NumberField
            aria-label={`Point ${rowIndex + 1} y`}
            value={Number.isNaN(point[1]) ? undefined : point[1]}
            onChange={(v: number) => handleEdit(rowIndex, 1, v)}
          />
          <ActionButton onPress={() => handleRemoveRow(rowIndex)} aria-label="Remove row">
            ✕
          </ActionButton>
        </div>
      ))}
      <Button onPress={handleAddPoint}>Add new point</Button>
      {error && (
        <InlineAlert variant="negative">{error}</InlineAlert>
      )}
    </div>
  )
}
