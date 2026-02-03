'use client'

import { FeatureErrorBoundary } from '@/components/ErrorBoundary'
import { GameBoard } from '@/features/game'

export default function Home(): React.JSX.Element {
  return (
    <FeatureErrorBoundary featureName="game">
      <GameBoard />
    </FeatureErrorBoundary>
  )
}
