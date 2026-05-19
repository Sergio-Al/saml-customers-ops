import { Global, Module } from "@nestjs/common";
import { LocalJwtProvider, type IIdentityProvider } from "@ai-ops/auth-sdk";

export const IDENTITY_PROVIDER = "IDENTITY_PROVIDER";

const identityProviderFactory = (): IIdentityProvider => {
  const accessSecret = process.env.JWT_SECRET;
  if (!accessSecret) {
    throw new Error("JWT_SECRET env var is required");
  }
  // tenant-service only verifies access tokens; refresh secret is irrelevant here
  // but the constructor needs a value.
  return new LocalJwtProvider({
    accessSecret,
    refreshSecret: process.env.REFRESH_SECRET ?? accessSecret,
  });
};

@Global()
@Module({
  providers: [
    {
      provide: IDENTITY_PROVIDER,
      useFactory: identityProviderFactory,
    },
  ],
  exports: [IDENTITY_PROVIDER],
})
export class ProviderModule {}
