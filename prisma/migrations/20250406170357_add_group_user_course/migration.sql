-- CreateTable
CREATE TABLE "group_user" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "group_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_course" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "group_course_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_user" ADD CONSTRAINT "group_user_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_user" ADD CONSTRAINT "group_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_course" ADD CONSTRAINT "group_course_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_course" ADD CONSTRAINT "group_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
