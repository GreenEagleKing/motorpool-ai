import type { SearchRecord } from '../core/agent.ts';

export function retrievalPass(expectedIds: string[], searches: SearchRecord[]): boolean {
  // 1. flatten every search's hitIds into one list
  // 2. return whether every expected id is in that list
  const flatSearchIds = searches.flatMap((s) => s.hitIds);
  return expectedIds.every((e) => flatSearchIds.includes(e));
}

export function answerPass(mustMention: (string | string[])[], answer: string): boolean {
  // 1. lowercase the answer once
  const answerLower = answer.toLowerCase();
  // 2. for every item in mustMention:
  //      - if it's an array → does SOME spelling appear in the answer?
  //      - otherwise        → does the string appear in the answer?
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
