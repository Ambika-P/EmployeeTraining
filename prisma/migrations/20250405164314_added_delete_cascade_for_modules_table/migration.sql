-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_course_id_fkey";

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
