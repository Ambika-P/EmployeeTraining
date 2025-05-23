import { type Express, Request, Response, NextFunction } from "express"; // Keep original import
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { Prisma } from "@prisma/client"; // Import Prisma namespace
import multer from "multer"; // Import multer
import path from "path"; // Import path for handling file paths
import fs from "fs"; // Import fs for creating directories
import { fileURLToPath } from "url"; // Import fileURLToPath
// Zod validation removed for now, can be added back based on Prisma types
// import { z } from "zod";
// Drizzle schema imports removed
// import { ... } from "@shared/schema";
import type {
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  Assessment,
  Question,
  AssessmentAttempt,
  Group,
  GroupMember,
  CourseAccess,
  LessonProgress,
  ActivityLog,
} from ".prisma/client"; // Import Prisma types

// --- Multer Configuration for Video Uploads ---
const projectRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const videoUploadDir = path.join(projectRoot, "uploads", "videos");
const imageUploadDir = path.join(projectRoot, "uploads", "course-images");

if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Increased to 500 MB
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
// --- End Multer Configuration ---

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);

  // Helper middleware to check authentication
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Helper middleware to check role
  const hasRole =
    (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // We can safely assert req.user exists here due to isAuthenticated check above
      if (req.user && roles.includes(req.user.role)) {
        return next();
      }
      res.status(403).json({ message: "Forbidden" });
    };

  // User routes
  app.get(
    "/api/users",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const { search, role } = req.query;
        const users = await storage.getUsers();
        let filteredUsers = users.map(({ password, ...user }) => user);

        if (search) {
          const searchStr = search.toString().toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(searchStr) ||
              user.email.toLowerCase().includes(searchStr) ||
              user.firstName?.toLowerCase().includes(searchStr) ||
              user.lastName?.toLowerCase().includes(searchStr)
          );
        }

        if (role && role !== "all") {
          filteredUsers = filteredUsers.filter((user) => user.role === role);
        }

        res.json(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get(
    "/api/users/:id",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.put(
    "/api/users/:id",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.password;

        const updatedUser = await storage.updateUser(userId, updateData);
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.delete(
    "/api/users/:id",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        await storage.deleteUser(userId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Get pending courses route
  app.get(
    "/api/pending-courses",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        // const pendingCourses = await storage.getCourses({ status: "draft" });
        const pendingCourses = (await storage.getCourses()).filter(
          (course) => course.status === "draft"
        );
        const coursesWithInstructors = await Promise.all(
          pendingCourses.map(async (course) => {
            const instructor = course.instructorId
              ? await storage.getUser(course.instructorId)
              : null;
            return {
              ...course,
              creator: instructor
                ? `${instructor.firstName} ${instructor.lastName}`
                : "Unknown",
              submittedDate: course.createdAt.toISOString().split("T")[0],
            };
          })
        );
        res.json(coursesWithInstructors);
      } catch (error) {
        console.error("Error fetching pending courses:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Course approval route
  app.post(
    "/api/courses/:id/approve",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.id);
        if (isNaN(courseId)) {
          return res.status(400).json({ message: "Invalid course ID" });
        }

        const updatedCourse = await storage.updateCourse(courseId, {
          status: "published",
        });
        if (!updatedCourse) {
          return res.status(404).json({ message: "Course not found" });
        }

        res.json(updatedCourse);
      } catch (error) {
        console.error("Error approving course:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Course rejection route
  app.post(
    "/api/courses/:id/reject",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.id);
        if (isNaN(courseId)) {
          return res.status(400).json({ message: "Invalid course ID" });
        }

        const updatedCourse = await storage.updateCourse(courseId, {
          status: "draft",
        });
        if (!updatedCourse) {
          return res.status(404).json({ message: "Course not found" });
        }

        res.json(updatedCourse);
      } catch (error) {
        console.error("Error rejecting course:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Course routes
  // --- Comments API ---
  app.get("/api/comments", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.query.lessonId as string);
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: "Invalid lessonId" });
      }
      const allComments = await storage.prisma.comment.findMany({
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

      // Group replies under parent comments
      const commentsMap: Record<number, any> = {};
      const topLevelComments: any[] = [];

      allComments.forEach((comment: any) => {
        comment.replies = [];
        commentsMap[comment.id] = comment;
      });

      allComments.forEach((comment: any) => {
        if (comment.parentId) {
          const parent = commentsMap[comment.parentId];
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          topLevelComments.push(comment);
        }
      });

      res.json(topLevelComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/comments", isAuthenticated, async (req, res) => {
    try {
      console.log("Received POST /api/comments with body:", req.body);
      console.log("Authenticated user:", req.user);

      if (!req.user?.id) {
        console.warn("User not authenticated");
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { lessonId, comment, parentId } = req.body;
      if (!lessonId || !comment) {
        console.warn("Missing lessonId or comment");
        return res.status(400).json({ message: "lessonId and comment are required" });
      }

      const newComment = await storage.createComment({
        lessonId,
        userId: req.user.id,
        comment,
        parentId: parentId || null,
        createdAt: new Date(),
      });
      console.log("Created comment:", newComment);
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // --- End Comments API ---

  app.get("/api/courses", isAuthenticated, async (req, res) => {

    try {
      const courses = (await storage.getCourses()).filter(
        (course) => course.status === "published"
      );

      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // New endpoint: get all courses created by the logged-in user
  app.get("/api/my-courses", isAuthenticated, async (req, res) => {
    try {
      const allCourses = await storage.getCourses();
      const myCourses = allCourses.filter(
        (course) => course.instructorId === req.user!.id
      );
      res.json(myCourses);
    } catch (error) {
      console.error("Error fetching my courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      // Fetch course with modules and lessons included
      let course = await storage.getCourseWithContent(courseId);

      if (!course) {
        // Prisma returns null if not found
        return res.status(404).json({ message: "Course not found" });
      }

      // Fetch user's enrollment progress for this specific course
      let userProgress = 0; // Default to 0
      if (req.user) {
        // Check if user is authenticated
        const userId = req.user.id;
        const enrollments = await storage.getEnrollmentsByUser(userId); // Fetch all user enrollments
        const specificEnrollment = enrollments.find(
          (e) => e.courseId === courseId
        );
        if (specificEnrollment) {
          userProgress = specificEnrollment.progress;
        }
      }

      // Add progress to the course object before sending
      const courseWithProgress = { ...course, progress: userProgress };

      res.json(courseWithProgress);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(
    "/api/courses",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        // Zod validation removed - add back if needed
        // const courseData = insertCourseSchema.parse(req.body);
        const {
          title,
          description,
          category,
          thumbnail,
          duration,
          difficulty,
          status,
        } = req.body; // Add category

        // Basic validation (replace with Zod/other validation if needed)
        if (!title || !description) {
          return res
            .status(400)
            .json({ message: "Title and description are required" });
        }

        const newCourse = await storage.createCourse({
          title,
          description,
          thumbnail: thumbnail || null,
          duration: duration ? parseInt(duration) : null, // Ensure duration is number or null
          difficulty: difficulty || null,
          status: status || "draft",
          category: category || null, // Include category
          instructorId: req.user!.id, // Assert req.user exists
        });

        res.status(201).json(newCourse);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... } // Add back Zod error handling if used
        console.error("Error creating course:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.put(
    "/api/courses/:id",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.id);
        if (isNaN(courseId)) {
          return res.status(400).json({ message: "Invalid course ID" });
        }
        const course = await storage.getCourse(courseId);

        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        // Only allow the instructor or admin to update the course
        if (
          course.instructorId !== req.user!.id &&
          req.user!.role !== "admin"
        ) {
          // Assert req.user exists
          return res.status(403).json({ message: "Forbidden" });
        }

        // Zod validation removed
        // const courseData = insertCourseSchema.partial().parse(req.body);
        // Ensure category and other fields are correctly passed
        const {
          title,
          description,
          category,
          thumbnail,
          duration,
          difficulty,
          status,
        } = req.body;
        const courseData: Partial<Course> = {
          title,
          description,
          category: category || null,
          thumbnail: thumbnail || null,
          duration: duration ? parseInt(duration) : null,
          difficulty: difficulty || null,
          status: status || undefined, // Use undefined if not provided, Prisma ignores it
        };
        // Remove undefined keys to avoid overwriting with null in Prisma update
        Object.keys(courseData).forEach(
          (key) =>
            courseData[key as keyof typeof courseData] === undefined &&
            delete courseData[key as keyof typeof courseData]
        );

        const updatedCourse = await storage.updateCourse(courseId, courseData);

        if (!updatedCourse) {
          // Handle case where update fails (e.g., record gone)
          return res
            .status(404)
            .json({ message: "Course not found or update failed" });
        }

        res.json(updatedCourse);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.delete(
    "/api/courses/:id",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.id);
        if (isNaN(courseId)) {
          return res.status(400).json({ message: "Invalid course ID" });
        }
        // Check existence and permissions before deleting
        const course = await storage.getCourse(courseId);

        if (!course) {
          // Already gone, arguably a success for DELETE idempotency
          return res.status(204).send();
        }

        // Only allow the instructor or admin to delete the course
        if (
          course.instructorId !== req.user!.id &&
          req.user!.role !== "admin"
        ) {
          // Assert req.user exists
          return res.status(403).json({ message: "Forbidden" });
        }

        const deleted = await storage.deleteCourse(courseId);
        if (!deleted) {
          // This might happen in race conditions, treat as not found
          return res
            .status(404)
            .json({ message: "Course not found or delete failed" });
        }

        res.status(204).send();
      } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Enrollment routes
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      // storage.getEnrollmentsByUser already includes the necessary course data via Prisma include
      const enrollments = await storage.getEnrollmentsByUser(req.user!.id); // Assert req.user exists

      // Directly return the enrollments fetched by the storage layer
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      // Zod validation removed
      // const enrollmentData = insertEnrollmentSchema.parse({ ... });
      const { courseId } = req.body;
      const userId = req.user!.id; // Assert req.user exists

      if (typeof courseId !== "number") {
        return res.status(400).json({ message: "Valid courseId is required" });
      }

      // Check if the course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if the user is already enrolled (could be done in storage layer with unique constraint)
      const userEnrollments = await storage.getEnrollmentsByUser(userId);
      const existingEnrollment = userEnrollments.find(
        (enrollment) => enrollment.courseId === courseId
      );

      if (existingEnrollment) {
        return res
          .status(400)
          .json({ message: "Already enrolled in this course" });
      }

      const newEnrollment = await storage.createEnrollment({
        userId,
        courseId,
      });

      // Log the activity
      await storage.createActivityLog({
        userId: userId,
        action: "enrolled",
        resourceType: "course",
        resourceId: courseId,
        metadata: {}, // Prisma expects JsonNull or an object
      });

      res.status(201).json(newEnrollment);
    } catch (error) {
      // if (error instanceof z.ZodError) { ... }
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Module routes
  app.get(
    "/api/courses/:courseId/modules",
    isAuthenticated,
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        if (isNaN(courseId)) {
          return res.status(400).json({ message: "Invalid course ID" });
        }
        const modules = await storage.getModulesByCourse(courseId);

        res.json(modules);
      } catch (error) {
        console.error("Error fetching modules:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/api/modules",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        // Zod validation removed
        // const moduleData = insertModuleSchema.parse(req.body);
        const { courseId, title, position } = req.body;

        if (
          typeof courseId !== "number" ||
          !title ||
          typeof position !== "number"
        ) {
          return res.status(400).json({
            message: "Valid courseId, title, and position are required",
          });
        }

        // Check if the course exists and if the user is the instructor
        const course = await storage.getCourse(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        if (
          course.instructorId !== req.user!.id &&
          req.user!.role !== "admin"
        ) {
          // Assert req.user exists
          return res.status(403).json({ message: "Forbidden" });
        }

        const newModule = await storage.createModule({
          courseId,
          title,
          position,
        });

        res.status(201).json(newModule);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error creating module:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Lesson routes
  app.get(
    "/api/modules/:moduleId/lessons",
    isAuthenticated,
    async (req, res) => {
      try {
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
          return res.status(400).json({ message: "Invalid module ID" });
        }
        const lessons = await storage.getLessonsByModule(moduleId);

        res.json(lessons);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/api/lessons",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        // Zod validation removed
        // const lessonData = insertLessonSchema.parse(req.body);
        const { moduleId, title, content, videoUrl, duration, position } =
          req.body;

        if (
          typeof moduleId !== "number" ||
          !title ||
          typeof position !== "number"
        ) {
          return res.status(400).json({
            message: "Valid moduleId, title, and position are required",
          });
        }

        // Check if the module exists
        const module = await storage.getModule(moduleId);
        if (!module) {
          return res.status(404).json({ message: "Module not found" });
        }

        // Check if the user is the instructor of the course
        const course = await storage.getCourse(module.courseId);
        if (!course) {
          // Should not happen if module exists, but good practice
          return res
            .status(404)
            .json({ message: "Associated course not found" });
        }

        if (
          course.instructorId !== req.user!.id &&
          req.user!.role !== "admin"
        ) {
          // Assert req.user exists
          return res.status(403).json({ message: "Forbidden" });
        }

        let finalDuration = duration ? parseInt(duration) : null;

        if (videoUrl) {
          try {
            const ffmpegModule = await import("fluent-ffmpeg");
            const ffprobeStatic = await import("ffprobe-static");
            const ffmpeg = ffmpegModule.default;
            ffmpeg.setFfprobePath(ffprobeStatic.path);

            const videoPath = videoUrl.startsWith("/uploads")
              ? path.join(projectRoot, videoUrl)
              : videoUrl;

            await new Promise<void>((resolve, reject) => {
              ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) return reject(err);
                if (metadata && metadata.format && metadata.format.duration) {
                  finalDuration = Math.floor(metadata.format.duration);
                }
                resolve();
              });
            });
          } catch (err) {
            console.error("Failed to extract video duration:", err);
          }
        }

        const newLesson = await storage.createLesson({
          moduleId,
          title,
          content: content || null,
          videoUrl: videoUrl || null,
          duration: duration || null,
          position
        });

        res.status(201).json(newLesson);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error creating lesson:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Assessment routes
  app.get(
    "/api/modules/:moduleId/assessments",
    isAuthenticated,
    async (req, res) => {
      try {
        const moduleId = parseInt(req.params.moduleId);
        if (isNaN(moduleId)) {
          return res.status(400).json({ message: "Invalid module ID" });
        }
        // Note: Prisma storage method handles potential null moduleId
        const assessments = await storage.getAssessmentsByModule(moduleId);

        res.json(assessments);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/api/assessments",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        // Zod validation removed
        // const assessmentData = insertAssessmentSchema.parse(req.body);
        const { title, description, moduleId, timeLimit, passingScore } =
          req.body;

        if (!title) {
          return res
            .status(400)
            .json({ message: "Assessment title is required" });
        }
        const moduleIdNum = moduleId ? parseInt(moduleId) : null;
        if (moduleId && isNaN(moduleIdNum as number)) {
          return res
            .status(400)
            .json({ message: "Invalid module ID provided" });
        }

        // If moduleId is provided, check if the module exists and permissions
        if (moduleIdNum) {
          const module = await storage.getModule(moduleIdNum);
          if (!module) {
            return res.status(404).json({ message: "Module not found" });
          }

          // Check if the user is the instructor of the course
          const course = await storage.getCourse(module.courseId);
          if (!course) {
            return res
              .status(404)
              .json({ message: "Associated course not found" });
          }

          if (
            course.instructorId !== req.user!.id &&
            req.user!.role !== "admin"
          ) {
            // Assert req.user exists
            return res.status(403).json({ message: "Forbidden" });
          }
        }

        const newAssessment = await storage.createAssessment({
          title,
          description: description || null,
          moduleId: moduleIdNum,
          timeLimit: timeLimit || null,
          passingScore: passingScore || null,
        });

        res.status(201).json(newAssessment);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error creating assessment:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Question routes
  app.get(
    "/api/assessments/:assessmentId/questions",
    isAuthenticated,
    async (req, res) => {
      try {
        const assessmentId = parseInt(req.params.assessmentId);
        if (isNaN(assessmentId)) {
          return res.status(400).json({ message: "Invalid assessment ID" });
        }
        const questions = await storage.getQuestionsByAssessment(assessmentId);

        res.json(questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/api/questions",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    async (req, res) => {
      try {
        // Zod validation removed
        // const questionData = insertQuestionSchema.parse(req.body);
        const {
          assessmentId,
          questionText,
          questionType,
          options,
          correctAnswer,
          explanation,
          points,
          position,
        } = req.body;

        if (
          typeof assessmentId !== "number" ||
          !questionText ||
          !questionType ||
          typeof position !== "number"
        ) {
          return res.status(400).json({
            message:
              "Valid assessmentId, questionText, questionType, and position are required",
          });
        }

        // Check if the assessment exists
        const assessment = await storage.getAssessment(assessmentId);
        if (!assessment) {
          return res.status(404).json({ message: "Assessment not found" });
        }

        // If the assessment is linked to a module, check permissions
        if (assessment.moduleId) {
          const module = await storage.getModule(assessment.moduleId);
          if (!module) {
            // Should not happen, but check anyway
            return res
              .status(404)
              .json({ message: "Associated module not found" });
          }

          const course = await storage.getCourse(module.courseId);
          if (!course) {
            return res
              .status(404)
              .json({ message: "Associated course not found" });
          }

          if (
            course.instructorId !== req.user!.id &&
            req.user!.role !== "admin"
          ) {
            // Assert req.user exists
            return res.status(403).json({ message: "Forbidden" });
          }
        }

        const newQuestion = await storage.createQuestion({
          assessmentId,
          questionText,
          questionType,
          options: options || Prisma.JsonNull, // Use Prisma.JsonNull if options is null/undefined
          correctAnswer: correctAnswer || null,
          explanation: explanation || null,
          points: points || 1,
          position,
        });

        res.status(201).json(newQuestion);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Assessment attempts
  app.post("/api/assessment-attempts", isAuthenticated, async (req, res) => {
    try {
      // Zod validation removed
      // const attemptData = insertAssessmentAttemptSchema.parse({ ... });
      const { assessmentId } = req.body;
      const userId = req.user!.id; // Assert req.user exists

      if (typeof assessmentId !== "number") {
        return res
          .status(400)
          .json({ message: "Valid assessmentId is required" });
      }

      // Check if the assessment exists
      const assessment = await storage.getAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      const newAttempt = await storage.createAssessmentAttempt({
        userId,
        assessmentId,
      });

      // Log the activity
      await storage.createActivityLog({
        userId: userId,
        action: "started_assessment",
        resourceType: "assessment",
        resourceId: assessmentId,
        metadata: {}, // Prisma expects JsonNull or an object
      });

      res.status(201).json(newAttempt);
    } catch (error) {
      // if (error instanceof z.ZodError) { ... }
      console.error("Error creating assessment attempt:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/assessment-attempts/:id", isAuthenticated, async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      if (isNaN(attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }
      const attempt = await storage.getAssessmentAttempt(attemptId);

      if (!attempt) {
        return res
          .status(404)
          .json({ message: "Assessment attempt not found" });
      }

      // Only allow the user who created the attempt to update it
      if (attempt.userId !== req.user!.id) {
        // Assert req.user exists
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData = req.body; // Use raw body for now
      const updatedAttempt = await storage.updateAssessmentAttempt(
        attemptId,
        updateData
      );

      if (!updatedAttempt) {
        return res
          .status(404)
          .json({ message: "Assessment attempt not found or update failed" });
      }

      // If the attempt is being marked as completed, log the activity
      if (updateData.status === "completed" && attempt.status !== "completed") {
        await storage.createActivityLog({
          userId: req.user!.id, // Assert req.user exists
          action: "completed_assessment",
          resourceType: "assessment",
          resourceId: attempt.assessmentId,
          metadata: { score: updateData.score }, // Ensure metadata is a valid JSON object
        });
      }

      res.json(updatedAttempt);
    } catch (error) {
      console.error("Error updating assessment attempt:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Group routes
  app.get('/api/groups', isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const groups = await storage.getGroups();

      const detailedGroups = await Promise.all(
        groups.map(async (group) => {
          const groupMembers = await storage.getGroupMembersByGroup(group.id);
          const groupCourses = await storage.getGroupCoursesByGroup(group.id);

          const users = (
            await Promise.all(
              groupMembers.map(async (member) => {
                const user = await storage.getUser(member.userId);
                return user ? { id: user.id, username: user.username } : null;
              })
            )
          ).filter(Boolean); // remove nulls

          const courses = (
            await Promise.all(
              groupCourses.map(async (entry) => {
                const course = await storage.getCourse(entry.courseId);
                return course ? { id: course.id, title: course.title } : null;
              })
            )
          ).filter(Boolean); // remove nulls

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            createdAt: group.createdAt,
            members: users,
            courses: courses,
          };
        })
      );

      res.json(detailedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  app.post('/api/groups', isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const { name, description, userIds = [], courseIds = [] } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Group name is required" });
      }

      // Create group
      const newGroup = await storage.createGroup({
        name,
        description: description || null,
      });

      // Link users to group
      if (Array.isArray(userIds) && userIds.length > 0) {
        await Promise.all(
          userIds.map((userId: number) =>
            storage.createGroupMember({ groupId: newGroup.id, userId })
          )
        );
      }

      // Link courses to group
      if (Array.isArray(courseIds) && courseIds.length > 0) {
        await Promise.all(
          courseIds.map((courseId: number) =>
            storage.createGroupCourse({ groupId: newGroup.id, courseId })
          )
        );
      }

      res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/groups/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { name, userIds = [], courseIds = [] } = req.body;

      // Update the group name
      await storage.updateGroup(groupId, { name });

      // Remove existing members & courses first
      await storage.deleteGroupMembers(groupId);
      await storage.deleteGroupCourses(groupId);

      // Add new members
      if (Array.isArray(userIds) && userIds.length > 0) {
        await Promise.all(
          userIds.map((userId: number) =>
            storage.createGroupMember({ groupId, userId })
          )
        );
      }

      // Add new courses
      if (Array.isArray(courseIds) && courseIds.length > 0) {
        await Promise.all(
          courseIds.map((courseId: number) =>
            storage.createGroupCourse({ groupId, courseId })
          )
        );
      }

      res.status(200).json({ message: 'Group updated successfully' });
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ message: 'Failed to update group' });
    }
  });

  app.delete('/api/groups/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
    const groupId = parseInt(req.params.id);

    if (isNaN(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    try {
      // Delete all group members and courses first
      await storage.deleteGroupMembersByGroupId(groupId);
      await storage.deleteGroupCoursesByGroupId(groupId);

      // Now delete the group itself
      const success = await storage.deleteGroup(groupId);

      if (!success) {
        return res.status(404).json({ message: 'Group not found or already deleted' });
      }

      res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



  // Group members
  app.get('/api/groups/:groupId/members', isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "Invalid group ID" });
      }
      const groupMembers = await storage.getGroupMembersByGroup(groupId);

      // TODO: Consider using Prisma include to fetch user details efficiently
      // For now, keep separate fetches
      const membersWithUserDetails = await Promise.all(
        groupMembers.map(async (member) => {
          const user = await storage.getUser(member.userId);
          // Explicitly handle null user case
          const { password, ...userWithoutPassword } = user ?? {};
          return {
            ...member,
            user: user ? userWithoutPassword : null,
          };
        })
      );

      res.json(membersWithUserDetails);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  );

  app.post(
    "/api/group-members",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        // Zod validation removed
        // const memberData = insertGroupMemberSchema.parse(req.body);
        const { groupId, userId } = req.body;

        if (typeof groupId !== "number" || typeof userId !== "number") {
          return res
            .status(400)
            .json({ message: "Valid groupId and userId are required" });
        }

        // Check if the group exists
        const group = await storage.getGroup(groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }

        // Check if the user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already a member of the group
        const groupMembers = await storage.getGroupMembersByGroup(groupId);
        const existingMember = groupMembers.find(
          (member) => member.userId === userId
        );

        if (existingMember) {
          return res
            .status(400)
            .json({ message: "User is already a member of this group" });
        }

        const newMember = await storage.createGroupMember({ groupId, userId });

        res.status(201).json(newMember);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error adding group member:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Course access
  app.post(
    "/api/course-access",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        // Zod validation removed
        // const accessData = insertCourseAccessSchema.parse(req.body);
        const { courseId, userId, groupId, accessType } = req.body;

        if (typeof courseId !== 'number' || !accessType || (!userId && !groupId)) {
          return res.status(400).json({ message: "Valid courseId, accessType, and either userId or groupId are required" });
        }
        if (userId && typeof userId !== 'number') {
          return res.status(400).json({ message: "Invalid userId provided" });
        }
        if (groupId && typeof groupId !== 'number') {
          return res.status(400).json({ message: "Invalid groupId provided" });
        }

        // Check if the course exists
        const course = await storage.getCourse(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        // Check if user or group exists
        if (userId) {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
        }

        if (groupId) {
          const group = await storage.getGroup(groupId);
          if (!group) {
            return res.status(404).json({ message: "Group not found" });
          }
        }

        const newAccess = await storage.createCourseAccess({
          courseId,
          userId: userId || null,
          groupId: groupId || null,
          accessType,
        });

        res.status(201).json(newAccess);
      } catch (error) {
        // if (error instanceof z.ZodError) { ... }
        console.error("Error granting course access:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Lesson progress
  app.post("/api/lesson-progress", isAuthenticated, async (req, res) => {
    try {
      // Zod validation removed
      // const progressData = insertLessonProgressSchema.parse({ ... });
      const { lessonId, status } = req.body;
      const userId = req.user!.id; // Assert req.user exists

      if (typeof lessonId !== "number" || !status) {
        return res
          .status(400)
          .json({ message: "Valid lessonId and status are required" });
      }

      // Check if the lesson exists
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Check if there's existing progress
      const userProgressItems = await storage.getLessonProgressByUser(userId);
      const existingProgress = userProgressItems.find(
        (progress) => progress.lessonId === lessonId
      );

      let progressResult;
      const progressInput = { userId, lessonId, status };

      if (existingProgress) {
        // Update existing progress
        progressResult = await storage.updateLessonProgress(
          existingProgress.id,
          progressInput
        );
        if (!progressResult) {
          // Handle potential update failure (e.g., record deleted between check and update)
          return res
            .status(404)
            .json({ message: "Lesson progress record not found for update" });
        }
      } else {
        // Create new progress
        progressResult = await storage.createLessonProgress(progressInput);
      }

      // Log the activity if completing the lesson
      if (status === "completed") {
        await storage.createActivityLog({
          userId: userId,
          action: "completed_lesson",
          resourceType: "lesson",
          resourceId: lessonId,
          metadata: {}, // Prisma expects JsonNull or an object
        });

        // Update course enrollment progress
        const module = await storage.getModule(lesson.moduleId);
        if (module) {
          const userEnrollments = await storage.getEnrollmentsByUser(userId);
          const enrollment = userEnrollments.find(
            (enr) => enr.courseId === module.courseId
          );

          if (enrollment) {
            // --- Corrected Progress Calculation ---
            // 1. Get all modules for the course
            const allModules = await storage.getModulesByCourse(
              module.courseId
            );
            const allModuleIds = allModules.map((m) => m.id);

            // 2. Get all lessons for all modules in the course
            let allLessonsInCourse: Lesson[] = [];
            for (const modId of allModuleIds) {
              const lessons = await storage.getLessonsByModule(modId);
              allLessonsInCourse = allLessonsInCourse.concat(lessons);
            }
            const totalLessonsInCourse = allLessonsInCourse.length;

            // 3. Get all completed lesson progress records for the user in this course
            // Use the specific function if available, otherwise filter all progress
            // Assuming getLessonProgressByUserAndCourse exists and is efficient:
            const courseProgressRecords =
              await storage.getLessonProgressByUserAndCourse(
                userId,
                module.courseId
              );
            const completedLessonsInCourse = courseProgressRecords.filter(
              (p) => p.status === "completed"
            ).length;

            // 4. Calculate overall progress percentage
            const progressPercentage =
              totalLessonsInCourse > 0
                ? Math.round(
                  (completedLessonsInCourse / totalLessonsInCourse) * 100
                )
                : 0; // Avoid division by zero if course has no lessons

            // 5. Update enrollment with correct progress and completion status
            await storage.updateEnrollment(enrollment.id, {
              progress: progressPercentage,
              completedAt: progressPercentage === 100 ? new Date() : null,
            });

            // Auto-create certificate if completed and not exists
            if (progressPercentage === 100) {
              console.log(
                "Progress is 100%, checking for existing certificate..."
              );
              const existingCerts = await storage.getCertificatesByUser(userId);
              const existing = existingCerts.find(
                (c) => c.courseId === module.courseId
              );
              if (!existing) {
                console.log(
                  "No existing certificate found, creating new certificate..."
                );
                const crypto = await import("crypto");
                const certHash = crypto.randomBytes(16).toString("hex");
                await storage.createCertificate({
                  userId,
                  courseId: module.courseId,
                  certificateId: certHash,
                  issueDate: new Date(),
                  certificateUrl: null,
                });
                console.log("Certificate created with ID:", certHash);
              } else {
                console.log(
                  "Certificate already exists for this user and course."
                );
              }
            }
            // --- End Corrected Progress Calculation ---
          }
        }
      }

      res.status(201).json(progressResult);
    } catch (error) {
      // if (error instanceof z.ZodError) { ... }
      console.error("Error updating lesson progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Category Management Routes
  app.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(
    "/api/categories",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ message: "Category name is required" });
        }

        const newCategory = await storage.createCategory({ name });
        res.status(201).json(newCategory);
      } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.put(
    "/api/categories/:id",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);
        const { name } = req.body;

        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }

        if (!name) {
          return res.status(400).json({ message: "Category name is required" });
        }

        const updatedCategory = await storage.updateCategory(categoryId, {
          name,
        });
        if (!updatedCategory) {
          return res.status(404).json({ message: "Category not found" });
        }

        res.json(updatedCategory);
      } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.delete(
    "/api/categories/:id",
    isAuthenticated,
    hasRole(["admin"]),
    async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }

        const deleted = await storage.deleteCategory(categoryId);
        if (!deleted) {
          return res.status(404).json({ message: "Category not found" });
        }

        res.status(204).send();
      } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Activity logs
  app.get("/api/activity-logs", isAuthenticated, async (req, res) => {
    try {
      const activityLogs = await storage.getActivityLogsByUser(req.user!.id); // Assert req.user exists
      res.json(activityLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Lesson Progress Route ---
  app.get(
    "/api/courses/:courseId/progress",
    isAuthenticated,
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        const userId = req.user!.id; // Assert user exists

        if (isNaN(courseId)) {
          return res.status(400).json({ message: "Invalid course ID" });
        }

        const progress = await storage.getLessonProgressByUserAndCourse(
          userId,
          courseId
        );
        res.json(progress);
      } catch (error) {
        console.error("Error fetching lesson progress:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  // --- End Lesson Progress Route ---

  // --- Video Upload Route ---
  app.post(
    "/api/upload/video",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    uploadVideo.single("video"),
    (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded." });
      }
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      res
        .status(201)
        .json({ message: "Video uploaded successfully", videoUrl });
    }
  );

  // --- Image Upload Route ---
  app.post(
    "/api/upload/image",
    isAuthenticated,
    hasRole(["contributor", "admin"]),
    uploadImage.single("image"),
    (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded." });
      }
      const url = `/uploads/course-images/${req.file.filename}`;
      res.status(201).json({ message: "Image uploaded successfully", url });
    }
  );
  // --- End Upload Routes ---

  // --- Certificate Creation Route ---
  app.post("/api/certificates/:courseId", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Check if user completed the course
      const enrollments = await storage.getEnrollmentsByUser(req.user!.id);
      const enrollment = enrollments.find((e) => e.courseId === courseId);
      if (!enrollment || enrollment.progress < 100) {
        return res.status(403).json({ message: "Course not completed" });
      }

      // Check if certificate already exists
      const existingCerts = await storage.getCertificatesByUser(req.user!.id);
      const existing = existingCerts.find((c) => c.courseId === courseId);
      if (existing) {
        return res.json({ certificateId: existing.id });
      }

      // Generate unique hash ID
      const crypto = await import("crypto");
      const certHash = crypto.randomBytes(16).toString("hex");

      // Create certificate
      const newCert = await storage.createCertificate({
        userId: req.user!.id,
        courseId,
        certificateId: certHash,
        issueDate: new Date(),
        certificateUrl: null,
      });

      res.json({ certificateId: certHash });
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Public Certificate PDF by Certificate ID ---
  app.get("/public/certificate/:certificateId", async (req, res) => {
    try {
      const certId = req.params.certificateId;
      const cert = await storage.getCertificateByHash(certId);
      if (!cert) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      const course = await storage.getCourse(cert.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const user = await storage.getUser(cert.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const PDFDocument = (await import("pdfkit")).default;
      const doc = new PDFDocument({ size: "A4", layout: "landscape" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="certificate-${certId}.pdf"`
      );

      doc.pipe(res);

      const certImagePath = path.join(
        projectRoot,
        "uploads",
        "certificate-template.png"
      );
      if (fs.existsSync(certImagePath)) {
        doc.image(certImagePath, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        });
      }

      doc
        .fontSize(30)
        .fillColor("black")
        .text("Certificate of Completion", {
          align: "center",
          valign: "center",
        });
      doc.moveDown(2);
      doc
        .fontSize(24)
        .text(`${user.firstName || ""} ${user.lastName || ""}`.trim(), {
          align: "center",
        });
      doc.moveDown(1);
      doc
        .fontSize(20)
        .text(`has successfully completed the course`, { align: "center" });
      doc.moveDown(1);
      doc.fontSize(24).text(`${course.title}`, { align: "center" });
      doc.moveDown(2);
      doc
        .fontSize(16)
        .text(`Issued on: ${cert.issueDate.toLocaleDateString()}`, {
          align: "center",
        });

      // Add certificate ID at bottom-right corner immediately after background
      doc.fontSize(10).fillColor("gray").text(`Certificate ID: ${certId}`, doc.page.width - 300, doc.page.height - 90, {
        allign: "right",
        width: "250"
      });

      doc.end();
    } catch (error) {
      console.error("Error generating public certificate:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Certificate PDF by Certificate ID ---

  // --- Certificate PDF Generation Route ---
  // --- End Certificate PDF Generation Route ---

  // --- Get User Certificates Route ---
  app.get("/api/certificates-user", isAuthenticated, async (req, res) => {
    try {
      const certs = await storage.getCertificatesByUser(req.user!.id);
      res.json(certs);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // --- End Get User Certificates Route ---

  // Add the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
