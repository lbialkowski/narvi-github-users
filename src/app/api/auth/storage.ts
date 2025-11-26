import { 
  AuthenticatorTransportFuture, 
  PublicKeyCredentialCreationOptionsJSON, 
  PublicKeyCredentialRequestOptionsJSON 
} from "@simplewebauthn/server";

export interface User {
  id: string;
  email: string;
}

export interface FidoCredential {
  id: string; // Database ID (randomUUID)
  userId: string;
  credId: string; // Credential ID from authenticator
  pubKey: string;
  counter: number;
  transports: AuthenticatorTransportFuture[];
}

class InMemoryStorage {
  private users: Map<string, User> = new Map(); // email -> User
  private credentials: FidoCredential[] = [];
  
  // Session simulation
  // sessionId -> { regOptions?, authOptions?, userId? }
  private sessions: Map<string, {
    regOptions?: PublicKeyCredentialCreationOptionsJSON;
    authOptions?: PublicKeyCredentialRequestOptionsJSON;
    userId?: string;
    email?: string; // Added to help track user in session
  }> = new Map();

  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.email, user);
    return user;
  }

  // Credential methods
  async findCredentialsByUserId(userId: string): Promise<FidoCredential[]> {
    return this.credentials.filter(c => c.userId === userId);
  }

  async findCredentialByCredId(credId: string): Promise<FidoCredential | null> {
    // In a real DB we might query by credId directly. 
    // Here we assume credId is unique enough.
    return this.credentials.find(c => c.credId === credId) || null;
  }

  async createCredential(credential: FidoCredential): Promise<FidoCredential> {
    this.credentials.push(credential);
    return credential;
  }

  async updateCredentialCounter(id: string, counter: number): Promise<void> {
    const cred = this.credentials.find(c => c.id === id);
    if (cred) {
      cred.counter = counter;
    }
  }

  // Session methods
  getSession(sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {});
    }
    return this.sessions.get(sessionId)!;
  }

  updateSession(sessionId: string, data: Partial<{
    regOptions?: PublicKeyCredentialCreationOptionsJSON;
    authOptions?: PublicKeyCredentialRequestOptionsJSON;
    userId?: string;
    email?: string;
  }>) {
    const current = this.getSession(sessionId);
    this.sessions.set(sessionId, { ...current, ...data });
  }
}

// Singleton instance
export const storage = new InMemoryStorage();

