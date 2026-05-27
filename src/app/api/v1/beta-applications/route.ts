import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { createBetaApplication } from '@/lib/server/beta-applications';
import { formatZodErrorMessage } from '@/lib/server/beta-application-schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        code: 400,
        data: null,
        msg: '请求体必须是合法的 JSON',
      },
      { status: 400 },
    );
  }

  try {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
    const data = await createBetaApplication({
      payload,
      requestId,
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });

    return NextResponse.json({
      code: 200,
      data,
      msg: '内测申请提交成功',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          msg: formatZodErrorMessage(error),
        },
        { status: 422 },
      );
    }

    console.error('Failed to create beta application', error);

    return NextResponse.json(
      {
        code: 500,
        data: null,
        msg: '内测申请提交失败，请稍后重试',
      },
      { status: 500 },
    );
  }
}
