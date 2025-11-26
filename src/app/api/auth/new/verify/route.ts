import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyRegistrationResponse,
  RegistrationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { storage, FidoCredential } from "../../storage";
import { randomUUID } from "crypto";

const rpID = "narvi-github-users.vercel.app";
const androidOrigin = "android:apk-key-hash:-sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w";
const defaultOrigin = `https://${rpID}`;

export async function POST(request: Request) {
  const body = await request.json();
  const regResponse: RegistrationResponseJSON & { platform?: string; response?: { transports?: AuthenticatorTransportFuture[] } } = body;

  if (!regResponse) {
    return new NextResponse("no request body", { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  
  if (!sessionId) {
    return new NextResponse("Session not found", { status: 400 });
  }

  const sessionData = storage.getSession(sessionId);
  const regOptions = sessionData.regOptions;

  // Determine origin based on platform flag sent by client
  // Note: regResponse.platform comes from the body extension in the user's example
  const origin = regResponse.platform === "android" ? androidOrigin : defaultOrigin;

  try {
    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: regResponse,
      expectedChallenge: regOptions?.challenge ?? "",
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!registrationInfo) {
      return new NextResponse("no registration info", { status: 400 });
    }

    const counter: number = registrationInfo.credential.counter;
    const pubKey: string = isoUint8Array.toHex(
      registrationInfo.credential.publicKey
    );
    const credentialID: string = registrationInfo.credential.id;
    
    // The user code accessed request.body.response.transports
    // In our case `body` is the request body.
    const transports: AuthenticatorTransportFuture[] = body.response?.transports || [];

    const user = {
      id: sessionData.userId || randomUUID(),
      email: sessionData.email || "", 
    };
    
    // If user doesn't exist, create them (or ensure they are the same)
    // The original code did: await this.userService.create(user, pubKey, counter, credentialID, transports);
    // We need to ensure the user is stored.
    let existingUser = await storage.findUserByEmail(user.email);
    if (!existingUser) {
      await storage.createUser(user);
    }

    const newCredential: FidoCredential = {
      id: randomUUID(),
      userId: user.id,
      credId: credentialID,
      pubKey: pubKey,
      counter: counter,
      transports: transports
    };

    await storage.createCredential(newCredential);

    if (verified) {
      return new NextResponse("OK", { status: 200 });
    } else {
      return new NextResponse("not verified", { status: 400 });
    }
  } catch (error) {
    console.error(error);
    // Return the error object or message as per original code
    return new NextResponse(JSON.stringify(error), { status: 400 });
  }
}

