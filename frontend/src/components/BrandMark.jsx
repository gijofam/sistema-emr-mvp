import { BRAND } from '../config/brand'

export function BrandMark({ compact = false }) {
  if (BRAND.logoUrl) return <img className="brand-logo" src={BRAND.logoUrl} alt="ELMACHORENACE" />
  return (
    <div className={`brand-placeholder ${compact ? 'brand-placeholder--compact' : ''}`} aria-label="EMR, logo provisional pendiente de asset oficial">
      <span>EMR</span>
    </div>
  )
}
