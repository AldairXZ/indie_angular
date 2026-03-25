import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {

  isWebAuthnAvailable(): boolean {
    return window.PublicKeyCredential !== undefined;
  }

  async registerBiometrics(challengeFromServer: Uint8Array, userEntity: any) {
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challengeFromServer as BufferSource,
      rp: {
        name: "Indie Games Platform",
        id: window.location.hostname
      },
      user: userEntity,
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    return await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });
  }

  async authenticateBiometrics(challengeFromServer: Uint8Array, allowedCredentials: any[]) {
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challengeFromServer as BufferSource,
      allowCredentials: allowedCredentials,
      userVerification: "required",
      timeout: 60000
    };

    return await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
  }
}
