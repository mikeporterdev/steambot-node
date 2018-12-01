import { Observable, throwError } from 'rxjs';
import { Metacritic, SimpleSteamApp, SteamGame } from '../models/steam-api.models';
import { map } from 'rxjs/operators';
import { Http } from './http';
import { HTMLElement, parse } from 'node-html-parser';

export class SteamApi {
  private readonly _http: Http;

  constructor() {
    this._http = new Http();
  }

  public getFullSteamDetails(game: SimpleSteamApp): Observable<SteamGame> {
    const uri = `https://store.steampowered.com/api/appdetails?appids=${game.appId}`;
    return this._http.get(uri).pipe(
      map((app: any) => {
        const bodyElement = app.body[game.appId];
        if (bodyElement.success && bodyElement.data.type === 'game') {
          return bodyElement.data;
        } else {
          throw throwError(new Error('Could not find on STore'));
        }
      }),
      map((app: any) => {
        const metacritic = app.metacritic ? new Metacritic(app.metacritic.score) : undefined;
        return new SteamGame(
          app.type,
          app.name,
          app.steam_appid,
          app.is_free,
          app.header_image,
          app.short_description,
          app.release_date.date,
          metacritic
        );
      })
    );
  }

  public search(name: string): Observable<SimpleSteamApp> {
    const url = `https://store.steampowered.com/search/suggest?term=${encodeURI(
      name
    )}&f=games&cc=GB&l=english&excluded_content_descriptors%5B%5D=3&excluded_content_descriptors%5B%5D=4&v=5488179`;
    return this._http.get(url, false).pipe(
      map((apps: any) => {
          return this.parseHtmlIntoSteamGames(apps);
      })
    );
  }

  public parseHtmlIntoSteamGames(apps: any) {
    const htmlElement: HTMLElement = parse(apps.body);
    return this.getSteamGameFromHtml(htmlElement);
  }

  private getSteamGameFromHtml(htmlElement: HTMLElement) {
    const nodes = htmlElement.querySelectorAll('a');
    if (!nodes || !nodes.length) throw new Error('No games found!');
    const firstLink = nodes[0];
    const appName = firstLink.childNodes[0].text;
    const data = (firstLink as HTMLElement).attributes;
    const appId: any = data['data-ds-appid'];
    return new SimpleSteamApp(appId, appName);
  }
}
