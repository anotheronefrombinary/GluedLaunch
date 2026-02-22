import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

interface Comment {
  id: string;
  tokenAddress: string;
  author: string;
  text: string;
  timestamp: number;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(COMMENTS_FILE)) fs.writeFileSync(COMMENTS_FILE, '[]');
}

function readComments(): Comment[] {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeComments(comments: Comment[]) {
  ensureDataDir();
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments));
}

export async function GET(request: NextRequest) {
  const tokenAddress = request.nextUrl.searchParams.get('tokenAddress');
  if (!tokenAddress) {
    return NextResponse.json({ error: 'tokenAddress required' }, { status: 400 });
  }

  const all = readComments();
  const filtered = all
    .filter((c) => c.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp);

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenAddress, author, text } = body;

    if (!tokenAddress || !author || !text) {
      return NextResponse.json({ error: 'tokenAddress, author, and text required' }, { status: 400 });
    }

    if (typeof text !== 'string' || text.trim().length === 0 || text.length > 500) {
      return NextResponse.json({ error: 'text must be 1-500 characters' }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(author)) {
      return NextResponse.json({ error: 'invalid author address' }, { status: 400 });
    }

    const comment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      tokenAddress: tokenAddress.toLowerCase(),
      author,
      text: text.trim(),
      timestamp: Math.floor(Date.now() / 1000),
    };

    const all = readComments();
    all.push(comment);
    writeComments(all);

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
