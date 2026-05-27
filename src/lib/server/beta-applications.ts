import { randomBytes } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import type { InviteCodeModel } from '@/generated/prisma/models/InviteCode';
import { prisma } from '@/lib/server/prisma';
import {
  normalizeBetaApplicationInput,
  serializeBetaApplicationRecord,
  type BetaApplicationRecord,
  type InviteCodeStatus,
} from '@/lib/server/beta-application-schema';

export type CreateBetaApplicationParams = {
  payload: unknown;
  requestId: string;
  userAgent: string | null;
  referrer: string | null;
};

type InviteValidationResult = {
  status: InviteCodeStatus;
  valid: boolean;
  priorityLevel: 'high' | 'medium';
  priorityReason: string | null;
};

export async function createBetaApplication({
  payload,
  requestId,
  userAgent,
  referrer,
}: CreateBetaApplicationParams) {
  const normalized = normalizeBetaApplicationInput(payload);
  const publicId = generatePublicId();
  const now = new Date();
  const meta: Prisma.InputJsonObject = {
    raw_payload: toInputJsonValue(normalized.raw_payload),
    request_id: requestId,
    user_agent: userAgent,
    referrer,
  };

  const record = await prisma.$transaction(async (tx) => {
    const invite = normalized.invite_code
      ? await validateInviteCode(tx, normalized.invite_code, now)
      : {
          status: 'none',
          valid: false,
          priorityLevel: 'medium',
          priorityReason: null,
        } satisfies InviteValidationResult;

    return tx.betaApplication.create({
      data: {
        publicId,
        occupation: normalized.occupation,
        workBackground: normalized.work_background,
        useCase: normalized.use_case,
        contact: normalized.contact,
        inviteCode: normalized.invite_code,
        inviteCodeValid: invite.valid,
        inviteCodeStatus: invite.status,
        priorityLevel: invite.priorityLevel,
        priorityReason: invite.priorityReason,
        reviewStatus: 'new',
        source: normalized.source,
        meta,
      },
    });
  });

  return {
    record: serializeBetaApplicationRecord(toBetaApplicationRecord(record)),
  };
}

async function validateInviteCode(
  tx: Prisma.TransactionClient,
  code: string,
  now: Date,
): Promise<InviteValidationResult> {
  const inviteCode = await tx.inviteCode.findUnique({
    where: { code },
  });

  const status = getInviteCodeStatus(inviteCode, now);
  if (status !== 'valid') {
    return {
      status,
      valid: false,
      priorityLevel: 'medium',
      priorityReason: `invalid_invite_code:${status}`,
    };
  }

  const update = await tx.inviteCode.updateMany({
    where: {
      id: inviteCode!.id,
      isActive: true,
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
        {
          OR: [
            { maxUses: null },
            { usedCount: { lt: inviteCode!.maxUses ?? 0 } },
          ],
        },
      ],
    },
    data: {
      usedCount: { increment: 1 },
      updatedAt: now,
    },
  });

  if (update.count === 1) {
    return {
      status: 'valid',
      valid: true,
      priorityLevel: 'high',
      priorityReason: 'valid_invite_code',
    };
  }

  const latestInviteCode = await tx.inviteCode.findUnique({
    where: { code },
  });
  const latestStatus = getInviteCodeStatus(latestInviteCode, now);

  return {
    status: latestStatus === 'valid' ? 'exhausted' : latestStatus,
    valid: false,
    priorityLevel: 'medium',
    priorityReason: `invalid_invite_code:${latestStatus === 'valid' ? 'exhausted' : latestStatus}`,
  };
}

function getInviteCodeStatus(inviteCode: InviteCodeModel | null, now: Date): InviteCodeStatus {
  if (!inviteCode) {
    return 'not_found';
  }

  if (!inviteCode.isActive) {
    return 'inactive';
  }

  if (inviteCode.expiresAt && inviteCode.expiresAt <= now) {
    return 'expired';
  }

  if (inviteCode.maxUses !== null && inviteCode.usedCount >= inviteCode.maxUses) {
    return 'exhausted';
  }

  return 'valid';
}

function toBetaApplicationRecord(record: {
  id: string;
  publicId: string;
  occupation: string;
  workBackground: string | null;
  useCase: string;
  contact: string;
  inviteCode: string | null;
  inviteCodeValid: boolean;
  inviteCodeStatus: string;
  priorityLevel: string;
  priorityReason: string | null;
  reviewStatus: string;
  reviewerNote: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}): BetaApplicationRecord {
  return {
    id: record.id,
    public_id: record.publicId,
    occupation: record.occupation,
    work_background: record.workBackground,
    use_case: record.useCase,
    contact: record.contact,
    invite_code: record.inviteCode,
    invite_code_valid: record.inviteCodeValid,
    invite_code_status: toInviteCodeStatus(record.inviteCodeStatus),
    priority_level: record.priorityLevel,
    priority_reason: record.priorityReason,
    review_status: record.reviewStatus,
    reviewer_note: record.reviewerNote,
    source: record.source,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

function toInviteCodeStatus(status: string): InviteCodeStatus {
  if (
    status === 'none' ||
    status === 'valid' ||
    status === 'not_found' ||
    status === 'inactive' ||
    status === 'expired' ||
    status === 'exhausted'
  ) {
    return status;
  }

  return 'none';
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue | null {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => entry === undefined ? null : toInputJsonValue(entry));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, toInputJsonValue(entry)]),
    );
  }

  return String(value);
}

function generatePublicId() {
  return `BTA${randomBytes(6).toString('hex').toUpperCase()}`;
}
