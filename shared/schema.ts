import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User related schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("employee"), // employee, contributor, admin
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  profilePicture: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Course related schemas
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  duration: integer("duration"), // in minutes
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  instructorId: integer("instructor_id").references(() => users.id),
  status: text("status").notNull().default("draft"), // draft, published, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  thumbnail: true,
  duration: true,
  difficulty: true,
  instructorId: true,
  status: true,
});

// Course modules
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  position: integer("position").notNull(),
});

export const insertModuleSchema = createInsertSchema(modules).pick({
  courseId: true,
  title: true,
  position: true,
});

// Lessons
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  duration: integer("duration"), // in seconds
  position: integer("position").notNull(),
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  moduleId: true,
  title: true,
  content: true,
  videoUrl: true,
  duration: true,
  position: true,
});

// Course enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // percentage of completion
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  userId: true,
  courseId: true,
});

// Assessments/Quizzes
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  moduleId: integer("module_id").references(() => modules.id),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score"), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  title: true,
  description: true,
  moduleId: true,
  timeLimit: true,
  passingScore: true,
});

// Questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").references(() => assessments.id).notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // multiple_choice, true_false, short_answer
  options: json("options").default({}), // For multiple choice questions
  correctAnswer: text("correct_answer"), // For true/false and short answers
  explanation: text("explanation"),
  points: integer("points").default(1),
  position: integer("position").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  assessmentId: true,
  questionText: true,
  questionType: true,
  options: true,
  correctAnswer: true,
  explanation: true,
  points: true,
  position: true,
});

// User assessment attempts
export const assessmentAttempts = pgTable("assessment_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  assessmentId: integer("assessment_id").references(() => assessments.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  answers: json("answers").default({}),
  status: text("status").default("in_progress"), // in_progress, completed, failed, passed
});

export const insertAssessmentAttemptSchema = createInsertSchema(assessmentAttempts).pick({
  userId: true,
  assessmentId: true,
});

// User groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
});

// Group members
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
});

// Course access permissions (for users or groups)
export const courseAccess = pgTable("course_access", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  accessType: text("access_type").notNull(), // view, edit
  grantedAt: timestamp("granted_at").defaultNow(),
});

export const insertCourseAccessSchema = createInsertSchema(courseAccess).pick({
  courseId: true,
  userId: true,
  groupId: true,
  accessType: true,
});

// Progress tracking for lessons
export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).pick({
  userId: true,
  lessonId: true,
  status: true,
});

// User activity log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // e.g., "watched_video", "completed_lesson", "earned_badge"
  resourceType: text("resource_type"), // e.g., "lesson", "course", "assessment"
  resourceId: integer("resource_id"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  action: true,
  resourceType: true,
  resourceId: true,
  metadata: true,
});

// Certificates
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  certificateUrl: text("certificate_url"),
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  userId: true,
  courseId: true,
  certificateUrl: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type InsertAssessmentAttempt = z.infer<typeof insertAssessmentAttemptSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type CourseAccess = typeof courseAccess.$inferSelect;
export type InsertCourseAccess = z.infer<typeof insertCourseAccessSchema>;

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
