-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_module_id_fkey";

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
