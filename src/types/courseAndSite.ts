import { Course, Site } from '@prisma/client';

interface CourseWithSite extends Course {
  site: Site | null;
}

interface SiteWithCourse extends Site {
  course: Course | null;
}

export type { CourseWithSite, SiteWithCourse };
