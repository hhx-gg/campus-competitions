import { describe, expect, it } from 'vitest'
import { competitions } from './allCompetitions'
import { officialMaterialsFor } from './competitionMaterials'
import { competitionName } from './competitionI18n'

describe('official competition materials', () => {
  it('gives every competition at least one labeled HTTPS official resource', () => {
    for (const competition of competitions) {
      const materials = officialMaterialsFor(competition)
      expect(materials.length).toBeGreaterThan(0)
      for (const material of materials) {
        expect(material.nameZh.trim()).not.toBe('')
        expect(material.nameEn.trim()).not.toBe('')
        expect(new URL(material.url).protocol).toBe('https:')
      }
    }
  })

  it('does not label ordinary web pages as direct files', () => {
    for (const competition of competitions) {
      for (const material of officialMaterialsFor(competition)) {
        if (material.kind === 'file') expect(material.url).toMatch(/\.(pdf|docx?|xlsx?|zip)(?:$|[?#])/i)
      }
    }
  })

  it('exposes verified 2026 attachments as true direct file URLs only', () => {
    const cumcm = competitions.find((item) => item.editionYear === 2026 && item.name.includes('高教社杯'))!
    const chemical = competitions.find((item) => item.editionYear === 2026 && item.name.includes('全国大学生化工设计竞赛'))!
    expect(officialMaterialsFor(cumcm).filter((item) => item.kind === 'file')).toHaveLength(1)
    expect(officialMaterialsFor(chemical).filter((item) => item.kind === 'file')).toHaveLength(4)
    expect(officialMaterialsFor(cumcm).some((item) => item.kind === 'download-page')).toBe(true)
    expect(officialMaterialsFor({ ...cumcm, sourceName: cumcm.name, name: competitionName('en', cumcm) }).filter((item) => item.kind === 'file')).toHaveLength(1)
  })
})
