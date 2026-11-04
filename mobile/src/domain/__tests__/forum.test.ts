import { cleanHandle, insertMention, mentionAtCursor, splitMentions, threadReplies, validateHandle, validateReply } from '../forum';

describe('forum, X-style (as the website)', () => {
  test('a reply may be a photo alone', () => {
    expect(validateReply('', 1)).toBeNull();
    expect(validateReply('')).toBeTruthy();
    expect(validateReply('x'.repeat(3001), 1)).toBeTruthy();
  });

  test('usernames', () => {
    expect(validateHandle('ahmet_42')).toBeNull();
    expect(validateHandle('ab')).toBeTruthy();
    expect(validateHandle('ahmetçiftçi')).toBeTruthy();
    expect(cleanHandle(' @Ayşe ')).toBe('ayse');
  });

  test('mentions in a text', () => {
    expect(splitMentions('Merhaba @ahmet, nasılsın?')).toEqual([{ text: 'Merhaba ' }, { handle: 'ahmet' }, { text: ', nasılsın?' }]);
    expect(splitMentions('mail: ali@ornek.com')).toEqual([{ text: 'mail: ali@ornek.com' }]);
  });

  test('the @word at the cursor, and putting a username in its place', () => {
    expect(mentionAtCursor('Selam @ah', 9)).toEqual({ query: 'ah', start: 6 });
    expect(mentionAtCursor('ali@ornek', 9)).toBeNull();
    expect(insertMention('Selam @ah', { start: 6 }, 9, 'ahmet')).toEqual({ text: 'Selam @ahmet ', cursor: 13 });
  });

  test('threads: answers to the topic, each with everything under it', () => {
    const r = (id: string, parentId: string | null, at: string) => ({ id, parentId, createdAt: `2026-11-04T10:${at}:00Z` });
    const thread = threadReplies([r('c', 'a', '03'), r('a', null, '01'), r('b', null, '02'), r('d', 'c', '04')]);
    expect(thread.map((t) => t.reply.id)).toEqual(['a', 'b']);
    expect(thread[0].children.map((c) => [c.reply.id, c.parent.id])).toEqual([
      ['c', 'a'],
      ['d', 'c'],
    ]);
  });
});
