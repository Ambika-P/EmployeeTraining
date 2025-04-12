import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CourseCard } from "@/components/dashboard/course-card";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { Filter, BookOpen, CheckSquare, Clock, Medal, Video, Award, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const currentDate = format(new Date(), "MMMM d, yyyy");
  const [, navigate] = useLocation();



  // Fetch enrollments for the current user
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  // Fetch activity logs for the current user
  const { data: activityLogs, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
    enabled: !!user,
  });

  // In a real app, we would use these values from the API
  const statsData = {
    enrolled: enrollments?.length || 0,
    completed: enrollments?.filter(e => e.completedAt)?.length || 0,
    inProgress: enrollments?.filter(e => !e.completedAt)?.length || 0,
    certificates: enrollments?.filter(e => e.completedAt)?.length || 0,
  };

  // Mock data for demo purposes - in a real application, this would come from API
  const inProgressCourses = enrollments?.filter((e: any) => e.progress < 100).slice(0, 3) || [];
  const recommendedCourses = [];

  return (
    <MainLayout>
      {/* Dashboard header */}
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl dark:text-white">Dashboard</h1>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </div>
              <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {currentDate}
              </div>
            </div>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button variant="outline" onClick={() => navigate('/course-catalog')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Explore Courses
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Enrolled Courses"
            value={statsData.enrolled}
            icon={BookOpen}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            linkText="View all"
            linkHref="/my-courses"
          />
          
          <StatsCard
            title="Completed"
            value={statsData.completed}
            icon={CheckSquare}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            linkText="View certificates"
            linkHref="/certificates"
          />
          
          <StatsCard
            title="In Progress"
            value={statsData.inProgress}
            icon={Clock}
            iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600 dark:text-yellow-400"
            linkText="Continue learning"
            linkHref="/my-courses"
          />
          
          <StatsCard
            title="Certificates"
            value={statsData.certificates}
            icon={Medal}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            linkText="View all"
            linkHref="/certificates"
          />
        </div>
        
        {/* In progress section */}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {enrollmentsLoading ? (
            <div className="col-span-3 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : inProgressCourses.length > 0 ? (
            inProgressCourses.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                id={enrollment.courseId}
                title={enrollment.course.title}
                description={enrollment.course.description}
                thumbnailUrl={enrollment.course.thumbnail}
                progress={enrollment.progress}
                rating={4.8}
                isInProgress={true}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No courses in progress</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Start learning by enrolling in a course.
              </p>
              <div className="mt-6">
                <Button>
                  Browse Courses
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Upcoming deadlines and recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming deadlines */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Upcoming Deadlines</h2>
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Mock data for deadlines - would be fetched from API in real application */}
                <div className="p-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        <FileText className="text-slate-600 dark:text-slate-300 text-lg" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Module Assessment: React Hooks</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">React Fundamentals</div>
                      </div>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Due in 2 days
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        <FileText className="text-slate-600 dark:text-slate-300 text-lg" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Final Project: Vue.js Application</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vue.js for Beginners</div>
                      </div>
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      Due in 5 days
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        <FileText className="text-slate-600 dark:text-slate-300 text-lg" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Data Analysis Report</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Python Data Analysis</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Due in 8 days
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6">
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">View all deadlines</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent activity */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {activitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  activityLogs.slice(0, 3).map((activity) => {
                    let icon, iconBgColor, iconColor, title;
                    
                    switch (activity.action) {
                      case 'watched_video':
                        icon = Video;
                        iconBgColor = 'bg-blue-100 dark:bg-blue-900/30';
                        iconColor = 'text-blue-600 dark:text-blue-400';
                        title = `Watched "${activity.metadata.title || 'Video'}"`;
                        break;
                      case 'completed_lesson':
                        icon = CheckSquare;
                        iconBgColor = 'bg-green-100 dark:bg-green-900/30';
                        iconColor = 'text-green-600 dark:text-green-400';
                        title = `Completed "${activity.metadata.title || 'Lesson'}"`;
                        break;
                      case 'earned_badge':
                        icon = Award;
                        iconBgColor = 'bg-purple-100 dark:bg-purple-900/30';
                        iconColor = 'text-purple-600 dark:text-purple-400';
                        title = `Earned "${activity.metadata.title || 'Badge'}"`;
                        break;
                      default:
                        icon = Video;
                        iconBgColor = 'bg-blue-100 dark:bg-blue-900/30';
                        iconColor = 'text-blue-600 dark:text-blue-400';
                        title = `Activity: ${activity.action}`;
                    }
                    
                    return (
                      <ActivityItem
                        key={activity.id}
                        icon={icon}
                        iconBgColor={iconBgColor}
                        iconColor={iconColor}
                        title={title}
                        subtitle={activity.metadata.courseName || ''}
                        timestamp={new Date(activity.createdAt)}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">View activity log</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommended courses */}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mock data for recommended courses - would be fetched from API in real application */}
          <CourseCard
            id={101}
            title="TypeScript Essentials"
            description="Learn type safety and advanced TypeScript features."
            thumbnailUrl="https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
            rating={4.9}
            isInProgress={false}
          />
          
          <CourseCard
            id={102}
            title="Node.js Microservices"
            description="Build scalable backend services with Node.js."
            thumbnailUrl="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
            rating={4.7}
            isInProgress={false}
          />
          
          <CourseCard
            id={103}
            title="Machine Learning Basics"
            description="Introduction to ML algorithms and applications."
            thumbnailUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
            rating={4.8}
            isInProgress={false}
          />
          
          <CourseCard
            id={104}
            title="AWS Cloud Fundamentals"
            description="Core AWS services and cloud architecture basics."
            thumbnailUrl="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80"
            rating={4.6}
            isInProgress={false}
          />
        </div>
      </div>
    </MainLayout>
  );
}
