-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_course_id_fkey";

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
