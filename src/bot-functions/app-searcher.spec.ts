import { AppSearcher } from './app-searcher';
import { SimpleSteamApp } from '../models/steam-api.models';

describe('AppSearcher', () => {
  describe('San Andreas', () => {
    let appSearcher: AppSearcher;
    let apps: SimpleSteamApp[];

    beforeEach(() => {
      appSearcher = new AppSearcher();
      apps = [
        new SimpleSteamApp(1, 'Grand Theft Auto III'),
        new SimpleSteamApp(2, 'Grand Theft Auto: San Andreas'),
      ];
    });

    it('should find from heft auto san', () => {
      const found = appSearcher.searchApps(apps, 'heft auto san', []);
      expect(found[0].name).toBe('Grand Theft Auto: San Andreas');
    });

    it('should find from san andreas', () => {
      const found = appSearcher.searchApps(apps, 'san andreas', []);
      expect(found[0].name).toBe('Grand Theft Auto: San Andreas');
    });

    it('should find from Grand Theft Auto: San Andreas', () => {
      const found = appSearcher.searchApps(apps, 'Grand Theft Auto: San Andreas', []);
      expect(found[0].name).toBe('Grand Theft Auto: San Andreas');
    });
  });

});
