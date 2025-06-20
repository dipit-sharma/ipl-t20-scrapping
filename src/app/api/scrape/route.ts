import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";
import puppeteer from "puppeteer";

interface Match {
  id: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  venue: string;
  status: string;
  result?: string;
  isLive?: boolean;
}

interface PointsTableTeam {
  position: number;
  team: string;
  matches: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: string;
}

interface IPLData {
  liveMatch?: Match;
  upcomingMatches: Match[];
  pointsTable: PointsTableTeam[];
  pointsTableRawData: string[][];
  recentMatches: Match[];
  lastUpdated: string;
}

let cache: { data: IPLData | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 min

const getMockData = (): IPLData => ({
  liveMatch: {
    id: "live-1",
    date: "2024-05-25",
    time: "19:30",
    team1: "Mumbai Indians",
    team2: "Chennai Super Kings",
    venue: "Wankhede Stadium, Mumbai",
    status: "Live - Mumbai Indians 156/4 (16.2 overs)",
    isLive: true,
  },
  upcomingMatches: [
    {
      id: "upcoming-1",
      date: "2024-05-26",
      time: "19:30",
      team1: "Royal Challengers Bangalore",
      team2: "Delhi Capitals",
      venue: "M.Chinnaswamy Stadium, Bangalore",
      status: "Upcoming",
    },
    {
      id: "upcoming-2",
      date: "2024-05-27",
      time: "15:30",
      team1: "Kolkata Knight Riders",
      team2: "Rajasthan Royals",
      venue: "Eden Gardens, Kolkata",
      status: "Upcoming",
    },
    {
      id: "upcoming-3",
      date: "2024-05-28",
      time: "19:30",
      team1: "Sunrisers Hyderabad",
      team2: "Punjab Kings",
      venue: "Rajiv Gandhi International Cricket Stadium, Hyderabad",
      status: "Upcoming",
    },
  ],
  pointsTable: [
    {
      position: 1,
      team: "Kolkata Knight Riders",
      matches: 14,
      won: 9,
      lost: 3,
      tied: 0,
      noResult: 2,
      points: 20,
      netRunRate: "+1.428",
    },
    {
      position: 2,
      team: "Sunrisers Hyderabad",
      matches: 14,
      won: 8,
      lost: 5,
      tied: 0,
      noResult: 1,
      points: 17,
      netRunRate: "+0.414",
    },
    {
      position: 3,
      team: "Rajasthan Royals",
      matches: 14,
      won: 8,
      lost: 6,
      tied: 0,
      noResult: 0,
      points: 16,
      netRunRate: "+0.273",
    },
    {
      position: 4,
      team: "Royal Challengers Bangalore",
      matches: 14,
      won: 7,
      lost: 7,
      tied: 0,
      noResult: 0,
      points: 14,
      netRunRate: "+0.459",
    },
    {
      position: 5,
      team: "Chennai Super Kings",
      matches: 14,
      won: 7,
      lost: 7,
      tied: 0,
      noResult: 0,
      points: 14,
      netRunRate: "+0.392",
    },
    {
      position: 6,
      team: "Delhi Capitals",
      matches: 14,
      won: 7,
      lost: 7,
      tied: 0,
      noResult: 0,
      points: 14,
      netRunRate: "-0.377",
    },
    {
      position: 7,
      team: "Mumbai Indians",
      matches: 14,
      won: 4,
      lost: 10,
      tied: 0,
      noResult: 0,
      points: 8,
      netRunRate: "-0.318",
    },
    {
      position: 8,
      team: "Punjab Kings",
      matches: 14,
      won: 3,
      lost: 11,
      tied: 0,
      noResult: 0,
      points: 6,
      netRunRate: "-0.441",
    },
  ],
  recentMatches: [
    {
      id: "recent-1",
      date: "2024-05-24",
      time: "19:30",
      team1: "Kolkata Knight Riders",
      team2: "Sunrisers Hyderabad",
      venue: "Eden Gardens, Kolkata",
      status: "Completed",
      result: "KKR won by 8 wickets",
    },
    {
      id: "recent-2",
      date: "2024-05-23",
      time: "19:30",
      team1: "Chennai Super Kings",
      team2: "Royal Challengers Bangalore",
      venue: "M.A.Chidambaram Stadium, Chennai",
      status: "Completed",
      result: "CSK won by 20 runs",
    },
  ],
  pointsTableRawData: [], // Empty array for mock data
  lastUpdated: new Date().toISOString(),
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeIPLDataWithPuppeteer(): Promise<IPLData> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the page
    await page.goto("https://www.iplt20.com/points-table/men", {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('#pointsdata', { timeout: 15000 });

    await delay(3000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const pointsTable: PointsTableTeam[] = [];
    const pointsTableData: string[][] = [];

    $('#pointsdata tr').each((index, element) => {
      const $row = $(element);

      const rowData: string[] = [];
      $row.find('td').each((cellIndex, cellElement) => {
        const $cell = $(cellElement);

        let cellText = '';

        if ($cell.find('.ih-pt-cont').length > 0) {
          cellText = $cell.find('.ih-pt-cont').text().trim();
        }
        else if ($cell.find('.ih-pt-fb').length > 0) {
          const performance: string[] = [];
          $cell.find('.rf').each((perfIndex, perfElement) => {
            performance.push($(perfElement).text().trim());
          });
          cellText = performance.join('');
        }
        else {
          cellText = $cell.text().trim();
        }

        rowData.push(cellText);
      });

      if (rowData.length > 0 && rowData.some(cell => cell.length > 0)) {
        pointsTableData.push(rowData);
      }

      if (rowData.length >= 9) {
        const position = parseInt(rowData[0]) || index + 1;
        const teamName = rowData[2] || `Team ${index + 1}`;
        const matches = parseInt(rowData[3]) || 0;
        const won = parseInt(rowData[4]) || 0;
        const lost = parseInt(rowData[5]) || 0;
        const tied = parseInt(rowData[6]) || 0;
        const netRunRate = rowData[7] || '0.000';
        const points = parseInt(rowData[rowData.length - 2]) || 0;

        pointsTable.push({
          position,
          team: teamName,
          matches,
          won,
          lost,
          tied,
          noResult: 0,
          points,
          netRunRate
        });
      }
    });

    return {
      liveMatch: getMockData().liveMatch,
      upcomingMatches: getMockData().upcomingMatches,
      pointsTable: pointsTable.length > 0 ? pointsTable : getMockData().pointsTable,
      pointsTableRawData: pointsTableData,
      recentMatches: getMockData().recentMatches,
      lastUpdated: new Date().toISOString(),
    };

  } catch (error) {
    console.error("Error scraping IPL data with Puppeteer:", error);
    return getMockData();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    const searchParams = request.nextUrl.searchParams;
    const usePuppeteer = true;

    // Check cache first
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
      });
    }

    const data = scrapeIPLDataWithPuppeteer();

    // Update cache
    cache.data = data;
    cache.timestamp = now;

    return NextResponse.json({
      success: true,
      data,
      cached: false,
      method: usePuppeteer ? 'puppeteer' : 'axios'
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch IPL data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    cache.data = null;
    cache.timestamp = 0;

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}


