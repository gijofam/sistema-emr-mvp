import { useEffect, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { SceneSequence } from '../components/SceneSequence'
import { BRAND } from '../config/brand'
import { createMessageImage, downloadMessageImage, shareMessageImage } from '../utils/messageCard'

export function ShareScene({ message, onContinue }) {
  const [feedback, setFeedback] = useState('')
  const [shareFile, setShareFile] = useState(null)

  useEffect(() => {
    let active = true
    createMessageImage(message).then((file) => {
      if (active) setShareFile(file)
    }).catch(() => {})
    return () => { active = false }
  }, [message])

  const act = async (operation) => {
    try {
      const result = await operation(message)
      if (result === 'downloaded') setFeedback('Imagen guardada. Ya puedes compartirla desde tu dispositivo.')
      else if (result === 'unavailable') setFeedback('Para abrir el menú de apps necesitas HTTPS en el celular. Puedes guardar la imagen y compartirla desde tu galería.')
      else if (result === 'shared-text') setFeedback('Se compartió el texto. Para enviar la imagen, usa GUARDAR MENSAJE EMR.')
      else setFeedback('Tu mensaje está listo para continuar su camino.')
    } catch (error) {
      if (error?.name !== 'AbortError') setFeedback('Tu navegador no permitió compartir. Prueba guardando la imagen.')
    }
  }

  return (
    <SceneFrame className="scene--share">
      <SceneSequence as="span" className="eyebrow" text="HAZLO TUYO">
        <div className="story-preview reveal" aria-label="Vista previa de la historia EMR">
          <img className="story-preview__logo" src={BRAND.shareLogoUrl} alt="EMR — El Macho Renace" />
          <small>TU MENSAJE #{String(message.codigo).padStart(3, '0')}</small>
          <p>{message.texto}</p>
          <small>@ELMACHORENACE</small>
        </div>
        <div className="action-group reveal reveal--delay-1">
          <ContinueButton onClick={() => act(downloadMessageImage)}>GUARDAR MENSAJE EMR</ContinueButton>
          <ContinueButton secondary onClick={() => act((currentMessage) => shareMessageImage(currentMessage, shareFile))}>COMPARTIR</ContinueButton>
        </div>
        <p className="feedback" role="status">{feedback}</p>
        <button className="text-action" type="button" onClick={onContinue}>VER MI PROGRESO</button>
      </SceneSequence>
    </SceneFrame>
  )
}
