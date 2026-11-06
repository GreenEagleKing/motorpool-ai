import type { SearchRecord } from '../core/agent.ts';

export function retrievalPass(expectedIds: string[], searches: SearchRecord[]): boolean {
  const flatSearchIds = searches.flatMap((s) => s.hitIds);
  return expectedIds.every((e) => flatSearchIds.includes(e));
}

export function answerPass(mustMention: (string | string[])[], answer: string): boolean {
  const answerLower = answer.toLowerCase();
  return mustMention.every((item) => {
    if (Array.isArray(item)) {
      return item.some((s) => answerLower.includes(s.toLowerCase()));
    } else {
      return answerLower.includes(item.toLowerCase());
    }
  });
}

export function isRefusal(answer: string): boolean {
  return answer.trimStart().startsWith('NOT IN KB:');
}
