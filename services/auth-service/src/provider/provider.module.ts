import { Global, Module } from "@nestjs/common";
import { LocalJwtProvider, type IIdentityProvider } from "@ai-ops/auth-sdk";

export const IDENTITY_PROVIDER = "IDENTITY_PROVIDER";

const identityProviderFactory = (): IIdentityProvider => {
  const accessSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.REFRESH_SECRET;
  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT_SECRET and REFRESH_SECRET env vars are required");
  }
  return new LocalJwtProvider({ accessSecret, refreshSecret });
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
