import { Course, Site } from '@prisma/client';

interface CourseWithSite extends Course {
  site: Site | null;
}

export type { CourseWithSite };
