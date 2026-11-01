import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { SceneSequence } from '../components/SceneSequence'
import './ReflectionScene.css'

export function ReflectionScene({ onContinue }) {
  return (
    <SceneFrame className="scene--reflection">
      <span className="rule" aria-hidden="true" />
      <SceneSequence text={'Tu mejor versión se construye\nuna decisión a la vez.'} characterMs={80}>
        <div className="reflection-button-enter"><ContinueButton onClick={onContinue} /></div>
      </SceneSequence>
    </SceneFrame>
  )
}
