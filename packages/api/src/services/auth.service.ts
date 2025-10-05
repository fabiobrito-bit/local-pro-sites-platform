import { db } from '../models/db.js';
import { users, sessions, userTotpSecrets, clientProfiles, activities } from '../models/schema.js';
import { hashPassword, verifyPassword, generateBackupCodes } from '../utils/crypto.js';
import { signToken } from '../utils/jwt.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { TOTP } from 'otpauth';
import QRCode from 'qrcode';

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'client' | 'admin';
  businessName?: string;
}) {
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

  if (existingUser.length > 0) {
    throw new Error('Email al in gebruik');
  }

  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'client',
    })
    .returning();

  // Create client profile if role is client
  if (user.role === 'client' && data.businessName) {
    await db.insert(clientProfiles).values({
      userId: user.id,
      businessName: data.businessName,
    });
  }

  // Log activity
  await db.insert(activities).values({
    userId: user.id,
    actionType: 'user_registered',
    description: `Nieuwe gebruiker geregistreerd: ${user.email}`,
  });

  return user;
}

export async function loginUser(email: string, password: string, totpToken?: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new Error('Ongeldige inloggegevens');
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);

  if (!isValidPassword) {
    throw new Error('Ongeldige inloggegevens');
  }

  // Check 2FA if enabled
  if (user.twoFaEnabled) {
    if (!totpToken) {
      return { requiresTwoFa: true, userId: user.id };
    }

    const [totpSecret] = await db
      .select()
      .from(userTotpSecrets)
      .where(eq(userTotpSecrets.userId, user.id))
      .limit(1);

    if (!totpSecret) {
      throw new Error('2FA configuratie niet gevonden');
    }

    const totp = new TOTP({
      secret: totpSecret.secret,
      digits: 6,
      period: 30,
    });

    const isValidToken = totp.validate({ token: totpToken, window: 1 }) !== null;

    if (!isValidToken) {
      // Check backup codes
      const backupCodes = totpSecret.backupCodes || [];
      const backupCodeIndex = backupCodes.indexOf(totpToken);

      if (backupCodeIndex === -1) {
        throw new Error('Ongeldige 2FA code');
      }

      // Remove used backup code
      backupCodes.splice(backupCodeIndex, 1);
      await db
        .update(userTotpSecrets)
        .set({ backupCodes })
        .where(eq(userTotpSecrets.userId, user.id));
    }
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    adminRole: user.adminRole || undefined,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    userId: user.id,
    sessionToken: token,
    expiresAt,
  });

  // Log activity
  await db.insert(activities).values({
    userId: user.id,
    actionType: 'user_login',
    description: `Gebruiker ingelogd: ${user.email}`,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      adminRole: user.adminRole,
      avatarUrl: user.avatarUrl,
      twoFaEnabled: user.twoFaEnabled,
    },
  };
}

export async function setupTwoFa(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error('Gebruiker niet gevonden');
  }

  const totp = new TOTP({
    issuer: 'Local Pro Sites',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  const secret = totp.secret.base32;
  const backupCodes = generateBackupCodes();

  await db
    .insert(userTotpSecrets)
    .values({
      userId: user.id,
      secret,
      backupCodes,
    })
    .onConflictDoUpdate({
      target: userTotpSecrets.userId,
      set: { secret, backupCodes },
    });

  const qrCodeUrl = await QRCode.toDataURL(totp.toString());

  return {
    secret,
    qrCode: qrCodeUrl,
    backupCodes,
  };
}

export async function enableTwoFa(userId: string, token: string) {
  const [totpSecret] = await db
    .select()
    .from(userTotpSecrets)
    .where(eq(userTotpSecrets.userId, userId))
    .limit(1);

  if (!totpSecret) {
    throw new Error('2FA nog niet ingesteld');
  }

  const totp = new TOTP({
    secret: totpSecret.secret,
    digits: 6,
    period: 30,
  });

  const isValidToken = totp.validate({ token, window: 1 }) !== null;

  if (!isValidToken) {
    throw new Error('Ongeldige verificatiecode');
  }

  await db.update(users).set({ twoFaEnabled: true }).where(eq(users.id, userId));

  // Log activity
  await db.insert(activities).values({
    userId,
    actionType: 'two_fa_enabled',
    description: '2FA ingeschakeld',
  });

  return { success: true };
}

export async function disableTwoFa(userId: string) {
  await db.update(users).set({ twoFaEnabled: false }).where(eq(users.id, userId));
  await db.delete(userTotpSecrets).where(eq(userTotpSecrets.userId, userId));

  // Log activity
  await db.insert(activities).values({
    userId,
    actionType: 'two_fa_disabled',
    description: '2FA uitgeschakeld',
  });

  return { success: true };
}

export async function logout(token: string) {
  await db.delete(sessions).where(eq(sessions.sessionToken, token));
  return { success: true };
}
