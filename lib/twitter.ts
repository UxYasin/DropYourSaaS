import { TwitterApi } from 'twitter-api-v2';

export const postToX = async (
  listingName: string,
  listingUrl: string,
  tagline: string,
  isVerified: boolean,
  twitterHandle?: string | null
) => {
  if (
    !process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_SECRET
  ) {
    console.log('[X Auto-Poster] Twitter credentials missing, skipping post');
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

  // Format the mention
  const cleanHandle = twitterHandle ? twitterHandle.replace(/^@/, '').trim() : '';
  const mentionText = cleanHandle ? ` by @${cleanHandle}` : '';

  const tweetText = `YOO ${verifiedTag}\n\n${listingName}${mentionText} is live on DropYourSaaS.\n\n"${tagline}"\n\nCheck it out here: ${listingUrl}\n\n#buildinpublic #indiehackers #saas`;

  try {
    await rwClient.v2.tweet(tweetText);
    console.log('[X Auto-Poster] Successfully posted to X');
  } catch (error) {
    console.error('[X Auto-Poster] Failed to post to X:', error);
  }
};
