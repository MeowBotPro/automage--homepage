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
  name: trimmedRequiredString(128, '请输入姓名'),
  company_name: trimmedOptionalString(256),
  company: trimmedOptionalString(256),
  contact: trimmedOptionalString(64),
  phone_or_wechat: trimmedOptionalString(64),
  mobile_or_wechat: trimmedOptionalString(64),
  phone: trimmedOptionalString(64),
  wechat: trimmedOptionalString(64),
  team_size: trimmedOptionalString(64),
  team_members: trimmedOptionalString(64),
  source: trimmedOptionalString(64),
});

export type BetaApplicationRecord = {
  id: number;
  public_id: string;
  name: string;
  company_name: string;
  contact: string;
  team_size: string | null;
  review_status: string;
  slot_status: string;
  source: string;
  submitted_at: string;
};

export type NormalizedBetaApplicationInput = {
  name: string;
  company_name: string;
  contact: string;
  team_size: string | null;
  source: string;
  raw_payload: Record<string, unknown>;
  normalized_aliases: string[];
};

export function normalizeBetaApplicationInput(payload: unknown): NormalizedBetaApplicationInput {
  const parsed = rawBetaApplicationSchema.parse(payload);

  const normalizedAliases: string[] = [];

  const companyName = parsed.company_name ?? parsed.company;
  if (parsed.company_name === undefined && parsed.company !== undefined) {
    normalizedAliases.push('company');
  }

  const contactAliasMap = [
    ['phone_or_wechat', parsed.phone_or_wechat],
    ['mobile_or_wechat', parsed.mobile_or_wechat],
    ['phone', parsed.phone],
    ['wechat', parsed.wechat],
  ] as const;

  const contactAliasEntry = contactAliasMap.find(([, value]) => value !== undefined);
  const contact = parsed.contact ?? contactAliasEntry?.[1];
  if (parsed.contact === undefined && contactAliasEntry) {
    normalizedAliases.push(contactAliasEntry[0]);
  }

  const teamSize = parsed.team_size ?? parsed.team_members;
  if (parsed.team_size === undefined && parsed.team_members !== undefined) {
    normalizedAliases.push('team_members');
  }

  const requiredSchema = z.object({
    company_name: trimmedRequiredString(256, '请输入公司名称'),
    contact: trimmedRequiredString(64, '请输入联系方式'),
  });

  const required = requiredSchema.parse({
    company_name: companyName,
    contact,
  });

  return {
    name: parsed.name,
    company_name: required.company_name,
    contact: required.contact,
    team_size: teamSize ?? null,
    source: parsed.source ?? 'landing_page',
    raw_payload: isRecord(payload) ? payload : {},
    normalized_aliases: normalizedAliases,
  };
}

export function serializeBetaApplicationRecord(record: BetaApplicationRecord) {
  return {
    application_id: record.id,
    application_public_id: record.public_id,
    name: record.name,
    company_name: record.company_name,
    contact: record.contact,
    team_size: record.team_size,
    review_status: record.review_status,
    slot_status: record.slot_status,
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
