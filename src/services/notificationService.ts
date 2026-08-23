export interface PolledPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export async function fetchPolledPosts(): Promise<PolledPost[]> {
  if (document.hidden) return [];
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (!res.ok) {
    throw new Error(`Failed to poll posts: ${res.statusText}`);
  }
  return await res.json();
}
