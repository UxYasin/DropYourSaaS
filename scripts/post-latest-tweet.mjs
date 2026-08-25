import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { Client } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  'postgresql://postgres.naflsoqdvllbnffghkdv:jhLON3g6mAQxpvx5@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT id, name, url, rank, status, is_verified, twitter_handle FROM leaderboard_entries WHERE status = 'published' ORDER BY rank ASC LIMIT 1;");
  const topItem = res.rows[0];
  await client.end();

  if (!topItem) {
    console.log('No published #1 item found.');
    return;
  }

  console.log('Selected #1 Ranked Listing for Tweet:');
  console.log(`- Title: ${topItem.name}`);
  console.log(`- URL: ${topItem.url}`);
  console.log(`- Twitter Handle: @${topItem.twitter_handle || 'iofficialya'}`);
  console.log(`- Verified: ${Boolean(topItem.is_verified)}`);

  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET || !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_SECRET) {
    console.log('\n❌ Cannot send live tweet yet because Twitter credentials are not in .env.local.');
    console.log('Please add the following to .env.local:');
    console.log('TWITTER_API_KEY=...');
    console.log('TWITTER_API_SECRET=...');
    console.log('TWITTER_ACCESS_TOKEN=...');
    console.log('TWITTER_ACCESS_SECRET=...');
    return;
  }

  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  const verifiedTag = topItem.is_verified ? 'VERIFIED FAST-TRACK LISTING' : 'NEW LISTING';
  let cleanHandle = (topItem.twitter_handle || '').replace(/@/g, '').trim();
  const mentionText = cleanHandle ? ` by @${cleanHandle}` : '';

  const tweetText = `YOO ${verifiedTag}\n\n${topItem.name}${mentionText} is live on DropYourSaaS.\n\nCheck it out here: ${topItem.url}\n\n#buildinpublic #indiehackers #saas`;

  console.log('\nAttempting to post tweet:\n', tweetText);
  try {
    const rwClient = twitterClient.readWrite;
    const tweet = await rwClient.v2.tweet(tweetText);
    console.log('✅ Successfully posted to X! Tweet ID:', tweet.data.id);
  } catch (error) {
    console.error('❌ Failed to post tweet:', error?.response?.data || error);
  }
}

main().catch(console.error);
