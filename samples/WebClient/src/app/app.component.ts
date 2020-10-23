import { Component, OnInit, isDevMode } from '@angular/core';

import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';

import { UserService } from './shared/services/user.service';

@Component({
  selector: 'tw-root',
  template: `<tw-shell></tw-shell>`
})
export class AppComponent implements OnInit {
  public loading = true;

  public constructor(
    private user: UserService,
    private oauthService: OAuthService
  ) { }

  public ngOnInit(): void {
    this.configure();
  }

  private async configure() {
    const issuer = 'https://localhost:5000';

    this.oauthService.configure({
      clientId: 'frontend',
      issuer: issuer,
      redirectUri: isDevMode()
        ? 'http://localhost:4200'
        : window.location.origin,
      responseType: 'code',
      scope: 'openid profile api1',
      loginUrl: issuer + '/account/login',
      logoutUrl: issuer + '/account/logout',
      requireHttps: false,
      showDebugInformation: true
    });

    this.oauthService.events.subscribe(async (e: OAuthEvent) => {
      // console.log(e);

      if (e.type === 'token_received' || e.type === 'token_refreshed') {
        this.user.setProperties(this.oauthService.getAccessToken());
      }
    });

    this.oauthService.loadDiscoveryDocumentAndLogin({
      onTokenReceived: context => {
        this.user.setProperties(context.accessToken);
      }
    });
  }
}
