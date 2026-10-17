import { POST as resetHandler } from '../reset/route';

// Support both /verify and /reset endpoints seamlessly
export async function POST(request) {
  return resetHandler(request);
}
