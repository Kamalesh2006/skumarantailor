import { GARMENT_TYPES, GARMENT_GENDER_MAP, GARMENT_CONFIGS } from '../measurements'

describe('measurements configuration', () => {
  it('contains expected garment types', () => {
    expect(GARMENT_TYPES).toContain('Shirt')
    expect(GARMENT_TYPES).toContain('Pant')
    expect(GARMENT_TYPES).toContain('Blouse')
    expect(GARMENT_TYPES.length).toBeGreaterThan(0)
  })

  it('maps every garment type to a gender', () => {
    GARMENT_TYPES.forEach(type => {
      const gender = GARMENT_GENDER_MAP[type]
      expect(['male', 'female', 'unisex']).toContain(gender)
    })
  })

  it('provides a measurement config for every garment type', () => {
    GARMENT_TYPES.forEach(type => {
      const config = GARMENT_CONFIGS[type]
      expect(config).toBeDefined()
      expect(Array.isArray(config)).toBe(true)
      expect(config.length).toBeGreaterThan(0)
      
      // Check each field in the config
      config.forEach(field => {
        expect(field).toHaveProperty('id')
        expect(field).toHaveProperty('labelKey')
        expect(field).toHaveProperty('placeholder')
        expect(typeof field.id).toBe('string')
        expect(typeof field.labelKey).toBe('string')
        expect(typeof field.placeholder).toBe('string')
      })
    })
  })

  it('has correct specific mappings', () => {
    expect(GARMENT_GENDER_MAP['Shirt']).toBe('male')
    expect(GARMENT_GENDER_MAP['Blouse']).toBe('female')
    expect(GARMENT_GENDER_MAP['General']).toBe('unisex')
  })
})
