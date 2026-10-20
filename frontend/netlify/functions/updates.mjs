/**
 * GET /.netlify/functions/updates
 *
 * Public: returns the live vaccine-update feed (announcements made via the
 * admin `announce` function). The website's "What's new" section reads this so
 * new announcements appear without a redeploy. Returns [] until the first
 * announcement is made.
 */
import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('smartvax');
  const updates = (await store.get('updates', { type: 'json' })) || [];
  return new Response(JSON.stringify(updates), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
  });
};
