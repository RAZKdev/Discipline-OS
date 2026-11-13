import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

describe('Discipline-OS i18n Dictionary Integrity', () => {
  it('should have both Indonesian and English translation trees', () => {
    expect(translations.id).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('should have exact key parity between ID and EN dictionaries', () => {
    function extractKeys(obj: Record<string, any>, prefix = ''): string[] {
      let keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          keys = keys.concat(extractKeys(value, full));
        } else {
          keys.push(full);
        }
      }
      return keys;
    }

    const idKeys = extractKeys(translations.id).sort();
    const enKeys = extractKeys(translations.en).sort();

    expect(idKeys).toEqual(enKeys);
    expect(idKeys.length).toBeGreaterThan(0);
  });

  it('should have matching parameter placeholders in both languages', () => {
    function checkParams(idObj: Record<string, any>, enObj: Record<string, any>, path = '') {
      for (const key of Object.keys(idObj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const idVal = idObj[key];
        const enVal = enObj[key];

        if (typeof idVal === 'object' && idVal !== null) {
          checkParams(idVal, enVal, currentPath);
        } else if (typeof idVal === 'string' && typeof enVal === 'string') {
          const idMatches = (idVal.match(/\{(\w+)\}/g) || []).sort();
          const enMatches = (enVal.match(/\{(\w+)\}/g) || []).sort();
          expect(idMatches).toEqual(enMatches);
        }
      }
    }

    checkParams(translations.id, translations.en);
  });
});
