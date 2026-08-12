import { NextResponse } from 'next/server';

export const revalidate = 3600; // cache for 1 hour

const query = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'No GitHub token configured' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username: 'ckwame-jpg' },
      }),
    });

    if (!res.ok) {
      throw new Error(`GitHub API responded with ${res.status}`);
    }

    const data = await res.json();
    const calendar = data.data.user.contributionsCollection.contributionCalendar;

    const weeks = calendar.weeks.map((week: { contributionDays: { date: string; contributionCount: number }[] }) => ({
      days: week.contributionDays.map((day: { date: string; contributionCount: number }) => ({
        date: day.date,
        count: day.contributionCount,
      })),
    }));

    return NextResponse.json({
      totalContributions: calendar.totalContributions,
      weeks,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
