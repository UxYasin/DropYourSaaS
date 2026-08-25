import { TwitterApi } from 'twitter-api-v2';

export const postToX = async (
  listingName: string,
  listingUrl: string,
  tagline: string,
  isVerified: boolean,
  twitterHandle?: string | null
) => {
  console.log(`[X-POSTER] Triggered for: ${listingName}`);

  if (!process.env.TWITTER_API_KEY) {
    console.error('[X-POSTER] CRITICAL: TWITTER_API_KEY is missing from environment.');
    return;
  }
  if (!process.env.TWITTER_API_SECRET) {
    console.error('[X-POSTER] CRITICAL: TWITTER_API_SECRET is missing from environment.');
    return;
  }
  if (!process.env.TWITTER_ACCESS_TOKEN) {
    console.error('[X-POSTER] CRITICAL: TWITTER_ACCESS_TOKEN is missing from environment.');
    return;
  }
  if (!process.env.TWITTER_ACCESS_SECRET) {
    console.error('[X-POSTER] CRITICAL: TWITTER_ACCESS_SECRET is missing from environment.');
    return;
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  const rwClient = client.readWrite;
  const verifiedTag = isVerified ? 'VERIFIED FAST-TRACK LISTING' : 'NEW LISTING';

  // Format the mention (handles @username, @x.com/username, x.com/username, https://x.com/username)
  const cleanHandle = twitterHandle
    ? twitterHandle
        .trim()
        .replace(/^@/, '')
        .replace(/^(https?:\/\/)?(www\.)?x\.com\//i, '')
        .replace(/^(https?:\/\/)?(www\.)?twitter\.com\//i, '')
        .replace(/^@/, '')
        .trim()
    : '';

  const mentionText = cleanHandle ? ` by @${cleanHandle}` : '';
  const tweetText = `YOO ${verifiedTag}\n\n${listingName}${mentionText} is live on DropYourSaaS.\n\n"${tagline}"\n\nCheck it out here: ${listingUrl}\n\n#buildinpublic #indiehackers #saas`;

  try {
    console.log('[X-POSTER] Attempting to send tweet...');
    console.log('[X-POSTER] Tweet text:\n', tweetText);
    const response = await rwClient.v2.tweet(tweetText);
    console.log('[X-POSTER] Successfully posted to X! Tweet ID:', response.data.id);
  } catch (error: any) {
    console.error('[X-POSTER] Failed to post to X. Full Error:', error?.response?.data || error);
  }
};
