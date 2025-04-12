import { PrismaClient, Prisma } from "@prisma/client"; // Import Prisma namespace for types
import type {
  User, Course, Module, Lesson, Enrollment, Assessment, Question,
  AssessmentAttempt, Group, GroupMember, CourseAccess, LessonProgress,
  ActivityLog, Certificate, GroupCourse
} from ".prisma/client"; // Import types from the generated client
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg"; // Import pg for pool

// Define Insert types based on Prisma models (adjust as needed, Prisma doesn't auto-generate these like Drizzle-Zod)
// For simplicity, we'll use Prisma's built-in types for creation where possible,
// but you might want more specific insert types later, perhaps using Zod.
type InsertUser = Omit<User, 'id' | 'createdAt'>;
type InsertCourse = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;
type InsertModule = Omit<Module, 'id'>;
type InsertLesson = Omit<Lesson, 'id'>;
type InsertEnrollment = Omit<Enrollment, 'id' | 'enrolledAt' | 'completedAt' | 'progress'>;
type InsertAssessment = Omit<Assessment, 'id' | 'createdAt'>;
type InsertQuestion = Omit<Question, 'id' | 'options'> & { options?: Prisma.InputJsonValue }; // Adjust JSON type
type InsertAssessmentAttempt = Omit<AssessmentAttempt, 'id' | 'startedAt' | 'completedAt' | 'score' | 'answers' | 'status'> & { answers?: Prisma.InputJsonValue }; // Adjust JSON type
type InsertGroup = Omit<Group, 'id' | 'createdAt'>;
type InsertGroupMember = Omit<GroupMember, 'id' | 'addedAt'>;
type InsertCourseAccess = Omit<CourseAccess, 'id' | 'grantedAt'>;
type InsertLessonProgress = Omit<LessonProgress, 'id' | 'lastAccessedAt' | 'completedAt'>;
type InsertActivityLog = Omit<ActivityLog, 'id' | 'createdAt' | 'metadata'> & { metadata?: Prisma.InputJsonValue }; // Adjust JSON type
type InsertCertificate = Omit<Certificate, 'id' | 'issueDate'>;
// GROUP MANAGEMENT
type InsertGroupCourse = Omit<GroupCourse, 'id'>;


