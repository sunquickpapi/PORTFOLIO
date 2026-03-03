export interface Project {
    id: string;
    title: string;
    description: string;
    challenge: string;
    solution: string;
    date: string;
    category: string;
    image_url: string;
    preview_images: string[] | string;
    tech_stack: string[];
    live_demo_url?: string;
    repo_url?: string;
    slug: string;
}
