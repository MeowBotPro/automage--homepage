import { z } from 'zod';

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const trimmedRequiredString = (max: number, message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        return value.trim();
      }

      if (value === undefined || value === null) {
        return '';
      }

      return value;
    },
    z.string().min(1, message).max(max),
  );

const trimmedOptionalString = (max: number) =>
  z.preprocess(emptyStringToUndefined, z.string().trim().max(max).optional());

const rawBetaApplicationSchema = z.object({
  occupation: trimmedRequiredString(128, '请选择职业 / 身份'),
  work_background: trimmedOptionalString(1000),
  use_case: trimmedRequiredString(256, '请选择应用场景'),
  contact: trimmedRequiredString(128, '请输入联系方式'),
  invite_code: trimmedOptionalString(64),
  source: trimmedOptionalString(64),
});

export type InviteCodeStatus = 'none' | 'valid' | 'not_found' | 'inactive' | 'expired' | 'exhausted';

export type BetaApplicationRecord = {
  id: string;
  public_id: string;
  occupation: string;
  work_background: string | null;
  use_case: string;
  contact: string;
  invite_code: string | null;
  invite_code_valid: boolean;
  invite_code_status: InviteCodeStatus;
  priority_level: string;
  priority_reason: string | null;
  review_status: string;
  reviewer_note: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type NormalizedBetaApplicationInput = {
  occupation: string;
  work_background: string | null;
  use_case: string;
  contact: string;
  invite_code: string | null;
  source: string;
  raw_payload: Record<string, unknown>;
};

export function normalizeBetaApplicationInput(payload: unknown): NormalizedBetaApplicationInput {
  const parsed = rawBetaApplicationSchema.parse(payload);

  return {
    occupation: parsed.occupation,
    work_background: parsed.work_background ?? null,
    use_case: parsed.use_case,
    contact: parsed.contact,
    invite_code: parsed.invite_code ? parsed.invite_code.toUpperCase() : null,
    source: parsed.source ?? 'landing_page',
    raw_payload: isRecord(payload) ? payload : {},
  };
}

export function serializeBetaApplicationRecord(record: BetaApplicationRecord) {
  return {
    application_id: record.id,
    application_public_id: record.public_id,
    occupation: record.occupation,
    work_background: record.work_background,
    use_case: record.use_case,
    contact: record.contact,
    invite_code_valid: record.invite_code_valid,
    invite_code_status: record.invite_code_status,
    priority_level: record.priority_level,
    review_status: record.review_status,
    source: record.source,
  };
}

export function formatZodErrorMessage(error: z.ZodError) {
  const message = error.issues[0]?.message;
  return message ?? '请求参数不合法';
}

export { z };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