// Re-define the IStorage interface to use Prisma types
export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: User['role']): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Course related methods
  getCourse(id: number): Promise<Course | null>;
  getCourses(): Promise<Course[]>;
  getCoursesByInstructor(instructorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | null>;
  deleteCourse(id: number): Promise<boolean>;

  // Module related methods
  getModule(id: number): Promise<Module | null>;
  getModulesByCourse(courseId: number): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, module: Partial<Module>): Promise<Module | null>;
  deleteModule(id: number): Promise<boolean>;

  // Lesson related methods
  getLesson(id: number): Promise<Lesson | null>;
  getLessonsByModule(moduleId: number): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<Lesson>): Promise<Lesson | null>;
  deleteLesson(id: number): Promise<boolean>;

  // Enrollment related methods
  getEnrollment(id: number): Promise<Enrollment | null>;
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | null>;
  deleteEnrollment(id: number): Promise<boolean>;

  // Assessment related methods
  getAssessment(id: number): Promise<Assessment | null>;
  getAssessmentsByModule(moduleId: number): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<Assessment>): Promise<Assessment | null>;
  deleteAssessment(id: number): Promise<boolean>;

  // Question related methods
  getQuestion(id: number): Promise<Question | null>;
  getQuestionsByAssessment(assessmentId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<Question>): Promise<Question | null>;
  deleteQuestion(id: number): Promise<boolean>;

  // Assessment attempt related methods
  getAssessmentAttempt(id: number): Promise<AssessmentAttempt | null>;
  getAssessmentAttemptsByUser(userId: number): Promise<AssessmentAttempt[]>;
  getAssessmentAttemptsByAssessment(assessmentId: number): Promise<AssessmentAttempt[]>;
  createAssessmentAttempt(attempt: InsertAssessmentAttempt): Promise<AssessmentAttempt>;
  updateAssessmentAttempt(id: number, attempt: Partial<AssessmentAttempt>): Promise<AssessmentAttempt | null>;

  // Group related methods
  getGroup(id: number): Promise<Group | null>;
  getGroups(): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<Group>): Promise<Group | null>;
  deleteGroup(id: number): Promise<boolean>;
  // Group member related methods
  getGroupMember(id: number): Promise<GroupMember | null>;
  getGroupMembersByGroup(groupId: number): Promise<GroupMember[]>;
  getGroupMembersByUser(userId: number): Promise<GroupMember[]>;
  createGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  deleteGroupMember(id: number): Promise<boolean>;
  // GROUP MANAGEMENT
  deleteGroupMembersByGroupId(groupId: number): Promise<void>;
  deleteGroupCoursesByGroupId(groupId: number): Promise<void>;
  deleteGroupMembers(groupId: number): Promise<boolean>;
  deleteGroupCourses(groupId: number): Promise<boolean>;
  getGroupCoursesByGroup(groupId: number): Promise<GroupCourse[]>;


  // Course access related methods
  getCourseAccess(id: number): Promise<CourseAccess | null>;
  getCourseAccessByCourse(courseId: number): Promise<CourseAccess[]>;
  getCourseAccessByUser(userId: number): Promise<CourseAccess[]>;
  getCourseAccessByGroup(groupId: number): Promise<CourseAccess[]>;
  createCourseAccess(access: InsertCourseAccess): Promise<CourseAccess>;
  deleteCourseAccess(id: number): Promise<boolean>;

  // Lesson progress related methods
  getLessonProgress(id: number): Promise<LessonProgress | null>;
  getLessonProgressByUser(userId: number): Promise<LessonProgress[]>;
  getLessonProgressByLesson(lessonId: number): Promise<LessonProgress[]>;
  createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  updateLessonProgress(id: number, progress: Partial<LessonProgress>): Promise<LessonProgress | null>;

  // Activity log related methods
  getActivityLog(id: number): Promise<ActivityLog | null>;
  getActivityLogsByUser(userId: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Certificate related methods
  getCertificate(id: number): Promise<Certificate | null>;
  getCertificatesByUser(userId: number): Promise<Certificate[]>;
  getCertificatesByCourse(courseId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificateByHash(certHash: string): Promise<Certificate | null>;

  // Session store
  sessionStore: session.Store;
}

// Implementation using Prisma
export class PrismaStorage implements IStorage {
  private prisma: PrismaClient;
  sessionStore: session.Store;

  constructor() {
    this.prisma = new PrismaClient();

    // Initialize pg Pool for session store
    // Ensure DATABASE_URL is loaded (e.g., using dotenv)
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Initialize connect-pg-simple store
    const PgSessionStore = connectPgSimple(session);
    this.sessionStore = new PgSessionStore({
      pool: pool,
      tableName: 'session' // Matches the table name in schema.prisma
    });

    // Optional: Seed initial data if needed (consider using Prisma seed scripts instead)
    // this.seedData();
  }

  // --- Comment Methods ---
  async getCommentsByLesson(lessonId: number): Promise<any[]> {
    return this.prisma.comment.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCommentsWithUserByLesson(lessonId: number): Promise<any[]> {
    return this.prisma.comment.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async createComment(data: { lessonId: number; userId: number; comment: string; parentId?: number | null; createdAt: Date }): Promise<any> {
    return this.prisma.comment.create({
      data: {
        lessonId: data.lessonId,
        userId: data.userId,
        comment: data.comment,
        parentId: data.parentId ?? null,
        createdAt: data.createdAt,
      },
    });
  }

  // --- User Methods ---
  async getUser(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async getUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }
  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async getUsersByRole(role: User['role']): Promise<User[]> {
    return this.prisma.user.findMany({ where: { role } });
  }
  async createUser(user: InsertUser): Promise<User> {
    return this.prisma.user.create({ data: user });
  }
  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      const { id: userId, ...updateData } = userData; // Exclude id from data
      return await this.prisma.user.update({ where: { id }, data: updateData });
    } catch (error) {
      // Handle potential errors like record not found
      return null;
    }
  }
  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Course Methods ---
  async getCourse(id: number): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { id } });
  }
  // New method to get course with nested content
  async getCourseWithContent(id: number): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true, // Include instructor details
        modules: {
          orderBy: { position: 'asc' }, // Order modules
          include: {
            lessons: {
              orderBy: { position: 'asc' }, // Order lessons within modules
            },
            // Optionally include assessments here too if needed on detail page
            // assessments: {
            //   orderBy: { createdAt: 'asc' } 
            // }
          }
        },
        // Include enrollments if needed for count, etc.
        // enrollments: true 
      }
    });
  }
  async getCourses(): Promise<Course[]> {
    return this.prisma.course.findMany();
  }
  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return this.prisma.course.findMany({ where: { instructorId } });
  }
  async createCourse(course: InsertCourse): Promise<Course> {
    // Ensure category is included in the data passed to Prisma
    return this.prisma.course.create({ data: course });
  }
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | null> {
    try {
      // Prisma automatically handles updatedAt
      const { id: courseId, updatedAt, ...updateData } = courseData; // Exclude id
      return await this.prisma.course.update({ where: { id }, data: updateData });
    } catch (error) {
      return null;
    }
  }
  async deleteCourse(id: number): Promise<boolean> {
    try {
      await this.prisma.course.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Module Methods ---
  async getModule(id: number): Promise<Module | null> {
    return this.prisma.module.findUnique({ where: { id } });
  }
  async getModulesByCourse(courseId: number): Promise<Module[]> {
    return this.prisma.module.findMany({ where: { courseId }, orderBy: { position: 'asc' } });
  }
  async createModule(module: InsertModule): Promise<Module> {
    return this.prisma.module.create({ data: module });
  }
  async updateModule(id: number, moduleData: Partial<Module>): Promise<Module | null> {
    try {
      const { id: moduleId, ...updateData } = moduleData; // Exclude id
      return await this.prisma.module.update({ where: { id }, data: updateData });
    } catch (error) {
      return null;
    }
  }
  async deleteModule(id: number): Promise<boolean> {
    try {
      await this.prisma.module.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Lesson Methods ---
  async getLesson(id: number): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({ where: { id } });
  }
  async getLessonsByModule(moduleId: number): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({ where: { moduleId }, orderBy: { position: 'asc' } });
  }
  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    return this.prisma.lesson.create({ data: lesson });
  }
  async updateLesson(id: number, lessonData: Partial<Lesson>): Promise<Lesson | null> {
    try {
      const { id: lessonId, ...updateData } = lessonData; // Exclude id
      return await this.prisma.lesson.update({ where: { id }, data: updateData });
    } catch (error) {
      return null;
    }
  }
  async deleteLesson(id: number): Promise<boolean> {
    try {
      await this.prisma.lesson.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Enrollment Methods ---
  async getEnrollment(id: number): Promise<Enrollment | null> {
    return this.prisma.enrollment.findUnique({ where: { id } });
  }
  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    // Include nested course data with instructor and module count
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { // Include instructor relation
              select: { // Select only necessary fields
                firstName: true,
                lastName: true,
              }
            },
            modules: { // Include modules relation
              select: { // Select only id for counting
                id: true
              }
            }
          }
        }
      }
    });
  }
  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({ where: { courseId } });
  }
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    // Default progress is handled by schema
    return this.prisma.enrollment.create({ data: enrollment });
  }
  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | null> {
    try {
      const { id: enrollmentId, ...updateData } = enrollmentData; // Exclude id
      return await this.prisma.enrollment.update({ where: { id }, data: updateData });
    } catch (error) {
      return null;
    }
  }
  async deleteEnrollment(id: number): Promise<boolean> {
    try {
      await this.prisma.enrollment.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Category Methods ---
  async getCategories(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async getCategory(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async createCategory(category: { name: string }): Promise<Category> {
    return this.prisma.category.create({ data: category });
  }

  async updateCategory(id: number, category: { name: string }): Promise<Category | null> {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: category,
      });
    } catch (error) {
      return null;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await this.prisma.category.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }


  // --- Assessment Methods ---
  async getAssessment(id: number): Promise<Assessment | null> {
    return this.prisma.assessment.findUnique({ where: { id } });
  }
  async getAssessmentsByModule(moduleId: number): Promise<Assessment[]> {
    // Handle potential null moduleId if assessments can exist without modules
    return this.prisma.assessment.findMany({ where: { moduleId } });
  }
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    return this.prisma.assessment.create({ data: assessment });
  }
  async updateAssessment(id: number, assessmentData: Partial<Assessment>): Promise<Assessment | null> {
    try {
      const { id: assessmentId, ...updateData } = assessmentData; // Exclude id
      return await this.prisma.assessment.update({ where: { id }, data: updateData });
    } catch (error) {
      return null;
    }
  }
  async deleteAssessment(id: number): Promise<boolean> {
    try {
      await this.prisma.assessment.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Question Methods ---
  async getQuestion(id: number): Promise<Question | null> {
    return this.prisma.question.findUnique({ where: { id } });
  }
  async getQuestionsByAssessment(assessmentId: number): Promise<Question[]> {
    return this.prisma.question.findMany({ where: { assessmentId }, orderBy: { position: 'asc' } });
  }
  async createQuestion(question: InsertQuestion): Promise<Question> {
    // Ensure JSON fields are handled correctly if needed (Prisma usually does this well)
    return this.prisma.question.create({ data: question });
  }
  async updateQuestion(id: number, questionData: Partial<Question>): Promise<Question | null> {
    try {
      const { id: questionId, ...updateData } = questionData; // Exclude id

      // Directly use updateData, Prisma handles undefined fields correctly.
      // Ensure the JSON field is correctly typed if present.
      const data: Prisma.QuestionUpdateInput = {
        ...updateData,
        options: 'options' in updateData
          ? (updateData.options === null ? Prisma.JsonNull : updateData.options)
          : undefined, // Explicitly undefined if not in updateData
      };

      // Remove undefined keys loop removed - Prisma handles undefined correctly
      // Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      return await this.prisma.question.update({ where: { id }, data });
    } catch (error) {
      return null;
    }
  }
  async deleteQuestion(id: number): Promise<boolean> {
    try {
      await this.prisma.question.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Assessment Attempt Methods ---
  async getAssessmentAttempt(id: number): Promise<AssessmentAttempt | null> {
    return this.prisma.assessmentAttempt.findUnique({ where: { id } });
  }
  async getAssessmentAttemptsByUser(userId: number): Promise<AssessmentAttempt[]> {
    return this.prisma.assessmentAttempt.findMany({ where: { userId } });
  }
  async getAssessmentAttemptsByAssessment(assessmentId: number): Promise<AssessmentAttempt[]> {
    return this.prisma.assessmentAttempt.findMany({ where: { assessmentId } });
  }
  async createAssessmentAttempt(attempt: InsertAssessmentAttempt): Promise<AssessmentAttempt> {
    // Defaults handled by schema
    return this.prisma.assessmentAttempt.create({ data: attempt });
  }
  async updateAssessmentAttempt(id: number, attemptData: Partial<AssessmentAttempt>): Promise<AssessmentAttempt | null> {
    try {
      const { id: attemptId, ...updateData } = attemptData; // Exclude id

      // Directly use updateData, Prisma handles undefined fields correctly.
      // Ensure the JSON field is correctly typed if present.
      const data: Prisma.AssessmentAttemptUpdateInput = {
        ...updateData,
        answers: 'answers' in updateData
          ? (updateData.answers === null ? Prisma.JsonNull : updateData.answers)
          : undefined, // Explicitly undefined if not in updateData
      };

      // Remove undefined keys loop removed - Prisma handles undefined correctly
      // Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      return await this.prisma.assessmentAttempt.update({ where: { id }, data });
    } catch (error) {
      return null;
    }
  }

  // --- Group Methods ---
  async getGroup(id: number): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { id } });
  }
  async getGroups(): Promise<Group[]> {
    return this.prisma.group.findMany();
  }
  // --- GROUP MANAGEMENT ---
  async createGroupCourse(course: InsertGroupCourse): Promise<GroupCourse> {
    return this.prisma.groupCourse.create({ data: course });
  }
  // --- GROUP MANAGEMENT ---
  async getGroupsWithDetails(): Promise<any[]> {
    const groups = await this.prisma.group.findMany({
      include: {
        members: { include: { user: true } },
        courses: { include: { course: true } },
      },
    });

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      users: group.members.map(m => m.user?.name).filter(Boolean),
      courses: group.courses.map(c => c.course?.name).filter(Boolean),
    }));
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    return this.prisma.group.create({ data: group });
  }
  async updateGroup(id: number, groupData: Partial<Group>): Promise<Group | null> {
    try {
      const { id: groupId, ...updateData } = groupData; // Exclude id
      return await this.prisma.group.update({ where: { id }, data: updateData });
    } catch (error) {
      return null;
    }
  }
  async deleteGroup(id: number): Promise<boolean> {
    try {
      await this.prisma.group.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }
  // --- GROUP MANAGEMENT ---
  async deleteGroupMembersByGroupId(groupId: number): Promise<void> {
    await this.prisma.groupMember.deleteMany({ where: { groupId } });
  }

  // --- GROUP MANAGEMENT ---
  async deleteGroupCoursesByGroupId(groupId: number): Promise<void> {
    await this.prisma.groupCourse.deleteMany({ where: { groupId } });
  }

  // --- GROUP MANAGEMENT ---
  async getGroupCoursesByGroup(groupId: number): Promise<GroupCourse[]> {
    return this.prisma.groupCourse.findMany({ where: { groupId } });
  }

  // --- Group Member Methods ---
  async getGroupMember(id: number): Promise<GroupMember | null> {
    return this.prisma.groupMember.findUnique({ where: { id } });
  }
  async getGroupMembersByGroup(groupId: number): Promise<GroupMember[]> {
    return this.prisma.groupMember.findMany({ where: { groupId } });
  }
  async getGroupMembersByUser(userId: number): Promise<GroupMember[]> {
    return this.prisma.groupMember.findMany({ where: { userId } });
  }
  async createGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    return this.prisma.groupMember.create({ data: member });
  }
  async deleteGroupMember(id: number): Promise<boolean> {
    try {
      await this.prisma.groupMember.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }
  // --- GROUP MANAGEMENT ---
  async deleteGroupMembers(groupId: number): Promise<boolean> {
    try {
      await this.prisma.groupMember.deleteMany({ where: { groupId } });
      return true;
    } catch (error) {
      console.error("Error deleting group members:", error);
      return false;
    }
  }

  // Delete all courses linked to a group
  async deleteGroupCourses(groupId: number): Promise<boolean> {
    try {
      await this.prisma.groupCourse.deleteMany({ where: { groupId } });
      return true;
    } catch (error) {
      console.error("Error deleting group courses:", error);
      return false;
    }
  }
  // --- Course Access Methods ---
  async getCourseAccess(id: number): Promise<CourseAccess | null> {
    return this.prisma.courseAccess.findUnique({ where: { id } });
  }
  async getCourseAccessByCourse(courseId: number): Promise<CourseAccess[]> {
    return this.prisma.courseAccess.findMany({ where: { courseId } });
  }
  async getCourseAccessByUser(userId: number): Promise<CourseAccess[]> {
    return this.prisma.courseAccess.findMany({ where: { userId } });
  }
  async getCourseAccessByGroup(groupId: number): Promise<CourseAccess[]> {
    return this.prisma.courseAccess.findMany({ where: { groupId } });
  }
  async createCourseAccess(access: InsertCourseAccess): Promise<CourseAccess> {
    return this.prisma.courseAccess.create({ data: access });
  }
  async deleteCourseAccess(id: number): Promise<boolean> {
    try {
      await this.prisma.courseAccess.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  // --- Lesson Progress Methods ---
  async getLessonProgress(id: number): Promise<LessonProgress | null> {
    return this.prisma.lessonProgress.findUnique({ where: { id } });
  }
  async getLessonProgressByUser(userId: number): Promise<LessonProgress[]> {
    return this.prisma.lessonProgress.findMany({ where: { userId } });
  }
  async getLessonProgressByLesson(lessonId: number): Promise<LessonProgress[]> {
    return this.prisma.lessonProgress.findMany({ where: { lessonId } });
  }
  // New method to get progress for a user in a specific course
  async getLessonProgressByUserAndCourse(userId: number, courseId: number): Promise<LessonProgress[]> {
    return this.prisma.lessonProgress.findMany({
      where: {
        userId: userId,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
      },
    });
  }
  async createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    // Defaults handled by schema
    return this.prisma.lessonProgress.create({ data: progress });
  }
  async updateLessonProgress(id: number, progress: Partial<LessonProgress>): Promise<LessonProgress | null> {
    try {
      const { id: progressId, ...updateData } = progress; // Exclude id
      // Ensure lastAccessedAt is updated if not explicitly provided
      const dataToUpdate = { ...updateData, lastAccessedAt: new Date() };
      return await this.prisma.lessonProgress.update({ where: { id }, data: dataToUpdate });
    } catch (error) {
      return null;
    }
  }

  // --- Activity Log Methods ---
  async getActivityLog(id: number): Promise<ActivityLog | null> {
    return this.prisma.activityLog.findUnique({ where: { id } });
  }
  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    return this.prisma.activityLog.create({ data: log });
  }

  // --- Certificate Methods ---
  async getCertificate(id: number): Promise<Certificate | null> {
    return this.prisma.certificate.findUnique({ where: { id } });
  }
  async getCertificatesByUser(userId: number): Promise<Certificate[]> {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  async getCertificateByHash(certHash: string): Promise<Certificate | null> {
    return this.prisma.certificate.findFirst({
      where: { certificateId: certHash },
    });
  }
  async getCertificatesByCourse(courseId: number): Promise<Certificate[]> {
    return this.prisma.certificate.findMany({ where: { courseId } });
  }
  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    return this.prisma.certificate.create({ data: certificate });
  }


  // Optional: Method to disconnect Prisma client when server shuts down
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export the instance of PrismaStorage
export const storage = new PrismaStorage();
