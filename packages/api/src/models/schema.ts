import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users & Authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('client'), // 'client' | 'admin'
  adminRole: varchar('admin_role', { length: 50 }), // 'super_admin' | 'support_admin' | null
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  twoFaEnabled: boolean('two_fa_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionToken: varchar('session_token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  tokenIdx: index('sessions_token_idx').on(table.sessionToken),
}));

export const userTotpSecrets = pgTable('user_totp_secrets', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  secret: varchar('secret', { length: 255 }).notNull(),
  backupCodes: jsonb('backup_codes').$type<string[]>(),
});

// Clients & Business Info
export const clientProfiles = pgTable('client_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessDescription: text('business_description'),
  phoneNumber: varchar('phone_number', { length: 50 }),
  businessHours: jsonb('business_hours').$type<Record<string, { open: string; close: string }>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('client_profiles_user_id_idx').on(table.userId),
}));

// Website Management
export const websites = pgTable('websites', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clientProfiles.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active' | 'inactive' | 'maintenance'
  replitProjectId: varchar('replit_project_id', { length: 255 }),
  replitProjectUrl: varchar('replit_project_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('websites_client_id_idx').on(table.clientId),
  statusIdx: index('websites_status_idx').on(table.status),
}));

export const websiteContent = pgTable('website_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  websiteId: uuid('website_id').references(() => websites.id, { onDelete: 'cascade' }).notNull(),
  section: varchar('section', { length: 100 }).notNull(), // 'hero' | 'about' | 'services' | 'contact' | etc
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'text' | 'html' | 'json' | 'image'
  content: jsonb('content').notNull(),
  version: integer('version').notNull().default(1),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  websiteIdIdx: index('website_content_website_id_idx').on(table.websiteId),
  sectionIdx: index('website_content_section_idx').on(table.section),
}));

export const replitIntegrations = pgTable('replit_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  websiteId: uuid('website_id').references(() => websites.id, { onDelete: 'cascade' }).notNull().unique(),
  replitTokenEncrypted: text('replit_token_encrypted').notNull(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  autoDeploy: boolean('auto_deploy').default(true),
  syncStatus: varchar('sync_status', { length: 50 }).default('idle'), // 'idle' | 'syncing' | 'error'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Chat & Change Requests
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clientProfiles.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  context: jsonb('context').$type<Record<string, any>>(),
  totalTokens: integer('total_tokens').default(0),
  status: varchar('status', { length: 50 }).default('active'), // 'active' | 'archived' | 'escalated'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('chat_sessions_client_id_idx').on(table.clientId),
  statusIdx: index('chat_sessions_status_idx').on(table.status),
}));

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  tokenCount: integer('token_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('chat_messages_session_id_idx').on(table.sessionId),
}));

export const changeRequests = pgTable('change_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clientProfiles.id, { onDelete: 'cascade' }).notNull(),
  websiteId: uuid('website_id').references(() => websites.id, { onDelete: 'cascade' }).notNull(),
  requestType: varchar('request_type', { length: 100 }).notNull(), // 'content_change' | 'hours_update' | 'logo_update' | 'contact_info'
  description: text('description').notNull(),
  oldContent: jsonb('old_content'),
  newContent: jsonb('new_content').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'auto_approved' | 'approved' | 'rejected' | 'completed'
  priority: varchar('priority', { length: 50 }).default('medium'), // 'low' | 'medium' | 'high'
  autoApprovable: boolean('auto_approvable').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('change_requests_client_id_idx').on(table.clientId),
  websiteIdIdx: index('change_requests_website_id_idx').on(table.websiteId),
  statusIdx: index('change_requests_status_idx').on(table.status),
}));

// Analytics & Activity
export const websiteAnalytics = pgTable('website_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  websiteId: uuid('website_id').references(() => websites.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  visitors: integer('visitors').default(0),
  pageViews: integer('page_views').default(0),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }),
  avgSessionDuration: integer('avg_session_duration'), // in seconds
}, (table) => ({
  websiteIdIdx: index('website_analytics_website_id_idx').on(table.websiteId),
  dateIdx: index('website_analytics_date_idx').on(table.date),
  uniqueWebsiteDate: unique('unique_website_date').on(table.websiteId, table.date),
}));

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('activities_user_id_idx').on(table.userId),
  actionTypeIdx: index('activities_action_type_idx').on(table.actionType),
  createdAtIdx: index('activities_created_at_idx').on(table.createdAt),
}));

// Support System
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clientProfiles.id, { onDelete: 'cascade' }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('open'), // 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: varchar('priority', { length: 50 }).default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  assignedAdmin: uuid('assigned_admin').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('support_tickets_client_id_idx').on(table.clientId),
  statusIdx: index('support_tickets_status_idx').on(table.status),
  assignedAdminIdx: index('support_tickets_assigned_admin_idx').on(table.assignedAdmin),
}));

export const supportTicketMessages = pgTable('support_ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => supportTickets.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull(),
  attachments: jsonb('attachments').$type<{ filename: string; url: string; size: number }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  ticketIdIdx: index('support_ticket_messages_ticket_id_idx').on(table.ticketId),
}));

// Files & Storage
export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  visibility: varchar('visibility', { length: 50 }).default('private'), // 'private' | 'public'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('files_user_id_idx').on(table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  clientProfile: one(clientProfiles, { fields: [users.id], references: [clientProfiles.userId] }),
  totpSecret: one(userTotpSecrets, { fields: [users.id], references: [userTotpSecrets.userId] }),
  sessions: many(sessions),
  activities: many(activities),
  files: many(files),
}));

export const clientProfilesRelations = relations(clientProfiles, ({ one, many }) => ({
  user: one(users, { fields: [clientProfiles.userId], references: [users.id] }),
  websites: many(websites),
  chatSessions: many(chatSessions),
  changeRequests: many(changeRequests),
  supportTickets: many(supportTickets),
}));

export const websitesRelations = relations(websites, ({ one, many }) => ({
  client: one(clientProfiles, { fields: [websites.clientId], references: [clientProfiles.id] }),
  content: many(websiteContent),
  replitIntegration: one(replitIntegrations, { fields: [websites.id], references: [replitIntegrations.websiteId] }),
  analytics: many(websiteAnalytics),
  changeRequests: many(changeRequests),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  client: one(clientProfiles, { fields: [chatSessions.clientId], references: [clientProfiles.id] }),
  messages: many(chatMessages),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  client: one(clientProfiles, { fields: [supportTickets.clientId], references: [clientProfiles.id] }),
  assignedTo: one(users, { fields: [supportTickets.assignedAdmin], references: [users.id] }),
  messages: many(supportTicketMessages),
}));
