import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, Share2, Calendar, FileText } from "lucide-react";

export default function Certificates() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const certificates = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      issueDate: "August 15, 2023",
      instructor: "John Doe",
      courseHours: 8,
      certificateId: "CERT-JS-001",
    },
    {
      id: 2,
      title: "HTML & CSS Basics",
      issueDate: "July 24, 2023",
      instructor: "Robert Brown",
      courseHours: 5,
      certificateId: "CERT-HTML-002",
    },
    {
      id: 3,
      title: "Introduction to TypeScript",
      issueDate: "June 10, 2023",
      instructor: "Emily Davis",
      courseHours: 7,
      certificateId: "CERT-TS-003",
    },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Certificates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and manage your earned certificates
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4">
                <div className="flex justify-center">
                  <Award className="h-12 w-12 text-amber-400" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center">{certificate.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span>Issue Date:</span>
                    </div>
                    <span className="font-medium">{certificate.issueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-slate-400 mr-2" />
                      <span>Certificate ID:</span>
                    </div>
                    <span className="font-medium">{certificate.certificateId}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Instructor:</span>
                    <span className="font-medium">{certificate.instructor}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Course Duration:</span>
                    <span className="font-medium">{certificate.courseHours} hours</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-4">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {certificates.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Award className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Certificates Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Complete courses to earn certificates that showcase your skills and achievements.
            </p>
            <Button>Browse Courses</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}