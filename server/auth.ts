import bcrypt from "bcrypt";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { sessions } from "@shared/schema";
import { eq, gt, and } from "drizzle-orm";

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "blog_session";
const SESSION_EXPIRY_HOURS = 24 * 7; // 7 days

interface SessionData {
  ownerId: string;
  username: string;
  expiresAt: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(ownerId: string, username: string): Promise<string> {
  const sessionId = generateSecureToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  await db.insert(sessions).values({
    id: sessionId,
    ownerId,
    username,
    expiresAt,
  });
  
  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionData | undefined> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    );
  
  if (!session) return undefined;
  
  return {
    ownerId: session.ownerId,
    username: session.username,
    expiresAt: session.expiresAt,
  };
}

export async function destroySession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function destroyAllSessionsForOwner(ownerId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.ownerId, ownerId));
}

export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date();
  await db.delete(sessions).where(gt(now, sessions.expiresAt));
}

export function setSessionCookie(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionFromRequest(req: Request): Promise<SessionData | undefined> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionId) return undefined;
  return getSession(sessionId);
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await getSessionFromRequest(req);
  
  if (!session) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  
  req.session = session;
  next();
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }
    
    const owner = await storage.getSiteOwnerByUsername(username);
    
    if (!owner) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    
    const isValid = await verifyPassword(password, owner.passwordHash);
    
    if (!isValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    
    const sessionId = await createSession(owner.id, owner.username);
    setSessionCookie(res, sessionId);
    
    res.json({
      user: {
        id: owner.id,
        username: owner.username,
        displayName: owner.displayName,
        recoveryEmail: owner.recoveryEmail,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (sessionId) {
    await destroySession(sessionId);
  }
  
  clearSessionCookie(res);
  res.json({ message: "Logged out successfully" });
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const session = await getSessionFromRequest(req);
  
  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  
  const owner = await storage.getSiteOwner();
  
  if (!owner || owner.id !== session.ownerId) {
    clearSessionCookie(res);
    res.status(401).json({ message: "Session invalid" });
    return;
  }
  
  res.json({
    user: {
      id: owner.id,
      username: owner.username,
      displayName: owner.displayName,
      recoveryEmail: owner.recoveryEmail,
    },
  });
}
